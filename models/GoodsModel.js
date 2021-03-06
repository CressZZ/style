var mongoose = require('mongoose'); 
var common = require('../libs/common')
// 스키마
var goodsSchema = new mongoose.Schema({
    id: Number,
    name: String,
    provider: String,
    price: Number,
    options: [{id: Number, color: String, size: String, stock: Number }],
    shipping: {
        method: String,
        price: Number,
        canBundle: Boolean
    }
},
{ 
    collection: 'goods',
    timestamps: true
});


// goodsSchema.virtual('shipping_price_string').get(function(){
//     return common.comma(shipping.price)
// })
// goodsSchema.virtual('price_string').get(function(){
//     return common.comma(price)
// })
// goodsSchema.virtual('test').get(function(){
//     return 'test'
// })

// 모델 리턴
module.exports = mongoose.model('Good', goodsSchema) 