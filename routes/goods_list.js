var express = require('express')
var router = express.Router();
var GoodsModel = require('../models/GoodsModel');


router.get('/', async function(req, res){

    res.locals.navibarActive = 'goods_list' // 헤더를 위한 로컬 변수ㅏ


    var goods = await GoodsModel.find({}).lean()

    goods = preTreatGoods(goods)

    res.render('goods_list', {goods})
})

function preTreatGoods(goods){
    var _goods = goods.map((item)=>{
        item.price = comma(item.price);
        return item
    })

    return _goods;
}
function comma(number) {
    return new Intl.NumberFormat('ko-KR', {
        maximumSignificantDigits: 9
    }).format(number);
}

module.exports = router;
