const router =  require("express").Router()
const Category = require("../models/categories")

router.post("/add-category", async (req,res)=>{
    try {
        const category = new Category({
            name:req.body.name,
            image:req.body.image,
            color:req.body.color
        })
       await category.save()
        res.status(200).send({status:true , message:"Kategorie hinzugefügt"})
    } catch (error) {
        console.log(error)
        res.status(400).send({status:false , message:error})
    }
})

router.get("/get-category",async (req,res)=>{
    try {
        const category = await Category.find()
        res.status(200).send({status:true ,data:category})
    } catch (error) {
        res.status(400).send({status:false , message:error})
    }
})

router.post("/update-category",async (req,res)=>{
    try {
        const category = await Category.findOneAndUpdate({_id:req.body._id},{
            $set:{
                image:req.body.image
            }
        })
        res.status(200).send({status:true ,data:category})
    } catch (error) {
        res.status(400).send({status:false , message:error})
    }
})

module.exports = router