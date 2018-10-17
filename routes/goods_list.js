var express = require('express')
var router = express.Router();
var GoodsModel = require('../models/GoodsModel');
var common = require('../libs/common');

router.get('/', async function(req, res){
    res.locals.navibarActive = 'goods_list' // 헤더를 위한 로컬 변수

    // data 접근
    var goods = await GoodsModel.find({}).lean()
    goods = common.preTreatGoods(goods)
    res.render('goods_list', {goods})
})


module.exports = router;
