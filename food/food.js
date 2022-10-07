var express = require('express');
var mysql = require('mysql');
var dbconn = require('./dbConfig')
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var crypto = require('crypto'); //비밀번호 암호화

var app = express();

app.use(cookieParser('fnaklsdasjkl'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(express.static('public'));

app.set('view engine','ejs');

var connection = mysql.createPool({
    host: dbconn.host,
    port: dbconn.port,
    user: dbconn.user,
    password: dbconn.password,
    database: dbconn.database
});

exports.Schoolfood = function(req, res) {
    var id = req.signedCookies.loginObj;
    var food = '학식';
    connection.query('SELECT * FROM food_list WHERE category = ?', [food], function(error, results) {
        connection.query('SELECT * FROM food_list', function(error, result){
            var length = result.length;
            var random1 = Math.floor(Math.random() * length + 0);
            var random2 = Math.floor(Math.random() * length + 0);
            var random3 = Math.floor(Math.random() * length + 0);
            var random4 = Math.floor(Math.random() * length + 0);
            var random5 = Math.floor(Math.random() * length + 0);
            var random6 = Math.floor(Math.random() * length + 0);
            var random7 = Math.floor(Math.random() * length + 0);
            var food1_1 = result[random1].restaurant;
            var food1_2 = result[random1].menu;
            var food1 = food1_1 + " - " + food1_2;
            if(id) {
                res.render('food.ejs',{
                    'food' : food,
                    'rows' : results,
                    'food1' : food1,
                    'food2' : food1,
                    'food3' : food1,
                    'food4' : food1,
                    'food5' : food1,
                    'food6' : food1,
                    'food7' : food1
                });
            }
            else {
                res.send("<script>alert('이용하시려면 로그인을 하셔야 됩니다.');location.href='login';</script>");
            }
        });
    });
};

exports.Koreanfood = function(req, res) {
    var id = req.signedCookies.loginObj;
    var food = '한식';
    connection.query('SELECT * FROM food_list WHERE category = ?', [food], function(error, results) {
        if(id) {
            res.render('food.ejs',{
                'food' : food,
                'rows' : results
            });
        }
        else {
            res.send("<script>alert('이용하시려면 로그인을 하셔야 됩니다.');location.href='login';</script>");
        }
    });
};

exports.Chinesefood = function(req, res) {
    var id = req.signedCookies.loginObj;
    var food = '중식';
    connection.query('SELECT * FROM food_list WHERE category = ?', [food], function(error, results) {
        if(id) {
            res.render('food.ejs',{
                'food' : food,
                'rows' : results
            });
        }
        else {
            res.send("<script>alert('이용하시려면 로그인을 하셔야 됩니다.');location.href='login';</script>");
        }
    });
};

exports.Japanesefood = function(req, res) {
    var id = req.signedCookies.loginObj;
    var food = '일식';
    connection.query('SELECT * FROM food_list WHERE category = ?', [food], function(error, results) {
        if(id) {
            res.render('food.ejs',{
                'food' : food,
                'rows' : results
            });
        }
        else {
            res.send("<script>alert('이용하시려면 로그인을 하셔야 됩니다.');location.href='login';</script>");
        }
    });
};

exports.Westernfood = function(req, res) {
    var id = req.signedCookies.loginObj;
    var food = '양식';
    connection.query('SELECT * FROM food_list WHERE category = ?', [food], function(error, results) {
        if(id) {
            res.render('food.ejs',{
                'food' : food,
                'rows' : results
            });
        }
        else {
            res.send("<script>alert('이용하시려면 로그인을 하셔야 됩니다.');location.href='login';</script>");
        }
    });
};

exports.Streetfood = function(req, res) {
    var id = req.signedCookies.loginObj;
    var food = '분식';
    connection.query('SELECT * FROM food_list WHERE category = ?', [food], function(error, results) {
        if(id) {
            res.render('food.ejs',{
                'food' : food,
                'rows' : results
            });
        }
        else {
            res.send("<script>alert('이용하시려면 로그인을 하셔야 됩니다.');location.href='login';</script>");
        }
    });
};

exports.Asianfood = function(req, res) {
    var id = req.signedCookies.loginObj;
    var food = '아시안식';
    connection.query('SELECT * FROM food_list WHERE category = ?', [food], function(error, results) {
        if(id) {
            res.render('food.ejs',{
                'food' : food,
                'rows' : results
            });
        }
        else {
            res.send("<script>alert('이용하시려면 로그인을 하셔야 됩니다.');location.href='login';</script>");
        }
    });
};

exports.Fastfood = function(req, res) {
    var id = req.signedCookies.loginObj;
    var food = '패스트푸드';
    connection.query('SELECT * FROM food_list WHERE category = ?', [food], function(error, results) {
        if(id) {
            res.render('food.ejs',{
                'food' : food,
                'rows' : results
            });
        }
        else {
            res.send("<script>alert('이용하시려면 로그인을 하셔야 됩니다.');location.href='login';</script>");
        }
    });
};

exports.recommendFood = function(req, res) {
    connection.query('SELECT * FROM food_list', function(error, results){
        var length = results.length;
        var random = Math.floor(Math.random() * length + 0);
        var category = results[random].category;
        var restaurant = results[random].restaurant;
        var menu = results[random].menu;
        var foodexplain = results[random].foodexplain;
        var price = results[random].price;
        res.render('recommendMenu.ejs',{
                'category' : category,
                'restaurant': restaurant,
                'menu': menu,
                'foodexplain': foodexplain,
                'price': price
        });
    });
};