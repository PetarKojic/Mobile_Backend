const express = require("express")
const env =  require("dotenv")
const mongoose  =  require("mongoose")
const cors =  require("cors")
const app = express()
env.config()
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cors())
//import routes
const auth  = require("./routes/auth")
const category = require("./routes/categories")
const recmnd = require("./routes/recommended")
const jobs = require("./routes/Jobs")
const reviews = require("./routes/review")


//define routes
app.use('/api/v1/auth',auth)
app.use('/api/v1/category',category)
app.use('/api/v1/recommend',recmnd)
app.use('/api/v1/jobs',jobs)
app.use('/api/v1/reviews',reviews)

app.get("/", (req, res) =>{
  res.status(200).send("Hello Backend")
})

//connect mongodb
mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGO_URL,{
    useNewUrlParser:true,
    useUnifiedTopology: true,
}).then(console.log("Connected to Database")).catch((err)=> console.warn(err))

app.listen(process.env.PORT,()=>{
    console.log("Server started")
})