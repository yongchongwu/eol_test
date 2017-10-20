/*
 * @Author: Xavier Yin
 * @Date:   2016-09-06 22:11:59
 * @Last Modified by:   laixi
 * @Last Modified time: 2016-09-08 19:23:14
 */
+ function(deps) {
  var jim = deps.jim;
  var _ = jim._;
  var loader = jim.loader;

  var _reduce = _.reduce;
  var _values = _.values;
  var _each = _.each;
  var _partial = _.partial;

  loader.module('stars.core', function(require, exports, module) {

    var PI = Math.PI;
    var pow = Math.pow;
    var sqrt = Math.sqrt;
    var abs = Math.abs;
    var ceil = Math.ceil;
    var max = Math.max;
    var min = Math.min;

    var calculateOpacityIncreRate = function(opacity, steps) {
      if (steps < 1) {
        steps = 1;
      }
      return sqrt(1 / opacity, steps);
    };

    var calculateOpacityDecreRate = function(opacity, steps) {
      if (steps < 1) {
        steps = 1;
      }
      return sqrt(opacity, steps);
    };

    // 计算斜边
    var calculateC = function(a, b) {
      return sqrt(pow(b.x - a.x, 2) + pow(b.y - a.y, 2), 2);
    };

    // 计算斜率
    var calculateK = function(a, b) {
      return (a.y - b.y) / (a.x - b.x);
    };

    // 根据 x 坐标计算 y 坐标
    var calculateY = function(k, a, x) {
      return k * (x - a.x) + a.y;
    };

    // 根据斜边计算 x 坐标
    var calculateXIncrement = function(k, c) {
      return sqrt(pow(c, 2) / (pow(k, 2) + 1));
    };

    var cache = null;

    var main = function(options) {
      if (!cache) {
        if (!options) options = {};

        var canvas = options.canvas;
        var backdropSource = options.backdropSource;
        var lineIncrement = options.lineIncrement || 1;
        var maxStars = options.maxStars || 30;
        var coordinates = options.coordinates || {};
        var cities = _values(coordinates);

        var requestAnimationFrame = window.requestAnimationFrame;

        var canvasWidth = canvas.width;
        var canvasHeight = canvas.height;

        // get canvas 2d context
        var ctx = canvas.getContext('2d');
        // use destination-over
        // ctx.globalCompositeOperation = 'destination-over';

        // prepare image of backdrop
        var backdrop = new Image();
        if (backdropSource) {
          backdrop.src = backdropSource;
        }

        // 清空画布
        var clearCanvas = function() {
          ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        };

        // 绘制透明底层
        var drawTransparentRect = function() {
          ctx.fillStyle = 'rgba(255,255,255,0.1)';
          ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        };

        // 绘制背景图
        var drawBackdrop = function() {
          if (backdropSource) {
            var height = backdrop.height;
            var width = backdrop.width;
            if (height) {
              var ratio = backdrop.width / backdrop.height;
              var _width = canvasWidth;
              var _height = width / ratio;
              if (_height > canvasHeight) {
                _height = canvasHeight;
                _width = _height * ratio;
              }
              ctx.drawImage(backdrop, 0, 0, _width, _height);
            }
          }
        };


        var Star = function(a, b) {
          this.x = a.x;
          this.y = a.y;
          this.dx = b.x;
          this.dy = b.y;
          this.k = calculateK(a, b);
          // this.distance = calculateC(a, b);
          this.distanceX = abs(b.x - a.x);
          this.direction = b.x - a.x > 0 ? 1 : b.x === a.x ? 0 : -1;
          this.increment = this.direction * calculateXIncrement(this.k, lineIncrement);
          this.radius = 2;
          var steps = ceil(abs(this.distanceX / this.increment));
          this.steps = steps;
          this.currentStep = 0;
          this.opacity = 0.2;
          this.opacityIncreRate = calculateOpacityIncreRate(this.opacity, steps / 6);
          this.opacityDecreRate = calculateOpacityDecreRate(this.opacity, steps / 2);
        };

        Star.prototype.getOpacity = function() {
          var d = this.steps / 2 - this.currentStep;
          var rate = null;
          var base = null;
          if (this.currentStep / this.steps < 0.65) {
            return min(1, this.opacity * pow(this.opacityIncreRate, abs(d)));
          } else {
            return max(0.35, pow(this.opacityDecreRate, abs(d)));
          }
        };

        Star.prototype.getFillStyle = function() {
          var a  = 'rgba(255,255,255,' + this.getOpacity() + ')';
          return a;
        };


        var starsCache = [];

        var drawStar = function(star) {
          var order = 0;
          var direction = star.direction;
          var starX = star.x;
          var k = star.k;
          var x = starX;
          var y = star.y;
          var radius = star.radius;

          var offset = 3 * star.currentStep / star.steps;
          offset = min(1.2, 1.2 * min(1, offset));

          while (radius > 0.01) {
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, PI * 2, true);
            ctx.closePath();
            ctx.fillStyle = star.getFillStyle();
            ctx.fill();

            radius *= (23 / 24);
            x -= (calculateXIncrement(k, offset * radius) * direction);
            y = calculateY(k, star, x);
          }
        };

        var cityStyle = {
          1: {
            radius: 3,
            lineWidth: 6,
            fillStyle: 'rgb(255,255,255)',
            strokeStyle: 'rgba(255,255,255,0.3)'
          },

          2: {
            radius: 4,
            lineWidth: 8,
            fillStyle: 'rgb(255,246,0)',
            strokeStyle: 'rgba(255,246,0,0.3)'
          },

          3: {
            radius: 5,
            lineWidth: 10,
            fillStyle: 'rgb(0,252,255)',
            strokeStyle: 'rgba(0,252,255,0.3)'
          },

          4: {
            radius: 6,
            lineWidth: 12,
            fillStyle: 'rgb(255,0,0)',
            strokeStyle: 'rgba(255,0,0,0.4)'
          }
        };

        // {x: 542, y: 105, level: 1}
        var drawCity = function(city) {
          var style = cityStyle[city.level] || cityStyle['1'];

          var cr = city.radius || 0;
          var sr = style.radius;
          var incre = city.incre || 0;
          var radius = cr || sr;

          if (city.blinks) {
            if (cr === 0) {
              incre = sr / 40;
            } else {
              if (radius > sr * 1.3) {
                incre = -1 * sr / 40;
              }
              if (radius < sr * 0.9) {
                incre = sr / 40;
              }
            }
            city.radius = radius + incre;
            city.incre = incre;
          }

          radius += incre;

          ctx.beginPath();
          ctx.arc(city.x, city.y, radius, 0, 2 * PI, false);
          ctx.fillStyle = style.fillStyle;
          ctx.fill();
          ctx.lineWidth = style.lineWidth;
          ctx.strokeStyle = style.strokeStyle;
          ctx.stroke();
        };

        var enableCityBlink = function(city) {
          if (city.blinks) {
            city.blinks += 1;
          } else {
            city.blinks = 1;
            city.radius = 0;
            city.incre = 0;
          }
          setTimeout(_partial(disableCityBlink, city), 2000);
        };

        var disableCityBlink = function(city) {
          city.blinks -= 1;
          if (city.blinks <= 0) {
            city.radius = 0;
            city.incre = 0;
          }
        };


        var sentenceStar = function(star) {
          var i = star.increment;
          var x = star.x;
          var dx = star.dx;
          if ((i > 0 && x < dx) || (i < 0 && x > dx)) {
            return star;
          } else {
            return null;
          }
        };

        var animate = function() {
          clearCanvas();
          drawBackdrop();

          _each(cities, drawCity);

          var lives = _reduce(starsCache, function(memo, star) {
            star.x += star.increment;
            star.y = calculateY(star.k, {
              x: star.dx,
              y: star.dy
            }, star.x);
            star.currentStep += 1;
            if (sentenceStar(star)) {
              drawStar(star);
              memo.push(star);
            }
            return memo;
          }, []);
          starsCache = lives;
          requestAnimationFrame(animate);
        };

        var hasStarted = false;
        var start = function() {
          if (!hasStarted) {
            hasStarted = true;
            animate();
          }
          return this;
        };

        cache = {
          start: start,
          shoot: function(a, b) {
            if (hasStarted) {
              if (starsCache.length < maxStars) {
                starsCache.push(new Star(a, b));
                enableCityBlink(a);
                enableCityBlink(b);
              }
            }
          }
        };
      }
      return cache;
    };

    module.exports = {
      main: main
    };

  });

}(this);
/*
* @Author: mumian
* @Date:   2016-09-08 09:59:59
* @Last Modified by:   mumian
* @Last Modified time: 2016-09-08 19:30:23
*/
var _bind = _.bind; 
var footer = {

  fetch: function(options){
    if(!this.intervalBrand || !this.intervalProduct){
      this.intervalBrand = options.intervalBrand || null;
      this.intervalProduct = options.intervalProduct || null;
    }
    if(this.xhr){
      this.xhr.abort();
    }
    this.xhr = $.ajax({
      type: 'GET',
      url: options.url,
      dataType: 'json',
      success: _bind(this.success,this),
      error: function(){
        console.log('error');
      }
    });
    return this.xhr;
  },
  success: function(data){
    var product = data.product;
    var brand = data.brand;
    var users = data.users;
    this.topProduct(product);
    this.topBrand(brand);
    this.usersInfo(users);
  },

  $productEl: $('.hot-goods-wrap'),

  $brandEl: $('.hot-brand-wrap'),

  productTem: _.template('<li class="clear"><div class="list-first fl"><%- data.number %></div><div class="list-second fl"><%- data.title %></div><div class="list-third fr"><%- data.order_amt_paid %></div></li>'),

  brandTme: _.template('<li class="clear"><div class="list-first fl"><%- data.number %></div><div class="list-second fl"><%- data.title %></div><div class="list-third fr"><%- data.order_amt_paid %></div></li>'),
  /*
  *填充top 10 热销品牌榜
  */
  topProduct: function(data){
    this.$productEl.find('.sale-data-list ul').html(''); //清空数据
    if(this.intervalProduct){
      clearInterval(this.intervalProduct);
    }
    for(var i = 0; i < data.length; i++){
      data[i].number = i + 1;
      if(i < 5){
        this.$productEl.find('.sale-data-list ul').eq(0).append(this.productTem({
          data: data[i]
        }));
      }else{
        this.$productEl.find('.sale-data-list ul').eq(1).append(this.productTem({
          data: data[i]
        }));
      }
    }
    this.intervalProduct = this.switchFun(this.$productEl);
  },
  /*
  *填充top 10 热销商品榜
  */
  topBrand: function(data){
    this.$brandEl.find('.sale-data-list ul').html('');//清空数据
    if(this.intervalBrand){
      clearInterval(this.intervalBrand);
    }
    for(var i = 0; i < data.length; i++){
      data[i].number = i + 1;
      if(i < 5){
        this.$brandEl.find('.sale-data-list ul').eq(0).append(this.productTem({
          data: data[i]
        }));
      }else{
        this.$brandEl.find('.sale-data-list ul').eq(1).append(this.productTem({
          data: data[i]
        }));
      }
    }
    this.intervalBrand = this.switchFun(this.$brandEl);
  },
  /*
  *top 10 切换效果
  */
  switchFun: function(el){
    var $el = el.find('.sale-data-list');
    $el.eq(0).removeClass('hide').addClass('show');//初始化
    $el.eq(1).removeClass('show').addClass('hide');
    var interval = setInterval(function(){
      if($el.eq(0).hasClass('show')){
        $el.removeClass('show').addClass('hide');
        $el.eq(1).removeClass('hide').addClass('show');
      }else{
        $el.eq(1).removeClass('show').addClass('hide');
        $el.eq(0).removeClass('hide').addClass('show');
      }
    },3000);
    return interval;
  },
  /*
  *新老用户
  */
  usersInfo: function(data){
    var userWrap = $(".user-wrap");
    var peoMark = $(".peo-mark");
    var oldUser = $(".old-user");
    var newUser = $(".new-user");
    var ratio = 2.75;
    var oldRate = data.old_users_rate;
    var oldSlice = oldRate.replace(/%/g, "");
    var blueLine = ratio * oldSlice;
    var yellowLine = 275 - blueLine;
    oldUser.find('.deal-price').html(data.old_users_worth);//老用户成交额
    oldUser.find('.percentum').html(oldRate);//老用户比例
    userWrap.find('.blue-line').css('width', blueLine + 'px');
    userWrap.find('.yellow-line').css('width', yellowLine + 'px');
    newUser.find('.deal-price').html(data.new_users_worth);//新用户成交额
    newUser.find('.percentum').html(data.new_users_rate);//新用户比例
    peoMark.css('background-size',''+ data.old_users_rate +' 61px');
  }
};
/*
 * @Author: laixi
 * @Date:   2016-09-07 15:41:20
 * @Last Modified by:   laixi
 * @Last Modified time: 2016-09-08 16:06:35
 */
+ function(deps) {
  var jim = deps.jim;
  var loader = jim.loader;

  var _isNumber = _.isNumber;
  var _isNaN = _.isNaN;

  loader.module('stars.main', function(require, exports, module) {
    var starsModule = require('stars.core');
    var cache = null;
    var main = function(options) {
      if (!cache) {
        if (!options) options = {};

        var coordinates = options.coordinates || {};

        var appStars = starsModule.main(options);

        var startApi = function() {
          appStars.start();
        };

        var shootApi = function(start, end) {
          var a = coordinates[start];
          var b = coordinates[end];
          if (a && b && a !== b) {
            appStars.shoot(a, b);
          }
        };

        var setLevelApi = function(cityName, level) {
          level = level * 1;
          var city = coordinates[cityName];
          if (city && _isNumber(level) && !_isNaN(level)) {
            city.level = level;
          }
          return this;
        };

        cache = {
          start: startApi,
          shoot: shootApi,
          setLevel: setLevelApi
        };
      }
      return cache;
    };
    module.exports = {
      main: main
    };
  });
}(this);