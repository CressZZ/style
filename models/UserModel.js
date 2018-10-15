var mongoose = require('mongoose'); 

// 스키마
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
},
{ 
    collection: 'users',
    timestamps: true
});

// 모델 리턴
module.exports = mongoose.model('user', UsersSchema) 