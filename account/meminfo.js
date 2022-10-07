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

exports.getMyInfo = function(req, res){
    var id = req.signedCookies.loginObj;
    if(id) {
        connection.query('SELECT * FROM member WHERE mem_id = ?', [id], function(error, results) {
            var username = results[0].name;
            var usernickname = results[0].nickname;
            var useremail = results[0].email;
            var access = results[0].access;
            res.render('myinfo.ejs', {
                'id': id,
                'name': username,
                'nickname': usernickname,
                'email': useremail,
                'access': access
            });
        });
    }
    else {
        res.send("<script>alert('이용하시려면 로그인을 하셔야 됩니다.');location.href='login';</script>");
    } 
};

exports.getForgetPw = function(req, res) {
    res.sendFile(__dirname + "/forgetpassword.html");
};

exports.getChangePW = function(req, res){
    res.sendFile(__dirname + "/changepassword.html");
};

exports.getCheckPW = function(req, res){
    res.sendFile(__dirname + "/checkpassword.html");
};

exports.getChangeEmail = function(req, res){
    res.sendFile(__dirname + "/changeemail.html");
};

exports.getChangeNick = function(req, res){
    res.sendFile(__dirname + "/changenick.html");
};

exports.forgetPW = function(req, res){
    var id = req.body.fgid;
    var name = req.body.fgname;
    var email = req.body.fgemail;
    if(id && name && email) {
        connection.query('SELECT * FROM member WHERE mem_id = ?', [id], function(error, results) {
            if(error) return console.log(error);

            if(results.length > 0) {
                connection.query('SELECT * FROM member WHERE name = ?', [name], function(error, results) {
                    if(error) return console.log(error);
        
                    if(results.length > 0) {
                        connection.query('SELECT * FROM member WHERE email = ?', [email], function(error, results) {
                            if(error) return console.log(error);
                
                            if(results.length > 0) {
                                var expireDate = new Date(Date.now() + 60 * 60 * 250);
                                res.cookie('chi', id, { expires: expireDate, httpOnly: true, signed: true});
                                res.send("<script>location.href='changepassword';</script>");
                            }
                            else {
                                res.send("<script>alert('이메일이 틀립니다.'); history.back(); </script>");
                            }
                        });
                    }
                    else {
                        res.send("<script>alert('이름이 틀립니다.'); history.back(); </script>");
                    }
                });
            }
            else {
                res.send("<script>alert('아이디가 틀립니다.'); history.back(); </script>");
            }
        });
    }
    else {
        res.send("<script>alert('모든 정보를 입력하세요'); history.back();</script>"); 
    }
};

exports.changePW = function(req, res){
    var id = req.signedCookies.chi;
    var pw = req.body.chpw;
    var pw_c = req.body.chpw_c;
    if(id) {
        if(pw && pw_c) {
            if(pw == pw_c) {
                connection.query('SELECT * FROM member WHERE mem_id = ?', [id], function(error, results) {
                    var dbpw = results[0].password;
                    var dbsalt = results[0].salt;
                    if(pw == dbpw) {
                        res.send("<script>alert('이전과 동일한 비밀번호는 사용할 수 없습니다.');history.back();</script>");
                    }
                    else {
                        var hashPassword = crypto.createHash("sha512").update(pw + dbsalt).digest("hex");
                        res.clearCookie("loginObj");
                        connection.query('UPDATE member SET password= ? WHERE mem_id= ?', [hashPassword,id], function(error, results) {
                            if(error) return console.log(error);
                        });
                        res.clearCookie("chi");
                        res.send("<script>alert('비밀번호가 변경되었습니다. 다시 로그인해주세요.');location.href='index';</script>");
                    }
                });
            }
            else {
                res.send("<script>alert('비밀번호가 서로 일치하지 않습니다.'); history.back(); </script>");
            }
        }
        else {
            res.send("<script>alert('모든 정보를 입력하세요'); history.back();</script>"); 
        }
    }
    else {
        res.send("<script>alert('시간이 초과되어 처음부터 진행해주세요.');location.href='forgetpassword';  </script>"); 
    }
};

exports.checkPW = function(req, res){
    var id = req.signedCookies.loginObj;
    var pw = req.body.ckpw;
    if(pw) {
        connection.query('SELECT * FROM member WHERE mem_id = ?', [id], function(error, results) {
            var dbpw = results[0].password;
            var dbsalt = results[0].salt;
            var hashPassword = crypto.createHash("sha512").update(pw + dbsalt).digest("hex");
            if(dbpw == hashPassword) {
                var expireDate = new Date(Date.now() + 60 * 60 * 250);
                res.cookie('chi', id, { expires: expireDate, httpOnly: true, signed: true});
                res.send("<script>location.href='changepassword';</script>");
            }
            else {
                res.send("<script>alert('비밀번호가 틀립니다.'); history.back();</script>");
            }
        });
    }
    else {
        res.send("<script>alert('비밀번호를 입력하세요'); history.back();</script>"); 
    }
};

exports.changeEmail = function(req, res){
    var id = req.signedCookies.loginObj;
    var email = req.body.chem;
    if(email) {
        connection.query('SELECT * FROM member WHERE email = ?', [email], function(error, results) {
            if(results.length == 0) {
                connection.query('UPDATE member SET email= ? WHERE mem_id= ?', [email,id], function(error, results) {
                    if(error) return console.log(error);
                });
                res.send("<script>alert('이메일이 변경되었습니다.');location.href='myinfo';</script>");
            }
            else {
                res.send("<script>alert('이미 사용중인 이메일 입니다.');history.back();</script>");
            }
        });
    }
    else {
        res.send("<script>alert('이메일을 입력하세요'); history.back();</script>"); 
    }
};

exports.changeNick = function(req, res){
    var id = req.signedCookies.loginObj;
    var nick = req.body.chnic;
    if(nick) {
        connection.query('SELECT * FROM member WHERE nickname = ?', [nick], function(error, results) {
            if(results.length == 0) {
                connection.query('UPDATE member SET nickname= ? WHERE mem_id= ?', [nick,id], function(error, results) {
                    if(error) return console.log(error);
                });
                res.send("<script>alert('닉네임이 변경되었습니다.');location.href='myinfo';</script>");
            }
            else {
                res.send("<script>alert('이미 사용중인 닉네임 입니다.');history.back();</script>");
            }
        });
    }
    else {
        res.send("<script>alert('닉네임을 입력하세요'); history.back();</script>"); 
    }
};