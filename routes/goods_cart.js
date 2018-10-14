var express = require('express')
var router = express.Router();


router.get('/', function(req, res){
    res.locals.navibarActive = 'goods_cart';
    res.render('goods_cart')
})

module.exports = router;
