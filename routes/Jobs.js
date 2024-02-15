const router = require("express").Router()
const Jobs = require("../models/jobs")
const Reviews = require("../models/review")
const Categories = require("../models/categories")
const User = require("../models/user")

router.post("/add-job", async (req, res) => {
    try {
        const jobs = new Jobs({
            userId: req.body.userId,
            title: req.body.title,
            desc: req.body.desc,
            price: req.body.price,
            category: req.body.category,
        })
        const review  = new Reviews ({
            JobId: jobs._id,
            jobOwner: req.body.userId
        })
        const find = await Categories.findOne({ name: req.body.category })
        if (find) {
            jobs.review = review._id
            await jobs.save()
            await review.save()
            res.status(200).send({ status: true, message: "Auftrag hinzugefügt" })
        }
        else {
            res.status(400).send({ status: false, message: "Kategorie existiert nicht" })
        }
    } catch (error) {
        res.status(400).send({ status: false, message: error })
    }
})

router.get("/get-jobs", async (req, res) => {
    try {
        const jobs = await Jobs.find().populate({
            path: 'userId',
            select: 'first_name last_name'

        }).populate({
            path: 'jobHolder',
            select: 'first_name last_name'
        }).populate({
            path:"review"
        })
        const filterReview = await Reviews.find()
       
        res.status(200).send({ status: true, data: jobs })
    } catch (error) {
        res.status(400).send({ status: false, message: error })
    }
})

router.put("/accept-job",async (req,res)=>{
    try {
        const findStatus = await Jobs.findById({_id:req.body._id})
        if(findStatus)
        {

            const JobUpdate =  await Jobs.findOneAndUpdate({_id: req.body._id},
                {
                    $set:{
                        jobHolder:req.body.jobholder,
                        status:"ACCEPTED"
                    }
                })

                const jobReview  = await Reviews.findOneAndUpdate({JobId:req.body._id},
                    {
                    $set:{
                        JobDoer: req.body.jobholder
                    }
                })
                res.send({status:true , message:JobUpdate , jobReview: jobReview})
            }
            else{
                res.send({status:true , message:"Kann angenommene Aufträge nicht nochmal annehmen" , job:findStatus})
            }
            
    } catch (error) {
        console.log(error)
        res.status(400).send({status:false , message:error})
    }
})

router.put("/complete-job",async (req,res)=>{
    try {
        const JobUpdate =  await Jobs.findOneAndUpdate({_id: req.body._id},
            {
                $set:{
                    status:"COMPLETED"
                }
            })
            
            res.send({status:true , message:JobUpdate})
    } catch (error) {
        console.log(error)
        res.status(400).send({status:false , message:error})
    }
})

router.get('/top-provider', async (req, res) => {
    try {
        const jobs = await Jobs.find({ status: 'COMPLETED' }).populate({
            path: 'userId',
            select: 'first_name last_name'

        }).populate({
            path: 'jobHolder',
            select: 'first_name last_name'
        }).populate({
            path: "review"
        });

        const filterReview = await Reviews.find();
       
        res.status(200).send({ status: true, data: jobs });
    } catch (error) {
        res.status(400).send({ status: false, message: error });
    }
});
  
router.get("/delete", async (req,res)=>{
    try {
        const deletes = await Jobs.deleteMany()
        res.status(200).send(deletes)
    } catch (error) {
        console.log(error)
        res.status(400).send(error)
    }
})

module.exports = router