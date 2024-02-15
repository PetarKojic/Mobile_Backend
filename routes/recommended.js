const router = require("express").Router()
const Recommend = require("../models/recommended")
const Category = require("../models/categories")
const User = require('../models/user')
router.post("/add-recommendation", async (req, res) => {
    try {
        const user = await User.findOneAndUpdate({ _id: req.body.userId }, {
            $set: {
                isRecommend: true
            }
        })
        if (user) {
            return res.status(200).send({ status: true, message: "Empfehlung hinzugefügt" })
        }
        else {
            res.status(400).send({ status: false, message: "Benutzer existiert nicht" })
        }
    } catch (error) {
        res.status(400).send({ status: false, message: error })
    }
})

router.get("/get-recommendation", async (req, res) => {
    try {
        const category = await User.find({
            isRecommend: true
        });

        res.status(200).send({ status: true, data: category });
    } catch (error) {
        console.log(error);
        res.status(400).send({ status: false, message: error });
    }
});

module.exports = router