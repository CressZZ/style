var mongoose = require('mongoose'); 

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

// 모델 리턴
module.exports = mongoose.model('good', goodsSchema) 