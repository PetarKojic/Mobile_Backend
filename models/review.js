const mongoose  = require("mongoose")

const userSchema = new mongoose.Schema({
   
    JobDoer:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: null
    },
    jobOwner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    JobDoerRating:{
        type:String,
        default:""
    },
    JobOwnerRating:{
        type:String,
        default:""
    },
    JobDoerComment:{
        type:String,
        default:""
    },
    JobOwnerComment:{
        type:String,
        default:""
    },
    JobId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'jobs',
        default: null
    }

},
{timestamps:true}
)

const User = mongoose.model('review', userSchema);

module.exports = User;
