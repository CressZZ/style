var express = require('express')
var router = express.Router();
var GoodsModel = require('../models/GoodsModel');
var UserModel = require('../models/UserModel')
var common = require('../libs/common');



router.get('/', async function(req, res){
    res.locals.navibarActive = 'goods_cart';

    // data
    // var goods = await GoodsModel.find({'options': {$elemMatch: {'id':[1001]}} }).lean()
    if( !req.isAuthenticated() ){
        res.locals.navibarActive = 'login';
        // req.flash('notify', ' 장바구니는 로그인 하신 후에 이용 가능 합니다.')
        res.redirect(`/account/login?message=장바구니는 로그인 하신 후에 이용 가능 합니다.`)
        return false
    }


    var goods = await GoodsModel.find().where('options.id').in(
        req.user.cartlist.map((e)=>e.id)
    ).select({name:1,price:1,provider:1,shipping:1, options:{$elemMatch:{id:{'$in':req.user.cartlist.map((e)=>e.id)} }}}).lean()
    goods = common.preTreatGoods(goods)
    
    var items = await UserModel.find({username:req.user.username }).populate({
        path: 'cartlist.item', 
        select:{name:1,price:1,provider:1,shipping:1, options:{$elemMatch:{id:{'$in':req.user.cartlist.map((e)=>e.id)}}}}
    }).lean()
    console.log(items[0])

    

    res.render('goods_cart', {goods: items[0].cartlist})
})

router.post('/', async function(req, res, next){

    let itemid = req.body.itemid


    if(itemid){
        // 이미 장바구니에 있으면 
        var isAleadyExist = await UserModel.find({ username: req.user.username, "cartlist.id": itemid } )
        if(isAleadyExist.length>0){
            res.json({status:'fail', msg:'이미 장바구니에 있는 상품입니다. 수량 변경은 장바구니 페이지에 진행해 주세요'});
            return;
        }
        // 장바구니에 없는 물건이면 장바구니에 추가
        try{
            var item = await GoodsModel.find({'options.id':itemid})
            await UserModel.update({username: req.user.username}, {$push: {cartlist: {id: itemid , count: 1, item: item[0]._id}} })
        }catch(err){
            res.json({status:'fail', msg:`${err}`});
            return;
        }

        res.json({status:'sucess', msg:'장바구니에 추가 되었습니다.'});
    }else{
        res.json({status:'fail', msg:'옵션을 선택해 주세요'});
    }
})

router.post('/update', async function(req, res, next){

    let itemid = req.body.itemid
    let count = req.body.count



    if(itemid){
        // 이미 장바구니에 있으면 
        // var isAleadyExist = await UserModel.find({ username: req.user.username, "cartlist.id": itemid } )
        // if(isAleadyExist.length>0){
        //     res.json({status:'fail', msg:'이미 장바구니에 있는 상품입니다. 수량 변경은 장바구니 페이지에 진행해 주세요'});
        //     return;
        // }
        // 장바구니에 없는 물건이면 장바구니에 추가
        try{
            await UserModel.update({username: req.user.username, "cartlist.id": itemid},  { $set: {"cartlist.$.count" : count} })
        }catch(err){
            res.json({status:'fail', msg:`${err}`});
            return;
        }

        res.json({status:'sucess', msg:'장바구니에 추가 되었습니다.'});
    }else{
        res.json({status:'fail', msg:'옵션을 선택해 주세요'});
    }
})

module.exports = router;
