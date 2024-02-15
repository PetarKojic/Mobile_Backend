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
    }
},
{timestamps:true}
)

const User = mongoose.model('categories', userSchema);

module.exports = User;
