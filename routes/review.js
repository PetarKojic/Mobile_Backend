const router = require("express").Router()
const Jobs = require("../models/jobs")
const Reviews = require("../models/review")
const Categories = require("../models/categories")
const User = require("../models/user")

router.post("/add-review", async (req, res) => {
    try {
        const checkJob = await Jobs.findOne({_id: req.body.jobId})
        if(checkJob.status == "COMPLETED")
        {
            const updateReview = await Reviews.findOneAndUpdate({JobId:req.body.jobId},{
                $set:{
                    JobDoerRating: req.body.JobDoerRating,
                    JobDoerComment: req.body.JobDoerComment,
                    JobOwnerComment: req.body.JobOwnerComment,
                    JobOwnerRating: req.body.JobOwnerRating
                }
            })
            if(updateReview.JobDoerRating.length>0 && updateReview.JobOwnerRating.length>0)
            {
                await Jobs.findOneAndUpdate({_id: req.body.jobId},{
                    $set:{
                        status:"REVIEWED"
                    }
                })
            }
           return res.status(200).send({status:true , message:"Bewertung hinzugefügt"})
        }
        res.status(200).send({status:true , message:"Kann keine Bewertung für offene oder laufende Aufträge geben"})
    } catch (error) {
        res.status(400).send({ status: false, message: error })
    }
})

router.get("/get-reviews", async (req, res) => {
    try {
        const jobs = await Reviews.find()
        res.status(200).send({ status: true, data: jobs })
    } catch (error) {
        res.status(400).send({ status: false, message: error })
    }
})

module.exports = router