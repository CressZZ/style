# 개요
- 리스트 페이지 / 장바구니 페이지 제작
- 접속 url : http://54.180.92.204

# 로컬 환경 실행 방법
```
$ git clone https://github.com/CressZZ/style.git
$ npm i 
$ node app.js

localhost:3000 
```

# 기술 스택
- node, expressjs, passport, mongoose
- bootstarp, jquery
- aws
- nginx
- mongodb
- pm2

# 페이지 목록 및 주요 기능 
- 로그인/회원가입 페이지
    - 회원가입을 한다. 
    - 로그인을 한다. 
- 상품 리스트 페이지
    - 상품 리스트를 불러온다. 
    - 옵션을 선택하여 장바구니에 담는다. 
- 장바구니 페이지 
    - 장바구니에 담은 상품 금액을 확인한다. 

# 페이지 목록 및 상세 기능 
- 로그인/회원가입 페이지
    - 같은 아이디로는 회원가입이 되지 않는다. 
    - passport/session을 이용하여 로그인 관리
- 상품 리스트 페이지
    - 비로그인 상태에서 장바구니 담기를 시도하면 회원가입 페이지로 이동
    - 옵션별로 하나의 상품을 담을 수 있다. 
    - 품절상품은 선택 할수 없다. 
- 장바구니 페이지 
    - 같은 입점사 상품의 묶음배송 가능 여부, 
    - 가능시 묶음배송가능한 상품의 배송비는 한번만 부과. 
    - 묶음 배송가능 상품들의 배송 비용이 다를경우 최저금액을 적용. 
    - 불가능시 상품마다 배송비 부과

# DB 구조
## Uer
``` js
// UserModel.js

var UsersSchema = new mongoose.Schema({
    username : {
        type : String,
        required: [true, '아이디는 필수입니다.'],
        validate: {
            validator: function(v) {
              return v.length>3;
            },
            message: props => `아이디는 3글자 이상입니다`
        },
    },
    password : {
        type : String,
        required: [true, '패스워드는 필수입니다.']
    },
    displayname : {
        type : String,
        required: [true, '유저이름은 필수 입니다.']
    },
    cartlist: [{id: String, count: Number, item: [mongoose.Schema.Types.Mixed ]}],
    shipping: {
        method: String,
        price: Number,
        canBundle: Boolean
    }
},
{ 
    collection: 'users',
    timestamps: true
});
```

## Goods

```js
// GoodsModel.js
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
```
# 핵심 코드

- 장바구니 Class

