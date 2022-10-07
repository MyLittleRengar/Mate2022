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

exports.board_write = function(req, res){
    var hourTitle = req.body.hourTitle;
    var minTitle = req.body.minTitle;
    var placeTitle = req.body.placeTitle;
    var foodTitle = req.body.foodTitle;
    var countTitle = req.body.countTitle;
    var title = hourTitle + "시" + minTitle + "분에 " + placeTitle + "에서(로) ";
    var content = foodTitle  + "을(를) 먹을 사람 " + countTitle + "명을(를) 구합니다.";
    let listnumber = 0;
    //년,월,일/시,분,초 구하는 부분
    var date = new Date();
    var year = date.getFullYear();
    var month = ('0' + (date.getMonth() + 1)).slice(-2);
    var day = ('0' + date.getDate()).slice(-2);
    var hours = ('0' + date.getHours()).slice(-2);
    var minutes = ('0' + date.getMinutes()).slice(-2);
    var seconds = ('0' + date.getSeconds()).slice(-2);

    var DateTime = year + '-' + month  + '-' + day + " " + hours + ':' + minutes  + ':' + seconds;
    var DateT = year + month  + day;
    var id = req.signedCookies.loginObj;
    var writer = 0;
    connection.query('SELECT nickname FROM member WHERE mem_id = ?', [id], function(error, results) {
       writer = results[0].nickname;
    });
    connection.query('SELECT * FROM board', function(error, results) {
        var lastNum = results[results.length-1].listNum;
        listnumber = lastNum + 1;
    });
    connection.query('SELECT * FROM board WHERE listNum = ?', listnumber, function(error, results) {
        if(results.length == 0) {
            if(hourTitle && minTitle && placeTitle){
                if(foodTitle && countTitle){
                    connection.query('INSERT INTO board (category, listNum, title, writer, boardContent, writeTime, date) VALUES(?,?,?,?,?,?,?)', [1, listnumber, title, writer, content, DateTime, DateT],
                    function (error, results) {
                         if (error) return console.log(error);
                    });
                    res.send("<script>alert('글 등록에 성공했습니다.');location.href='board_list';</script>");
                }else{
                    res.send("<script>alert('내용을 입력하세요'); history.back();</script>")
                }
            } else{
                res.send("<script>alert('제목을 모두 입력하세요'); history.back();</script>")
            }
        }
    });
};

exports.notice_write = function(req, res) {
    var title = req.body.title;
    var content = req.body.content;
    let listnumber = 0;
    //년,월,일/시,분,초 구하는 부분
    var date = new Date();
    var year = date.getFullYear();
    var month = ('0' + (date.getMonth() + 1)).slice(-2);
    var day = ('0' + date.getDate()).slice(-2);
    var hours = ('0' + date.getHours()).slice(-2);
    var minutes = ('0' + date.getMinutes()).slice(-2);
    var seconds = ('0' + date.getSeconds()).slice(-2);

    var DateTime = year + '-' + month  + '-' + day + " " + hours + ':' + minutes  + ':' + seconds;
    var DateT = year + month  + day;
    var id = req.signedCookies.loginObj;
    var writer = 0;
    var access = 0;
    connection.query('SELECT * FROM member WHERE mem_id = ?', [id], function(error, results) {
        writer = results[0].nickname;
    });
    connection.query('SELECT * FROM board', function(error, results) {
        var lastNum = results[results.length-1].listNum;
        listnumber = lastNum + 1;
    });
    connection.query('SELECT * FROM board WHERE listNum = ?', listnumber, function(error, results) {
        if(results.length == 0) {
            if(title){
                if(content){
                    connection.query('INSERT INTO board (category, listNum, title, writer, boardContent, writeTime, date) VALUES(?,?,?,?,?,?,?)', [0, listnumber, title, writer, content, DateTime,DateT],
                    function (error, data) {
                         if (error) return console.log(error);
                    });
                    res.send("<script>alert('공지를 등록하였습니다.');location.href='board_list';</script>");
                }else{
                    res.send("<script>alert('내용을 입력하세요'); history.back();</script>")
                }
            } else{
                res.send("<script>alert('제목을 입력하세요'); history.back();</script>")
            }
        }
    });
};

exports.modify = function(req, res){
    var listNum = req.params.listNum;
    var title = req.body.title;
    var content = req.body.content;

    connection.query('UPDATE board SET title = ?, boardContent = ? WHERE listNum = ?', [title, content, listNum], function(error, results) {
        res.send("<script>alert('수정이 완료되었습니다.');location.href='/board_list';</script>");
    });
};

exports.delete = function(req, res){
    var listNum = req.params.listNum;
    
    connection.query('SELECT category FROM board WHERE listNum = ?', [listNum], function(error, cate){
        connection.query('DELETE FROM board WHERE listNum = ?', [listNum], function(error, results) {
                res.send("<script>alert('글을 삭제하였습니다.');location.href='/board_list';</script>");
        })
    })          
};

exports.commentDelete = function(req, res){
    var listNum = req.body.listNum;
    var writeTime = req.body.writeTime;

    var id = req.signedCookies.loginObj;
    connection.query('SELECT * FROM member WHERE mem_id = ?', [id], function(error, results){
        var writer = results[0].nickname;
        connection.query('DELETE FROM review WHERE boardNum=? AND writeTime=? AND writer = ?', [listNum, writeTime, writer], function(error, results){
                res.send("<script>alert('댓글을 삭제하였습니다.'); location.href='/board_list' ; </script>");        
        })    
    })
};

