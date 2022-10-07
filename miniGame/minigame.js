var express = require('express');
var mysql = require('mysql');
var dbconn = require('./dbConfig')
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

exports.getMinigame = function(req, res){
    if(req.signedCookies.loginObj) {
        res.sendFile(__dirname + "/minigame.html");
    }
    else {
        res.send("<script>alert('이용하시려면 로그인을 하셔야 됩니다.');location.href='login';</script>");
    } 
};

exports.getladdergame = function(req, res){
    if(req.signedCookies.loginObj) {
        res.sendFile(__dirname + "/laddergame.html");
    }
    else {
        res.send("<script>alert('이용하시려면 로그인을 하셔야 됩니다.');location.href='login';</script>");
    } 
};

exports.getRoulettegame = function(req, res){
    if(req.signedCookies.loginObj) {
        res.sendFile(__dirname + "/roulettegame.html");
    }
    else {
        res.send("<script>alert('이용하시려면 로그인을 하셔야 됩니다.');location.href='login';</script>");
    } 
};