```js
// goods_cart.ejs

/**
 * 장바구니 Class
 */
 class Cart{
    constructor(cartItemSelector){
        this.cartItems = [];
        document.querySelectorAll(cartItemSelector).forEach((e)=>{
            this.cartItems.push(new CartItem(e));
        })

        // 금액 넣을 Node
        this.goodsTotal = $('.info__price--goodsTotal') // 상품금액 총합
        this.noBundleTotalNode = $('.info__price--noBundleTotal') // 개별 배송비
        this.bundleTotalNode = $('.info__price--bundleTotal') // 묶음 배송비
        this.grandTotalNode = $('.info__price--grandTotal') // 전체 금액

        this.init()
    }

    /**
    * 아이탬 추가
    */
    onAddCartItem(addCartItem){
        // 아이탬을 추가 하고
        this.cartItems.push(addCartItem)
        // 가격 책정다시
        this.onChangeCartItem(addCartItem)
    }

    /**
    * 아이탬 삭제
    */
    onDeleteCartItem(targetCartItem){
        
        // 앙탬 수량을 0으로 만들고
        targetCartItem.onDelete();
        // this.requestUpdateCartItem(targetCartItem)

        // 아이탬을 삭제 하고
        this.cartItems = this.cartItems.filter((cartItem)=> cartItem.id != targetCartItem.id)
        targetCartItem.cateItemNode.animate({left: "+=100vw",},500, function(){ targetCartItem.cateItemNode.remove(); });


        // 가격 책정다시
        this.onChangeCartItem(targetCartItem)
    }


    /**
    * 아이탬 수량 변경
    */
    onChangeCartItemCount(targetCartItem, nextCount){
        // 수정이 가능한 수량인지 보고 수량 변경 시작
        if(targetCartItem.onChangeCount(nextCount)){
            this.onChangeCartItem(targetCartItem)
        }
    }

    /**
    * 일반적으로 카트 아이템이 변경 됬을 경우 가격 책정을 다시한다. 
    */
    onChangeCartItem(targetItem){
        // DOM 수정 할거 있으면 하기
        this.requestUpdateCartItem(targetItem)
        // 가격 정보 세팅하기
        this.setPriceInfo()
    }
    /**
    * ajax 요청
    */
    requestUpdateCartItem(targetItem){
        $.ajax({
            url: './update',
            type:'POST',
            data: {itemid:targetItem.id, count:targetItem.currentCount} // 수량 변경
        })
        .done(function(res){
            console.log(res.msg)
        })  
    }

    /**
    * 모든 상품 금액 합계 뽑아오기
    */
    get totalGoodsPrice(){
        let totalGoodsPrice =this.cartItems.reduce((a, c)=> a + c.totalPrice, 0);
        return totalGoodsPrice
    }
    
    /**
     * 개별배송 상품 리스트 출력
     */
    get cannotBundleItems(){
        return this.cartItems.filter((e)=> !e.shippingCanBunddle && e.stock > 0);
    }

    /**
     * 묶음배송 상품리스트 출력
     */
    get bundleItems(){
        return this.cartItems.filter((e)=>e.shippingCanBunddle && e.stock > 0 );
    }

    /**
     * provider를 통해 상품리스트 출력
     */
    getItemsByProvider(targetItems, provider){
        return targetItems.filter((e)=>e.shippingProvider == provider)
    }

    /**
     * 개별배송 상품 배송비 정보(provider에 따라)
     * @return {{provider: {count}, {shippingPrice}}
     */ 
    get cannotBundleItemsShippingPriceInfo(){
        let cannotBundletemsShippingPrice = {};

        this.cannotBundleItems.forEach((e)=>{
            if(!cannotBundletemsShippingPrice[e.shippingProvider]){
                cannotBundletemsShippingPrice[e.shippingProvider] = {count:1, shippingPrice: e.shippingPrice};
            }else{
                cannotBundletemsShippingPrice[e.shippingProvider] = {
                    count: cannotBundletemsShippingPrice[e.shippingProvider].count + 1, 
                    shippingPrice: e.shippingPrice + cannotBundletemsShippingPrice[e.shippingProvider].shippingPrice
                }; 
            }
        })
        return cannotBundletemsShippingPrice
    }

    /**
     * 묶음배송 상품 배송비 정보(provider에 따라)
     * @return {{provider: {count}, {shippingPrice}}
     */
    get bundleItemsShippingPriceInfo(){
        let bundletemsShippingPrice = {};

        this.bundleItems.forEach((e)=>{
            if(!bundletemsShippingPrice[e.shippingProvider]){
                bundletemsShippingPrice[e.shippingProvider] = {count:1, shippingPrice: e.shippingPrice};
            }else{
                bundletemsShippingPrice[e.shippingProvider] = {
                    count: bundletemsShippingPrice[e.shippingProvider].count + 1, 
                    shippingPrice: Math.min(e.shippingPrice, bundletemsShippingPrice[e.shippingProvider].shippingPrice)
                }; 
            }
        })
        return bundletemsShippingPrice
    }

    /**
     * 개별배송 상품 배송비 합계
     */
    get cannotBundleItemsShippingPrice(){
        return  this.cannotBundleItems.reduce((a, c)=>a+c.shippingPrice, 0)
    } 

        /**
     * 묶음배송 상품 배송비 합계
     */
    get bundleItemsShippingPrice(){
        let totalCannotBundleShippingPrice = 0
        let bundleItems = this.bundleItemsShippingPriceInfo

        for(var keys in bundleItems){
            totalCannotBundleShippingPrice = totalCannotBundleShippingPrice + bundleItems[keys].shippingPrice
        }
        return totalCannotBundleShippingPrice 
    } 

    /**
     * GrandTotal 구하기
     */
    get grnadTotalPrice(){
        let grandTotalPrice = this.totalGoodsPrice + this.cannotBundleItemsShippingPrice +this.bundleItemsShippingPrice 
        console.log('grandTotalPrice = ', grandTotalPrice)
        return grandTotalPrice
    }

    /**
    * 가격정보 세팅하기
    */
    setPriceInfo(){
        // 상품금액 총합
        this.goodsTotal.find('.price__count').html(`${this.cartItems.length} 개 상품`);
        this.goodsTotal.find('.price__content').html(`${comma(this.totalGoodsPrice)} 원`);


        // 개별 배송비
        var _tempCountB = 0;
        let noBundles = this.cannotBundleItemsShippingPriceInfo
        this.noBundleTotalNode.find('.price__content').remove()
        for(var keys in noBundles){
            this.noBundleTotalNode.append( `
                <div class="price__content">
                    <p></p><span class="bundleTotal__title"></span><span class="bundleTotal__count"></span><span class="bundleTotal__price"></span><p></p>
                </div> `
            )
        
            this.noBundleTotalNode.find('.price__content').eq(_tempCountB).find('.bundleTotal__title').html(`${keys}: `)
            this.noBundleTotalNode.find('.price__content').eq(_tempCountB).find('.bundleTotal__count').html(`[${noBundles[keys].count}개 상품]`)
            this.noBundleTotalNode.find('.price__content').eq(_tempCountB).find('.bundleTotal__price').html(`${comma(noBundles[keys].shippingPrice)}원`)
            _tempCountB++
        }

        // 묶음 배송비
        var _tempCount = 0;
        let bundles = this.bundleItemsShippingPriceInfo
        this.bundleTotalNode.find('.price__content').remove()
        for(var keys in bundles){
            this.bundleTotalNode.append( `
                <div class="price__content">
                    <p></p><span class="bundleTotal__title"></span><span class="bundleTotal__count"></span><span class="bundleTotal__price"></span><p></p>
                </div> `
            )
        
            this.bundleTotalNode.find('.price__content').eq(_tempCount).find('.bundleTotal__title').html(`${keys}: `)
            this.bundleTotalNode.find('.price__content').eq(_tempCount).find('.bundleTotal__count').html(`[${bundles[keys].count}개 상품]`)
            this.bundleTotalNode.find('.price__content').eq(_tempCount).find('.bundleTotal__price').html(`${comma(bundles[keys].shippingPrice)}원`)
            _tempCount++
        }
        
        // 전체 금액
        this.grandTotalNode.find('.price__content').html(`${comma(this.grnadTotalPrice)}원`)
    }

    /**
    * 초기 생성할때
    */
    init(){
        // 수량변경 이벤트 바인딩
        this.cartItems.forEach((cartItem)=>{
            cartItem.countButtons.on('click', function(event){
                this.onChangeCartItemCount(cartItem, Number(event.currentTarget.getAttribute('data-count')))
            }.bind(this))
        })

        // 아이탬 삭제 이벤트 바인딩
        this.cartItems.forEach((cartItem)=>{
            cartItem.DeletBtnNode.on('click', function(event){
                let isConfirmDelete = confirm('해당 아이탬을 삭제 하시겠습니까?')

                if( isConfirmDelete == true){
                    this.onDeleteCartItem(cartItem)
                }else{
                    return false;
                }
            }.bind(this))
        })

        // 가격정보 세팅하기
        this.setPriceInfo()
    }
}

/**
 * 장바구니 개별 아이탬 Class
 */
class CartItem  {
    constructor(cateItemSelector) {  
        // 고정 - 노드들
        this.cateItemNode = $(cateItemSelector).parents('.cart__item') // 카테고리 상품 노드
        this.countNode = this.cateItemNode.find('.count') // 수량 노드
        this.countButtons = this.cateItemNode.find('.count__btn') // 수량 변경 노드들 (+, -)
        this.eachPriceNode = this.cateItemNode.find('.cart__item__price--each') // 단가 노드
        this.totalPriceNode = this.cateItemNode.find('.cart__item__price--total') // 총액 노드
        this.DeletBtnNode =  this.cateItemNode.find('.cart__item__deleteBtn') // 삭제 버튼
        
        // 고정 - 값들
        this.eachPrice =  Number(this.eachPriceNode.data().eachprice) ;// 단가
        this.id =  Number(this.cateItemNode.find('.cart__item__wrap').data().id) // 상품 id
        this.shippingPrice =  Number(this.cateItemNode.find('.shipping--price').data().price) // 상품 배송가격
        this.shippingMethod =  this.cateItemNode.find('.shipping--method').data().method // 상품 배송정책(무료배송)
        this.shippingCanBunddle =  this.cateItemNode.find('.shipping--canBundle').data().canbundle // 상품 묶음배송 여부
        this.shippingProvider =  this.cateItemNode.find('.shipping--provider').data().provider // 상품 생산자


        // 가변
        this.currentCount = Number(this.countNode.val()) // 현재 카운트
        this.stock = Number(this.countNode.data().stock); // -> ajax로 변경해야 함
        // this.totalPrice = this.currentCount * this.eachPrice
    }
    
    /**
    * 재고 체크
    */
    checkStock(targetCount){
        if(targetCount <= 0){
            alert('수량은 0개 이상 입력해 주세요')
            return false
        }else if(targetCount > this.stock){
            alert(`해당상품의 재고 수량은 ${this.stock}개 입니다. \n ${this.stock}개 이하로 주문해 주세요 `)
            return false
        }else{
            return true
        }
    }

    /**
    * 수량 변경이벤트 콜백 / 수정이 가능한 수량인지 보고 수량 변경 시작
    */
    onChangeCount(nextCount){
        let targetCount = this.currentCount + nextCount; // 타겟 수량
        if(this.checkStock(targetCount) ){// 가능한 수량인지 체크
            return this.changeCount(targetCount); 
        }else{
            return false
        }
    }

    onDelete(){
        this.changeCount(0); 
    };

    get totalPrice(){
        return  this.currentCount * this.eachPrice
    }
    /**
    * 수량변경
    */
    changeCount(targetCount){
        // 객체 내용 변경
        this.currentCount = targetCount; // 수량 객체 값 변경
        // this.totalPrice= targetCount * this.eachPrice // 총 금액 객체 변경
        
        // Node부분 변경
        this.countNode.val(targetCount); // 수량 input 필드 변경
        this.totalPriceNode.html(`총 ${comma(this.totalPrice)} 원`); // 총 금액 변경

        // DB 변경 
        
        return true;
    }
    
}

```

