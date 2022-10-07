var express = require('express');
var mysql = require('mysql');
var dbconn = require('./config/dbConfig');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var nodemailer = require('nodemailer');
var ejs = require('ejs');

var loginAPI = require('./account/login'); //파일화
var signupAPI = require('./account/signup');
var meminfoAPI = require('./account/meminfo');

var inquiryAPI = require('./FAQ/inquiry');

var boardAPI = require('./board/board');
var messageAPI = require('./message/message');

var miniGameAPI = require('./miniGame/minigame');

var foodAPI = require('./food/food');

var app = express();

const port = app.listen(process.env.PORT || 5050);
app.use(cookieParser('fnaklsdasjkl'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(require('express-status-monitor')());

var connection = mysql.createPool({
    host: dbconn.host,
    port: dbconn.port,
    user: dbconn.user,
    password: dbconn.password,
    database: dbconn.database
});

app.use(express.static('public'));

app.set('view engine','ejs');

app.get("/", function(req, res) {
    if(req.signedCookies.loginObj) {
        res.sendFile(__dirname + "/index.html");
    }
    else {
        res.sendFile(__dirname + "/default.html");
    }
});

app.get("/index", function(req, res) {
    if(req.signedCookies.loginObj) {
        res.sendFile(__dirname + "/index.html");
    }
    else {
        res.sendFile(__dirname + "/default.html");
    }
});

app.get("/login", loginAPI.getLogin);
app.get("/logout", loginAPI.getLogout);

app.post('/login',loginAPI.login);

app.get('/signup', signupAPI.getSignup);
app.get('/unregister', signupAPI.getUnregister);
app.get('/certifyMail', signupAPI.getCertify);
app.get('/certifyMail2', signupAPI.getCertify2);

app.post('/signup', signupAPI.signup);
app.post('/unregister', signupAPI.unregist);

app.get('/term', signupAPI.getTerm);
app.get('/checkterm', signupAPI.getCheckTerm);
app.get('/checkprivacy', signupAPI.getCheckPrivacy);

app.get('/myinfo', meminfoAPI.getMyInfo);
app.get('/forgetpassword', meminfoAPI.getForgetPw);
app.get('/changepassword', meminfoAPI.getChangePW);
app.get('/checkpassword', meminfoAPI.getCheckPW);
app.get('/changeemail', meminfoAPI.getChangeEmail);
app.get('/changenick', meminfoAPI.getChangeNick);

app.post('/forgetpassword', meminfoAPI.forgetPW);
app.post('/changepassword', meminfoAPI.changePW);
app.post('/checkpassword', meminfoAPI.checkPW);
app.post('/changeemail', meminfoAPI.changeEmail);
app.post('/changenick', meminfoAPI.changeNick);

app.get('/FAQ', inquiryAPI.getFAQ);
app.get('/inquiry', inquiryAPI.getInquiry);
app.get('/inquirylist', inquiryAPI.getInquiryList);

app.post('/inquiry', inquiryAPI.inquiry);
app.post('/inquirydelete', inquiryAPI.delete);
app.post('/inquirycomment', inquiryAPI.comment);
app.post('/inquirycommentA', inquiryAPI.commentA);

app.get('/message', messageAPI.getMessage);

app.get('/minigame', miniGameAPI.getMinigame);
app.get("/laddergame", miniGameAPI.getladdergame);
app.get("/roulettegame", miniGameAPI.getRoulettegame);

app.get('/board_list', boardAPI.getBoard_list);
app.get('/board_write', boardAPI.getBoard_write);
app.get('/notice_list', boardAPI.getNotice_list); 
app.get('/notice_write', boardAPI.getNotice_write);

app.post('/board_write', boardAPI.board_write);
app.post('/notice_write', boardAPI.notice_write);

app.get('/detail/:listNum', boardAPI.getDetail);
app.get('/modify/:listNum', boardAPI.getModify);

app.get('/boardSearch', boardAPI.boaSearch);
app.get('/noticeSearch', boardAPI.notSearch);

app.post('/modify/:listNum',boardAPI.modify);
app.post('/:listNum/comment', boardAPI.comment_list);
app.post('/delete/:listNum', boardAPI.delete);
app.post('/comment/delete', boardAPI.commentDelete);

app.get("/recommendFood", foodAPI.recommendFood);
app.get('/Schoolfood', foodAPI.Schoolfood);
app.get('/Koreanfood', foodAPI.Koreanfood);
app.get('/Chinesefood', foodAPI.Chinesefood);
app.get('/Japanesefood', foodAPI.Japanesefood);
app.get('/Westernfood', foodAPI.Westernfood);
app.get('/Streetfood', foodAPI.Streetfood);
app.get('/Asianfood', foodAPI.Asianfood);
app.get('/Fastfood', foodAPI.Fastfood);

app.post('/foodDetail', function(req, res) {
    var fres = req.body.foodValue1;
    var fmenu = req.body.foodValue2;
    connection.query('SELECT * FROM food_list WHERE restaurant=? AND menu=?', [fres,fmenu], function(error, results) {
        var foodCat = results[0].category;
        var foodRes = results[0].restaurant;
        var foodMenu = results[0].menu;
        var foodPrice = results[0].price;
        var foodExp = results[0].foodexplain;
        var foodAdd = results[0].address;
        var foodTel = results[0].telephone;
        var foodLocation = results[0].location;
        let [latitude, blongitude] = foodLocation.split(', ');
        var longitude = blongitude.substr(0, 9);
        res.render('foodDetail.ejs', {
                'foodCat': foodCat,
                'foodRes': foodRes,
                'foodMenu': foodMenu,
                'foodPrice': foodPrice,
                'foodExp': foodExp,
                'foodAdd': foodAdd,
                'foodTel': foodTel,
                'latitude': latitude,
                'longitude': longitude
        });
    });
});

app.post('/messageSend', function(req, res) {
    var to = req.body.messSend;
    var from = req.signedCookies.loginObj;
    res.render('messagesend.ejs',{
        'to': to,
        'from': from
    });
});

app.post('/reportBoard', function(req, res) {
    var reporter = req.body.reporter;
    var toreport = req.body.toreport;
    var reportContent = req.body.reportContent;
    var reportReason = req.body.reportReason;
    var date = new Date();
    var year = date.getFullYear();
    var month = ('0' + (date.getMonth() + 1)).slice(-2);
    var day = ('0' + date.getDate()).slice(-2);
    var hours = ('0' + date.getHours()).slice(-2);
    var minutes = ('0' + date.getMinutes()).slice(-2);
    var seconds = ('0' + date.getSeconds()).slice(-2);
    var DateTime = year + '-' + month  + '-' + day + " " + hours + ':' + minutes  + ':' + seconds;

    if(reportReason) {
        connection.query('INSERT INTO report (reporter, reportTime, reportContent, target, reportreason, answer) VALUES(?,?,?,?,?,?)', 
            [reporter, DateTime, reportContent, toreport, reportReason, 0],
                function (error, results) {
                        if (error) return console.log(error);
        });
         res.send("<script>alert('신고가 접수되었습니다.');location.href='board_list';</script>");
    }
    else {
        res.send("<script>alert('신고 사유를 입력하세요'); history.back();</script>")
    }
});

app.post('/boardReport', function(req, res) {
    var reportValue = req.body.boardReport;
    var id = req.signedCookies.loginObj;
    connection.query('SELECT * FROM member WHERE mem_id = ?', [id], function(error, results) {
        var reporter = results[0].nickname;
        connection.query('SELECT * FROM board WHERE writeTime = ?', [reportValue], function(error, results) {
            var toreport = results[0].writer;
            var reportContent = results[0].boardContent;
            res.render('boardreport.ejs',{
                'reporter': reporter,
                'toreport': toreport,
                'reportContent': reportContent,
            });
        });
    });
});

app.post('/messagePass', function(req, res) {
    var from = req.body.from;
    connection.query('SELECT * FROM member WHERE mem_id = ?', [from], function(error, results) {
        var fromnick = results[0].nickname;
        var to = req.body.to;
        var messageContent = req.body.messageContent;
        var date = new Date();
        var year = date.getFullYear();
        var month = ('0' + (date.getMonth() + 1)).slice(-2);
        var day = ('0' + date.getDate()).slice(-2);
        var hours = ('0' + date.getHours()).slice(-2);
        var minutes = ('0' + date.getMinutes()).slice(-2);
        var seconds = ('0' + date.getSeconds()).slice(-2);

        var DateTime = year + '-' + month  + '-' + day + " " + hours + ':' + minutes  + ':' + seconds;
        if(messageContent) {
            connection.query('INSERT INTO message (fromWriter, toWriter, contents, write_time, send) VALUES(?,?,?,?,?)', 
            [fromnick, to, messageContent, DateTime,0],
                function (error, results) {
                        if (error) return console.log(error);
            });
            res.send("<script>alert('쪽지를 보냈습니다.');location.href='board_list';</script>");
        }
        else {
            res.send("<script>alert('쪽지 내용을 입력하세요'); history.back();</script>")
        }
    });
});

app.post('/messageReply', function(req, res) {
    var values = req.body.messValue;
    connection.query('SELECT * FROM message WHERE write_time=?',[values], function(error, results) {
        var from = results[0].fromWriter;
        var to = results[0].toWriter;
        var mesContent = results[0].contents;
        res.render('messagereply.ejs',{
            'to': from,
            'from': to,
            'mesContent': mesContent
        });
    });
});

app.post('/messagePass2', function(req, res) {
    var from = req.body.from;
    var to = req.body.to;
    var mesContent = req.body.mesContent;
    var date = new Date();
    var year = date.getFullYear();
    var month = ('0' + (date.getMonth() + 1)).slice(-2);
    var day = ('0' + date.getDate()).slice(-2);
    var hours = ('0' + date.getHours()).slice(-2);
    var minutes = ('0' + date.getMinutes()).slice(-2);
    var seconds = ('0' + date.getSeconds()).slice(-2);

    var DateTime = year + '-' + month  + '-' + day + " " + hours + ':' + minutes  + ':' + seconds;
    if(mesContent) {
        connection.query('INSERT INTO message (fromWriter, toWriter, contents, write_time, send) VALUES(?,?,?,?,?)', 
        [from, to, mesContent, DateTime, 1],
            function (error, results) {
                if (error) return console.log(error);
        });
        res.send("<script>alert('답장을 보냈습니다.');location.href='message';</script>");
    }
    else {
        res.send("<script>alert('답장 내용을 입력하세요'); history.back();</script>")
    }
});

app.post('/certifyNum', function(req, res) {
    var authNum = String(Math.floor(Math.random() * 1000000)).padStart(6, "0");
    let emailTemplete;
    ejs.renderFile('./views/authMail.ejs', {authCode : authNum}, function (err, data) {
        if(err){console.log('ejs.renderFile err')}
        emailTemplete = data;
    });
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: "goongfoodmate@gmail.com",
            pass: "xjnxbbpkwkxbgjjm",
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    var tomail = req.body.certifyValue;
    let mailOptions = transporter.sendMail({
        from: `학식 메이트`,
        to: tomail,
        subject: '회원가입을 위한 인증번호를 입력해주세요.',
        html: emailTemplete,
    });

    transporter.sendMail(mailOptions.accepted, function(error, info) {
        transporter.close()
    });
    var date = new Date();
    var year = date.getFullYear();
    var month = ('0' + (date.getMonth() + 1)).slice(-2);
    var day = ('0' + date.getDate()).slice(-2);
    var hours = ('0' + date.getHours()).slice(-2);
    var minutes = ('0' + date.getMinutes()).slice(-2);
    var seconds = ('0' + date.getSeconds()).slice(-2);
    var DateTime = year + '-' + month  + '-' + day + " " + hours + ':' + minutes  + ':' + seconds;

    var email = req.signedCookies.regist;
    connection.query('INSERT INTO certify (cerEmail, cerNum, cerTime) VALUES(?,?,?)',
        [email, authNum, DateTime],
        function (error, data) {
            if (error) return console.table(error);
    });
    res.send("<script>location.href='certifyMail2';</script>");  
});

app.post('/certifyPost', function(req, res) {
    var number = req.body.certifyNum;
    var email = req.signedCookies.regist;
    if(number) {
        connection.query('SELECT * FROM certify WHERE cerEmail=?',[email], function(error, results) {
            var dbNum = results[0].cerNum;
            if(dbNum == number) {
                connection.query('DELETE FROM certify WHERE cerEmail = ?', [email], function(error, results) {
                    if (error) return console.log(error);
                });
                connection.query('UPDATE member SET certify= ? WHERE email= ?', [1,email], function(error, results) {
                    if(error) return console.log(error);
                });
                res.clearCookie("regist");
                res.send("<script>alert('인증이 완료되었습니다.'); location.href='login';</script>");  

            }
            else {
                res.send("<script>alert('인증번호가 일치하지 않습니다.'); history.back();</script>");
            }
        });
    }
    else {
        res.send("<script>alert('인증번호를 입력해주세요.'); history.back();</script>");  
    }
});

app.listen(port, function() {
    console.log('서버 가동');
});