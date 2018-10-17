var mongoose = require('mongoose'); 
var common = require('../libs/common')
// 스키마
var optionsSchema = new mongoose.Schema({
    goods: { type: mongoose.Schema.Types.ObjectId, ref: 'Good' },
    id: Number,
    color: String, 
    size: String, 
    stock: Number
},
{ 
    collection: 'options',
    timestamps: true
})
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
module.exports = mongoose.model('Options', optionsSchema) 