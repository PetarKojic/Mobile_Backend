const mongoose  = require("mongoose")

const userSchema = new mongoose.Schema({
   
    name:{
        type: String,
        required: true,
    },
    image:{
        type:String,
        required:true
    },
    color:{
        type:String,
        required:true
    },
    rating:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:true
    }
},
{timestamps:true}
)

const User = mongoose.model('recommended', userSchema);

module.exports = User;
