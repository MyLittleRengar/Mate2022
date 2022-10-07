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

exports.signup = function(req, res){
    var id = req.body.userID;
    var pw = req.body.password;
    var pw_c = req.body.password_c;
    var name = req.body.name;
    var email = req.body.email;
    var nickname = req.body.nickname;
    var gender = req.body.gender;
    var gen_num = true;
    var salt = Math.round((new Date().valueOf() * Math.random())) + "";
    var hashPassword = crypto.createHash("sha512").update(pw + salt).digest("hex");

    //년,월,일/시,분,초 구하는 부분
    var date = new Date();
    var year = date.getFullYear();
    var month = ('0' + (date.getMonth() + 1)).slice(-2);
    var day = ('0' + date.getDate()).slice(-2);
    var hours = ('0' + date.getHours()).slice(-2);
    var minutes = ('0' + date.getMinutes()).slice(-2);
    var seconds = ('0' + date.getSeconds()).slice(-2);
    var DateTime = year + '-' + month  + '-' + day + " " + hours + ':' + minutes  + ':' + seconds;

    if ( id && pw && pw_c && name && email && nickname && gender ) {
        if( gender == 'men' ){ gen_num = false; } 
        else{ gen_num = true; }
        if(pw == pw_c){
            connection.query('SELECT * FROM member WHERE mem_id = ?', [id], function(error, results) {
            if (error) return console.log(error);
            if (results.length == 0) {
                connection.query('SELECT * FROM member WHERE nickname = ?', [nickname], function(error, results) {
                if(results.length == 0){
                    connection.query('SELECT * FROM member WHERE email = ?', [email], function(error, results) {
                        if(results.length == 0){
                            //access는 관리자 페이지 접속권한 [1=관리자/0=일반회원]
                            connection.query('INSERT INTO member (mem_id, password, salt, name, email, nickname, gender, signupTime, access, certify) VALUES(?,?,?,?,?,?,?,?,?,?)',
                            [id, hashPassword, salt, name, email, nickname, gen_num, DateTime, 0, 0],
                            function (error, data) {
                                if (error) return console.log(error);
                            });
                            var expireDate = new Date(Date.now() + 60 * 60 * 1000 *24);
                            res.cookie('regist', email, { expires: expireDate, httpOnly: true, signed: true});
                            res.send("<script>alert('회원가입을 환영합니다!');location.href='certifyMail';</script>");
                        } 
                        else {
                            res.send("<script>alert('이미 존재하는 이메일 입니다.'); history.back();</script>");                             
                        }
                    });
                } 
                else{
                    res.send("<script>alert('이미 존재하는 닉네임 입니다.'); history.back();</script>"); 
                }
                });
            } 
            else {
                res.send("<script>alert('이미 존재하는 아이디 입니다.'); history.back();</script>"); 
            } 
            });
        } else {
            res.send("<script>alert('비밀번호가 일치하지 않습니다.'); history.back();</script>"); 
        } 
    } 
    else {
        res.send("<script>alert('모든 정보를 입력하세요'); history.back();</script>"); 
    }
};

exports.unregist = function(req, res){
    var id = req.signedCookies.loginObj;
    var pw = req.body.unrpw;
    if(pw) {
        connection.query('SELECT * FROM member WHERE mem_id = ?', [id], function(error, results) {
            if (error) return console.log(error);

            if (results.length > 0) {
                var dbPassword = results[0].password;
                var salt = results[0].salt;
                var hashPassword = crypto.createHash("sha512").update(pw + salt).digest("hex");
                if(dbPassword == hashPassword) {
                    res.clearCookie("loginObj");
                    connection.query('DELETE FROM member WHERE mem_id = ?', [id], function(error, results) {
                        if (error) return console.log(error);
                    });
                    res.send("<script>alert('정상적으로 회원탈퇴가 처리되었습니다.');location.href='index';</script>");
                }
                else {
                    res.send("<script>alert('비밀번호가 틀립니다.'); history.back();</script>");
                }
            }
        });
    }
    else {
        res.send("<script>alert('비밀번호를 입력해주세요.'); history.back();</script>");
    }
};

exports.getSignup = function(req, res) {
    res.sendFile(__dirname + "/signup.html");
};

exports.getUnregister = function(req, res) {
    res.sendFile(__dirname + "/unregister.html");
};

exports.getCertify = function(req, res) {
    var email = req.signedCookies.regist;
    if(email) {
        connection.query('SELECT * FROM member WHERE email = ?', [email], function(error, results) {
                var cname = results[0].TJTjname;
                var cemail = results[0].email;
                res.render('certifymail.ejs',{
                    'name': cname,
                    'email': cemail
                });
            });
    }
    else {
        res.send("<script>alert('회원가입을 먼저 하셔야 됩니다.');location.href='term';</script>");
    }
};

exports.getCertify2 = function(req, res) {
    var email = req.signedCookies.regist;
    if(email) {
        connection.query('SELECT * FROM member WHERE email = ?', [email], function(error, results) {
                var cname = results[0].name;
                var cemail = results[0].email;
                res.render('certifymail2.ejs',{
                    'name': cname,
                    'email': cemail
                });
            });
    }
    else {
        res.send("<script>alert('회원가입을 먼저 하셔야 됩니다.');location.href='term';</script>");
    }
};

exports.getTerm = function(req, res){
    res.sendFile(__dirname + "/term.html");
};

exports.getCheckTerm = function(req, res){
    res.sendFile(__dirname + "/checkterm.html");
};

exports.getCheckPrivacy = function(req, res){
    res.sendFile(__dirname + "/checkprivacy.html");
};