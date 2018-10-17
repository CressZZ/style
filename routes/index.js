var express = require('express')
var router = express.Router();

// 로그아웃
router.get('/', function(req, res){
    res.render('index');
});

module.exports = router;
