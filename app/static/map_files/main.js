/*
 * @Author: laixi
 * @Date:   2016-09-08 09:29:53
 * @Last Modified by:   laixi
 * @Last Modified time: 2016-09-08 16:10:34
 */

$(function() {

  // 启用地图

//   var loader = jim.loader;
//
//
//   loader.ready(['stars.main'], function(starsMain) {
//
//     // 这里配置城市坐标点（自己算一下城市在图片上的坐标）
//     var geo = {
//       '新疆': {
//         x: 122,
//         y: 186
//       },
//       '甘肃': {
//         x: 230,
//         y: 202
//       },
//       '青海': {
//         x: 230,
//         y: 261
//       },
//       '西藏': {
//         x: 166,
//         y: 317
//       },
//       '宁夏': {
//         x: 330,
//         y: 241
//       },
//       '四川': {
//         x: 296,
//         y: 320,
//         level: 1
//       },
//       '云南': {
//         x: 280,
//         y: 393
//       },
//       '陕西': {
//         x: 364,
//         y: 264
//       },
//       '重庆': {
//         x: 345,
//         y: 328
//       },
//       '贵州': {
//         x: 333,
//         y: 366
//       },
//       '广西': {
//         x: 357,
//         y: 400
//       },
//       '海南': {
//         x: 366,
//         y: 450
//       },
//       '湖南': {
//         x: 379,
//         y: 354
//       },
//       '山西': {
//         x: 392,
//         y: 224
//       },
//       '河南': {
//         x: 403,
//         y: 283
//       },
//       '湖北': {
//         x: 395,
//         y: 317,
//         level: 2
//       },
//       '广东': {
//         x: 407,
//         y: 402,
//         level: 2
//       },
//       '内蒙古': {
//         x: 425,
//         y: 151
//       },
//       '北京': {
//         x: 437,
//         y: 201,
//         level: 2
//       },
//       '天津': {
//         x: 444,
//         y: 219
//       },
//       '河北': {
//         x: 420,
//         y: 234
//       },
//       '山东': {
//         x: 449,
//         y: 253
//       },
//       '江苏': {
//         x: 468,
//         y: 294
//       },
//       '安徽': {
//         x: 441,
//         y: 307
//       },
//       '上海': {
//         x: 487,
//         y: 316
//       },
//       '浙江': {
//         x: 471,
//         y: 340
//       },
//       '江西': {
//         x: 425,
//         y: 354
//       },
//       '福建': {
//         x: 450,
//         y: 375,
//         level: 1
//       },
//       '台湾': {
//         x: 478,
//         y: 400,
//         level: 1
//       },
//       '辽宁': {
//         x: 500,
//         y: 186
//       },
//       '黑龙江': {
//         x: 542,
//         y: 105,
//         level: 1
//       },
//       '吉林': {
//         x: 531,
//         y: 156
//       }
//     };
//
//     var stars = starsMain.main({
//       canvas: document.getElementById('china-map'),
//       maxStars: 60,
//       //starColor: 'rgba(255, 255, 255, 0.8)', // 更改流星颜色
//       coordinates: geo, // 预置城市坐标
//       lineIncrement: 6 // 调整每帧流星划过的直线距离（调速度在这里）
//     });
//
//     stars.start();
//
//     var cities = _.keys(geo);
//     var length = cities.length;
//     var rand = function() {
//       return cities[Math.ceil(Math.random() * length)];
//     };
//
//     var runSample = function() {
//       var a = null;
//       var b = null;
//
//       for (var i = 0; i < 5; i++) {
//         a = rand();
//         b = rand();
//         stars.shoot(a, b);
//       }
//
//       setTimeout(runSample, 500);
//     };
//
//     runSample();
//   });
  
  /*
  * 启动footer数据
  */
    var intervalBrand = footer.switchFun($('.hot-state-wrap'));
	var intervalProduct = footer.switchFun($('.hot-university-wrap'));
    var intervalUniversity = footer.switchFun($('.hot-tag-wrap'));
    setInterval(function() {
        footer.fetch({
            url: '/monitor/ajax_opt/action/users_rank',
            intervalBrand:intervalBrand,
            intervalProduct:intervalProduct,
			intervalUniversity:intervalUniversity,
        });
    },20000)
});