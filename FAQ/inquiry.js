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

var connection = mysql.createPool({
    host: dbconn.host,
    port: dbconn.port,
    user: dbconn.user,
    password: dbconn.password,
    database: dbconn.database
});

exports.getFAQ = function(req, res){
    res.sendFile(__dirname + "/qna1.html");
};

exports.getInquiry = function(req, res){
    var id = req.signedCookies.loginObj;
    //년,월,일/시,분,초 구하는 부분
    var date = new Date();
    var year = date.getFullYear();
    var month = ('0' + (date.getMonth() + 1)).slice(-2);
    var day = ('0' + date.getDate()).slice(-2);
    var hours = ('0' + date.getHours()).slice(-2);
    var minutes = ('0' + date.getMinutes()).slice(-2);
    var seconds = ('0' + date.getSeconds()).slice(-2);

    var DateTime = year + '-' + month  + '-' + day + " " + hours + ':' + minutes  + ':' + seconds;
    if(id) {
        connection.query('SELECT * FROM member WHERE mem_id = ?', [id], function(error, results) {
            var username = results[0].name;
            var email = results[0].email;
            res.render('inquiry.ejs', {
                'name': username,
                'email': email,
                'time': DateTime
            });
        })  
    }
    else {
        res.send("<script>alert('이용하시려면 로그인을 하셔야 됩니다.');location.href='login';</script>");
    }
};

exports.getInquiryList = function(req, res){
    var id = req.signedCookies.loginObj;
    connection.query('SELECT * FROM member WHERE mem_id = ?', [id], function(error, results) {
        var names = results[0].name;
        connection.query('SELECT * FROM inquiry WHERE iname=?',[names], function(error, rows){
            var drows = 0;
            if(rows){
                res.render('inquirylist.ejs', {
                    'rows': rows
                });
            }
            else {
                res.render('inquirylist.ejs', {
                    'rows': drows
                });
            }
        });
    })
};

exports.delete = function(req, res){
    var row = req.body.indelete;
    connection.query('SELECT * FROM inquiry', function(error, results) {
        var data = results[row].icontent;
        connection.query('DELETE FROM inquiry WHERE icontent = ?', [data], function(error, results) {
            if (error) return console.log(error);
        });
        res.send("<script>location.href='inquiryAdmin';</script>"); 
    });
};

exports.inquiry = function(req, res){
    var ititle = req.body.intitle;
    var icontent = req.body.incon;
    if(ititle) {
        if(icontent) {
            var id = req.signedCookies.loginObj;
            connection.query('SELECT * FROM member WHERE mem_id = ?', [id], function(error, results) {
                var iname = results[0].name;
                var iemail = results[0].email;

                var date = new Date();
                var year = date.getFullYear();
                var month = ('0' + (date.getMonth() + 1)).slice(-2);
                var day = ('0' + date.getDate()).slice(-2);
                var hours = ('0' + date.getHours()).slice(-2);
                var minutes = ('0' + date.getMinutes()).slice(-2);
                var seconds = ('0' + date.getSeconds()).slice(-2);
                var itime = year + '-' + month  + '-' + day + " " + hours + ':' + minutes  + ':' + seconds;

                connection.query('INSERT INTO inquiry (iname, iemail, itime, ititle, icontent, answer) VALUES(?,?,?,?,?,?)', [iname, iemail, itime, ititle, icontent, 0],
                    function (error, data) {
                        if (error) return console.log(error);
                    });
                res.send("<script>alert('문의가 완료되었습니다.'); location.href='myinfo';</script>"); 
            });
        }
        else {
            res.send("<script>alert('문의 내용을 입력하세요'); history.back();</script>"); 
        }
    }
    else {
        res.send("<script>alert('문의 제목을 입력하세요'); history.back();</script>"); 
    }
};

exports.comment = function(req, res){
    var row = req.body.incomment;
    connection.query('SELECT * FROM inquiry', function(error, results) {
        var content = results[row].icontent;
        res.render('changeinquiry.ejs',{
            'row': row,
            'content' : content
        });
    });
};

exports.commentA = function(req, res){
    var comment = req.body.inqcomment;
    var value = req.body.inqvalue;
    connection.query('SELECT * FROM inquiry', function(error, results) {
        var data = results[value].icontent;
        var answer = 1;
        connection.query('UPDATE inquiry SET answer= ?, icomment=? WHERE icontent= ?', [answer,comment,data], function(error, results) {
            if(error) return console.log(error);
        });
        res.send("<script>location.href='inquiryAdmin';</script>"); 
    });
};