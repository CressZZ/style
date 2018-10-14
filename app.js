var express = require('express');
var app = express();
var path = require('path')
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')

// app 공용 미들웨어 셋팅
app.use(logger('dev')); // morgan
app.use(bodyParser.json());// bodyParser.json
app.use(bodyParser.urlencoded({ extended: false })); //bodyParser.urlencoded
app.use(cookieParser()); // cookieParser
// app.use(express.json()); // 4.0에서 바디 파서 안써도 됨?

// static path 추가
app.use('/static', express.static(__dirname+ '/static'));
// assets
app.use('/assets', express.static(__dirname + '/assets'));

// local 변수 설정
app.use(function(req, res, next){
    app.locals.HEADER = path.join(__dirname, 'views/header')
    app.locals.FOOTER = path.join(__dirname, 'views/footer')

    next()
})

// 라우터 경로 설정
var goods_list = require('./routes/goods_list'); // 상품 리스트
var login = require('./routes/login'); // 로그인
var goods_cart = require('./routes/goods_cart'); // 장바구니


// 라우터 설정 
app.get('/', function (req, res) { res.send('Hello World!'); });
app.use('/goods_list', goods_list);
app.use('/login', login);
app.use('/goods_cart', goods_cart);

// app.set
app.set('views', path.join(__dirname, 'views')); 
app.set('view engine', 'ejs');

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});


