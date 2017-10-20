# EOL_TEST
Development Site for [*EOL*](https://github.com/datacamp-tor/EOL)

## Dialogue
- [Folder Structure](#folder-structure)
- [Installation](#installation)
- [Back End](#back-end)
- [Storage](#storage)
- [Front End](#front-end)
- [Deployment](#deployment)

### Folder Structure

```sh
 |- app
  |- js ( Search Page ReactJs)
  |- static ( Front end library js, icons and images )
  |- templates ( Front end html pages )
  |- [more files] ( Back end logic and app settings )
 |- app.sqlite ( User Info Storage )
 |- manage.py ( Start point )
 |- package.json ( ReactJs Module Dependency )
 |- requirements.txt ( Python Environment Dependency )
 |- webpack.config.js ( Search Page Js Compiler )
```

### Installation

#### 1. [*Install python3*](https://www.python.org/downloads/)
#### 2. Install & Create & Activate virtual environment
```sh
$ cd .../EOL_TEST
$ pip3 install virtualenv
$ virtualenv -p python3 venv
$ source venv/bin/activate
$ pip3 install -r requirements.txt
```
#### 3. Activate flask server
```sh
$ python3 manage.py
```

#### 4. Deactivate virtual Environment
```sh
$ deactivate
```

#### 5. [Install NodeJs and Update Npm](https://docs.npmjs.com/getting-started/installing-node)


#### 6. Install ReactJs modules
```sh
$ npm install
```

### Back End

#### 1. [Flask](http://flask.pocoo.org/docs/0.12/)

### [Storage](47.92.85.234:5601)

#### 1. [Elasticsearch](https://www.elastic.co/guide/en/elasticsearch/reference/5.3/index.html) Settings & Mapping Example
```sh
PUT professors
{
  "settings":{
    "analysis": {
      "char_filter": {
         "replace": {
          "type": "mapping",
          "mappings": [
            "&=> and "
          ]
        }
      },
      "filter": {
        "word_delimiter" : {
          "type" : "word_delimiter",
          "split_on_numerics" : false,
          "split_on_case_change" : true,
          "generate_word_parts" : true,
          "generate_number_parts" : true,
          "catenate_all" : true,
          "preserve_original":true,
          "catenate_numbers":true
        }
      },
      "analyzer": {
        "default": {
          "type": "custom",
          "char_filter": [
            "html_strip",
            "replace"
          ],
          "tokenizer": "whitespace",
          "filter": [
              "lowercase",
              "word_delimiter"
          ]
        }
      }
    }
  },
  "mappings": {
    "logs": {
      "properties": {
        "index":  {
          "type": "integer"
        },
        "university":  {
          "type": "keyword",
          "fields" : {          
              "raw" : {
                "type" : "keyword",
                "index" : "not_analyzed"
              }
          }
        },
        "university_chinese":  {
          "type": "keyword",
          "fields" : {          
              "raw" : {
                "type" : "keyword",
                "index" : "not_analyzed"
              }
          }
        },
        "url":{
          "type":"text"
        },
        "photo":{
          "type":"text"
        },
        "name":  {
          "type": "text"
        },
        "email":{
          "type":"text"
        },
        "title":  {
          "type": "keyword",
          "fields" : {          
              "raw" : {
                "type" : "keyword",
                "index" : "not_analyzed"
              }
          }
        },
        "title_chinese":  {
          "type": "keyword",
          "fields" : {          
              "raw" : {
                "type" : "keyword",
                "index" : "not_analyzed"
              }
          }
        },
        "tag":  {
          "type": "keyword",
          "fields" : {          
              "raw" : {
                "type" : "keyword",
                "index" : "not_analyzed"
              }
          }
        },
        "tag_chinese":  {
          "type": "keyword",
          "fields" : {          
              "raw" : {
                "type" : "keyword",
                "index" : "not_analyzed"
              }
          }
        },
        "state":  {
          "type": "keyword",
          "fields" : {          
              "raw" : {
                "type" : "keyword",
                "index" : "not_analyzed"
              }
          }
        },
        "state_chinese":  {
          "type": "keyword",
          "fields" : {          
              "raw" : {
                "type" : "keyword",
                "index" : "not_analyzed"
              }
          }
        },
        "country":  {
          "type": "keyword",
          "fields" : {          
              "raw" : {
                "type" : "keyword",
                "index" : "not_analyzed"
              }
          }
        },
        "country_chinese":  {
          "type": "keyword",
          "fields" : {          
              "raw" : {
                "type" : "keyword",
                "index" : "not_analyzed"
              }
          }
        },
        "academic_rank":  {
          "type": "integer",
          "ignore_malformed": true
        },
        "university_rank":  {
          "type": "integer",
          "ignore_malformed": true
        },
        "age":  {
          "type": "integer",
          "ignore_malformed": true
        },
        "phone":{
          "type":"text"
        },
        "department_chinese":{
          "type": "keyword",
          "fields" : {          
              "raw" : {
                "type" : "keyword",
                "index" : "not_analyzed"
              }
          }
        },
        "publication_google":{
          "type":"text"
        },
        "education":{
          "type":"text"
        },
        "zone_1":  {
          "type": "integer",
          "ignore_malformed": true
        },
        "zone_2":  {
          "type": "integer",
          "ignore_malformed": true
        },
        "zone_3":  {
          "type": "integer",
          "ignore_malformed": true
        },
        "zone_4":  {
          "type": "integer",
          "ignore_malformed": true
        },
        "zone_unknown":{
          "type": "integer",
          "ignore_malformed": true
        },
        "url_linkedin":{
          "type":"text"
        },
        "photo_linkedin":{
          "type":"text"
        },
        "status_linkedin":{
          "type":"text"
        },
        "company_linkedin":{
          "type":"text"
        },
        "summary_linkedin":{
          "type":"text"
        },
        "experience_linkedin":{
          "type":"text"
        },
        "education_linkedin":{
          "type":"text"
        },
        "have_linkedin":{
          "type": "integer",
          "ignore_malformed": true
        },
        "have_google":{
          "type": "integer",
          "ignore_malformed": true
        },
        "have_zone_1":{
          "type": "keyword",
          "fields" : {          
              "raw" : {
                "type" : "keyword",
                "index" : "not_analyzed"
              }
          }
        },
        "have_zone_2":{
          "type": "keyword",
          "fields" : {          
              "raw" : {
                "type" : "keyword",
                "index" : "not_analyzed"
              }
          }
        },
        "have_zone_3":{
          "type": "keyword",
          "fields" : {          
              "raw" : {
                "type" : "keyword",
                "index" : "not_analyzed"
              }
          }
        },
        "have_zone_4":{
          "type": "keyword",
          "fields" : {          
              "raw" : {
                "type" : "keyword",
                "index" : "not_analyzed"
              }
          }
        },
        "have_zone_unknown":{
          "type": "keyword",
          "fields" : {          
              "raw" : {
                "type" : "keyword",
                "index" : "not_analyzed"
              }
          }
        },
        "publication":{
          "type":"text"
        },
        "research":{
          "type":"text"
        }
      }
    }  
  }
}
```

#### 2. [Logstash](https://www.elastic.co/guide/en/logstash/5.3/index.html) configuration file example
```sh
$ cat university.conf
input {
	file {
		path => "/data/eol_data/Other_500/other_500.csv"
		start_position => "beginning"

	}
}

filter {
	csv {
		separator => ","
		columns => [ 'index',
 					 'universityName',
					 'universityNameChinese',
					 'url',
					 'photo',
					 'name',
					 'email',
					 'title',
					 'titleChinese',
					 'phone',
					 'work',
					 'research',
					 'publication',
					 'isProfessor',
					 'isChinese',
					 'tag',
					 'tagChinese',
					 'state',
					 'stateChinese',
					 'country',
					 'AcademicRank',
					 'UniversityRank',
					 'titleRank'
		]
	}
}

output {
	elasticsearch {
		hosts => "http://172.26.8.226:9200"
    action => "index"
		index => "professors"
	}
stdout {}
}
$ bin/logstash -f university.conf
```

#### 3. [Kibana](https://www.elastic.co/guide/en/kibana/5.3/index.html)

### Front End

#### 1. [Searchkit](http://docs.searchkit.co/v0.10.0/)

#### 2. compile search page ReactJs
```sh
$ webpack
```
### Deployment

#### 1. [Digital Ocean Tutorial](https://www.digitalocean.com/community/tutorials/how-to-serve-flask-applications-with-gunicorn-and-nginx-on-ubuntu-14-04)
#### 2. [Gunicorn](http://gunicorn.org/)
#### 3. [Nginx](https://www.nginx.com/resources/wiki/)
#### 4. Ubuntu 14.04 on Aliyun
#### 5. [*Test Site*](http://47.92.85.234:8001/)
