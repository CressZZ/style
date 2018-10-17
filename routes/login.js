var express = require('express')
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var UserModel = require('../models/UserModel')
var passwordHash = require('../libs/passwordHash');

/**
 * 일반적인 웹 응용 프로그램에서 사용자를 인증하는 데 사용되는 자격 증명(비번)은 로그인 요청 중에 만 전송됩니다. 
 * 인증이 성공하면 사용자의 브라우저에 설정된 쿠키를 통해 세션이 설정되고 유지 관리됩니다.(비번은 필요 없습니다.)
 * 후속 요청마다 자격 증명이 포함되지 않고 -> (로그인을 제외하고 글쓰기등의 요청에는 비번이 필요하지 않고) 
 * 세션을 식별하는 고유 쿠키만 있으면 됩니다. -> (아이디만 있으면 됩니다.)
 * 로그인 세션을 지원하기 위해 Passport는 세션간에 사용자 인스턴스를 직렬화 및 비 직렬화합니다. -> (세션에는 비번따윈 넣지 않습니다.)
 */


/**
 * 이 예에서는 사용자 ID 만 세션에 직렬화되어 세션에 저장된 데이터의 양을 작게 유지합니다. (로그인 후, 세션에는 아이디만 저장합니다.)
 * (세션 위치: req.session.passport.user)
 * 후속 요청을 받으면이 ID를 사용하여 사용자를 찾은 다음 req.user에 복원합니다.(어떤 req든지(expre js) 들어 올때, req객체에 user객체를 넣어준다.) 
 */

// 세션에 저장할 값은 아이디 하나면 충분하다.
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

// 후속요청할 경우
// (어떤 req든지(expre js) 들어 올때, req객체에 user객체를 넣어준다.) 
passport.deserializeUser(function(id, done) {
    user.findById(id, function(err, user) {
        done(err, user);
    });
});

// passport 로컬 전략!
passport.use(new LocalStrategy(
    {
        // 기본적으로 LocalStrategy는 username 및 password라는 
        // 이름의 매개 변수에서 자격 증명을 찾을 것으로 예상합니다. 
        // 사이트에서이 필드의 이름을 다르게 지정하려는 경우 옵션을 사용하여 기본값을 변경할 수 있습니다.
        // -> 즉 그냥 폼필드 값을 username, password로 하자. 
        usernameField: 'username', 
        passwordField : 'password',
        // passReqToCallback : true
    }, 
    function (username, password, done) {
        UserModel.findOne({ username : username , password : passwordHash(password) }, function (err,user) {
            if (!user){
                console.log('로그인 실패!')
               return done(null, false, { message: '아이디 또는 비밀번호 오류 입니다.' });
            }else{
                console.log('로그인 성공!')

                return done(null, user );
            }
        });
    }
));


router.get('/', function(req, res){
    res.locals.navibarActive = 'login'
    res.render('login', {message: req.body.message})
})

module.exports = router;
