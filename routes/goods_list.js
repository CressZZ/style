var express = require('express')
var router = express.Router();


router.get('/', function(req, res){
    res.locals.navibarActive = 'goods_list'
    res.render('goods_list')
})

module.exports = router;
