
var common = {
    preTreatGoods(goods){
        var _goods = goods.map((item)=>{
            item.price_string = common.comma(item.price);
            item.shipping.price_string = common.comma(item.shipping.price);
            return item
        })
    
        return _goods;
    },
    comma(number) {
        return new Intl.NumberFormat('ko-KR', {
            maximumSignificantDigits: 9
        }).format(number);
    },
}

module.exports = common;