exports.comment_list = function(req, res){
    var listNum = req.params.listNum;

    var comment = req.body.comment;
    
    var date = new Date();
    var year = date.getFullYear();
    var month = ('0' + (date.getMonth() + 1)).slice(-2);
    var day = ('0' + date.getDate()).slice(-2);
    var hours = ('0' + date.getHours()).slice(-2);
    var minutes = ('0' + date.getMinutes()).slice(-2);
    var seconds = ('0' + date.getSeconds()).slice(-2);
    
    var writeTime = year + '-' + month  + '-' + day + " " + hours + ':' + minutes  + ':' + seconds;

    var id = req.signedCookies.loginObj;
    connection.query('SELECT * FROM member WHERE mem_id = ?', [id], function(error, results) {
      var writer = results[0].nickname;
        if(comment){
            connection.query('SELECT * FROM board WHERE listNum = ?', [listNum], function(error, board){
                var inComListNum = board[0].listNum;
                connection.query('INSERT INTO review (boardNum, writer, writeTime, reviewContent) VALUES(?,?,?,?)',[inComListNum, writer, writeTime, comment],
                function (error, data){
                    if(error) return console.log(error);
                });
                res.send("<script>alert('댓글을 등록하였습니다.'); location.href='/board_list';</script>");
            }) 
        }else{
            res.send("<script>alert('댓글을 입력하세요'); history.back();</script>")
        }
    });
};

exports.getNotice_write = function(req, res) {
    var id = req.signedCookies.loginObj
    if(id) {
        res.sendFile(__dirname + "/notice_write.html");
    }
    else {
        res.send("<script>alert('이용하시려면 로그인을 하셔야 됩니다.');location.href='login';</script>");
    } 
};

exports.getNotice_list = function(req, res) {
    var id = req.signedCookies.loginObj;
    if(id) {
        connection.query('SELECT * FROM board WHERE category=?',[0], function(error, rows){
            connection.query('SELECT * FROM member WHERE mem_id = ?', [id], function(err, nowUser){
                res.render('notice_list.ejs',{
                    rows : rows,
                    nowUser : nowUser
                });
            })
        })
    }
    else {
        res.send("<script>alert('이용하시려면 로그인을 하셔야 됩니다.');location.href='login';</script>");
    }
};

exports.getBoard_write = function(req, res) {
    if(req.signedCookies.loginObj) {
        res.sendFile(__dirname + "/board_write.html");
    }
    else {
        res.send("<script>alert('이용하시려면 로그인을 하셔야 됩니다.');location.href='login';</script>");
    } 
};

exports.getBoard_list = function(req, res) {
    var id = req.signedCookies.loginObj;
    if(id) {
        connection.query('SELECT * FROM board WHERE category=?',[0], function(error, noRows){
            connection.query('SELECT * FROM board WHERE category=?',[1], function(error, boRows){
                var date = new Date();
                var year = date.getFullYear();
                var month = ('0' + (date.getMonth() + 1)).slice(-2);
                var day = ('0' + date.getDate()).slice(-2);
                var DateTime = year + month + day;
                res.render('board_list.ejs',{
                    'noRows' : noRows,
                    'boRows' : boRows,
                    'datetime': DateTime
            });
            })
        })
    }
    else {
        res.send("<script>alert('이용하시려면 로그인을 하셔야 됩니다.');location.href='login';</script>");
    } 
};

exports.getModify = function(req, res) {
    var listNum = req.params.listNum;
    var id = req.signedCookies.loginObj;
    if(id) {
        connection.query('SELECT * FROM board WHERE listNum = ?', [listNum], function(error, moRows){
            res.render('modify.ejs',{
                moRows : moRows
            });    
        })
    }
    else {
        res.send("<script>alert('이용하시려면 로그인을 하셔야 됩니다.');location.href='login';</script>");
    }
};

exports.getDetail = function(req, res) {
    var listNum = req.params.listNum;
    var id = req.signedCookies.loginObj;
 
    if(id) {
        connection.query('SELECT * FROM board WHERE listNum = ?', [listNum], function(error, deRows){
            connection.query('SELECT * FROM member WHERE mem_id = ?', [id], function(error, nowUser) {
                connection.query('SELECT * FROM review WHERE boardNum = ?', [listNum], function(error, comRows){
                    res.render('detail.ejs',{
                        deRows : deRows,
                        comRows : comRows,
                        nowUser : nowUser
                    });
                })
            })  
        })
    } else {
        res.send("<script>alert('이용하시려면 로그인을 하셔야 됩니다.');location.href='login';</script>");
    }
};

exports.boaSearch = function(req, res){
    var searchText = req.query.searchText;
    if(searchText) {
        connection.query('SELECT * FROM board WHERE category=0 AND title LIKE ?', '%' + searchText + '%', function(error, noRows){
            connection.query('SELECT * FROM board WHERE category=1 AND title LIKE ?', '%' + searchText + '%', function(err, boRows){
                if(boRows.length == 0 & noRows.length == 0){
                    res.send("<script>alert('검색결과가 없습니다.'); history.back();</script>");
                }
                else {
                    res.render('board_list.ejs',{
                        noRows : noRows,
                        boRows: boRows
                    });
                }
            });
        });
    }
    else {
        res.send("<script>alert('검색어를 입력해주세요'); history.back();</script>");
    }
};

exports.notSearch = function(req, res){
    var searchText = req.query.searchText;

    connection.query('SELECT * FROM board WHERE category=0 AND title LIKE ?', '%' + searchText + '%', function(err, rows){
        if(rows.length == 0){
            res.send("<script>alert('검색결과가 없습니다.'); history.back();</script>");
        }
        else {
            res.render('board_list.ejs',{
            rows : rows
            });
        }
    });
};