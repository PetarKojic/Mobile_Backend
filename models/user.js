const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true,

    },
    last_name: {
        type: String,
        required: true,

    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: false,
    },
    status: {
        type: Boolean,
        default: false
    },
    isRecommend: {
        type: Boolean,
        default: false
    },
    social: {
        type: Boolean,
        default: false,
        required:false
    },
    provider: {
        type: String,
        default: null,
    },
},
    { timestamps: true }
)

const User = mongoose.model('User', userSchema);

module.exports = User;
