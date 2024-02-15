const mongoose  = require("mongoose")

const userSchema = new mongoose.Schema({
   
    title:{
        type: String,
        required: true,
    },
    desc:{
        type:String,
        required:true
    },
    price:{
        type:String,
        required:true
    },
    proposals:{
        type:Number,
        required:false,
        default:0
        
    },
    category:{
        type:String,
        required:true
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    jobHolder:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    review:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'review',
        default: null
    },
    status:{
        type:String,
        default:"OPEN"
    }

},
{timestamps:true}
)

const User = mongoose.model('jobs', userSchema);

module.exports = User;