- 상품리스트 상품 Class


```js
/**
 * 상품리스트 개별 아이탬 Class
 */
class Good  {
    constructor(cateItemSelector) {  
        // 고정 - 노드들
        this.goodNode = $(cateItemSelector)//  상품 노드
        this.optionIdNode = this.goodNode.find('.option_id') //  옵션 선택 노드
        this.btnAddCartNode = this.goodNode.find('.btn--addCart') // 장바구니 추가 노드

        this.init();
        
    }

    /**
    * 초기 이벤트 바인딩
    */
    init(){
        // 옵션 변경 이벤트 바인딩
        this.optionIdNode.on('change', function(e){
            this.btnAddCartNode.data().itemid = e.currentTarget.value;
        }.bind(this))


        // 장바구니 담기 이벤트 바인딩
        this.btnAddCartNode.on('click', function(e){
            <% if(!isLogin){ %>
                alert('로그인이 필요합니다')
                location.href=`/account/login?return_url='${window.location.href}'`
                return false
            <% } %>

            // 장바구니에 담기
            this.insertToCart();

        }.bind(this))
    }
    
    /**
    * 헤당 상품의 option id 불러오기
    */
    get optionId(){
        return this.goodNode.find('.btn--addCart').data().itemid || '';
    }

    /**
    * 장바구니 담기 
    */
    insertToCart(){
        $.ajax({
            url: '/goods_cart',
            type: 'POST',
            data: { itemid: this.optionId },
        })
        .done(((res)=>{
            alert(res.msg)
        }))
    }

}


```

# 후기
- 스타일에 신경을 쓰고 싶었으나 시간이 부족했음. 
- bootstrp 처음 사용해보나, 생각보다 괜찮은것 같음. 
- 몽고디비를 거의 처음 사용하여 쿼리문 등이 불안정함.
