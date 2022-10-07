var express = require('express');
var mysql = require('mysql');
var dbconn = require('../config/dbConfig')
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

var app = express();

app.use(cookieParser('fnaklsdasjkl'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

var connection = mysql.createPool({
    host: dbconn.host,
    port: dbconn.port,
    user: dbconn.user,
    password: dbconn.password,
    database: dbconn.database
});

exports.getMessage = function(req, res){
    var id = req.signedCookies.loginObj;
    if(id) {
        connection.query('SELECT * FROM member WHERE mem_id = ?', [id], function(error, results) {
                var nickname = results[0].nickname;
                connection.query('SELECT * FROM message WHERE toWriter=? or fromWriter=?',[nickname,nickname], function(error, rows){
                    var date = new Date();
                    var year = date.getFullYear();
                    var month = ('0' + (date.getMonth() + 1)).slice(-2);
                    var day = ('0' + date.getDate()).slice(-2);
                    var DateTime = year + month + day;
                    var drows = 0;
                    if(rows){
                        res.render('message.ejs', {
                            'rows': rows,
                            'mynick': nickname,
                            'datetime': DateTime
                        });
                    }
                    else {
                        res.render('message.ejs', {
                            'rows': drows,
                            'mynick': nickname,
                            'datetime': DateTime
                        });
                    }
                });
            })
    }
    else {
        res.send("<script>alert('이용하시려면 로그인을 하셔야 됩니다.');location.href='login';</script>");
    }
};