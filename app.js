var express = require('express');
var app = express();
var path = require('path')
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')
var mongoose = require('mongoose')

//passport 로그인 관련
var flash = require('connect-flash');
var passport = require('passport');
var session = require('express-session');

// app.set
app.set('views', path.join(__dirname, 'views')); 
app.set('view engine', 'ejs');


// app 공용 미들웨어 셋팅
app.use(logger('dev')); // morgan
app.use(bodyParser.json());// bodyParser.json
app.use(bodyParser.urlencoded({ extended: false })); //bodyParser.urlencoded
app.use(cookieParser()); // cookieParser
// app.use(express.json()); // 4.0에서 바디 파서 안써도 됨?

// path 설정
app.use('/static', express.static(__dirname + '/static'));
app.use('/assets', express.static(__dirname + '/assets'));


// Node.js의 native Promise 사용,
mongoose.Promise = global.Promise;

// CONNECT TO MONGODB SERVER
mongoose.connect('mongodb://54.180.92.204:27017/style', { useNewUrlParser: true })
  .then(() => console.log('Successfully connected to mongodb'))
  .catch(e => console.error(e));


// session 관련 세팅
var MongoStore = require('connect-mongo')(session);

app.use(session({
    secret: '!styleShare!',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 2000 * 60 * 60, //지속시간 2시간,
    },
    store: new MongoStore({
        mongooseConnection: mongoose.connection,
        ttl: 14 * 24 * 60 * 60 //14 일
    })
}));

// passport 관련 세팅
/**
 * *** NOTE ***
 * In a Connect or Express-based application, 
 * passport.initialize() middleware is required to initialize Passport. 
 * If your application uses persistent login sessions, passport.session() middleware 
 * must also be used.
 */
app.use(passport.initialize());
app.use(passport.session()); 
app.use(flash());//플래시 메시지 관련a

app.use(function(req, res, next) {
    app.locals.isLogin = req.isAuthenticated();
    app.locals.userData = req.user; //req.user는 passport가 deserializeUser를 통해 넣어 준다. (로그인이 완료 됬을때)
    next();
});

// local 변수 설정
app.use(function(req, res, next){
    app.locals.HEADER = path.join(__dirname, 'views/header')
    app.locals.FOOTER = path.join(__dirname, 'views/footer')

    next()
})


// 라우터 경로 설정
var index = require('./routes/index'); // 장바구니

var goods_list = require('./routes/goods_list'); // 상품 리스트
var account = require('./routes/account'); // 로그인
var goods_cart = require('./routes/goods_cart'); // 장바구니


// 라우터 설정 
app.get('/', index);
app.use('/goods_list', goods_list);
app.use('/account', account);
app.use('/goods_cart', goods_cart);


app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});


