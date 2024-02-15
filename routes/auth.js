
const router = require("express").Router()
const User = require("../models/user")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const Hash = require("../models/hash")
const { sendNewMail, GenerateOTP, sendOTPEmail } = require("../function")

//REGISTER
router.post("/register", async (req, res) => {
    try {

        if (req.body.password) {
            const salt = await bcrypt.genSalt(10)
            const hashpassword = await bcrypt.hash(req.body.password, salt)
            const getOtp = GenerateOTP()
            console.log(getOtp)
            const hashOtp = await bcrypt.hash(getOtp, salt)

            const userC = await User.findOne({ email: req.body.email })
            if (userC) {
                res.status(400).json({ status: false, message: "Diese Email wird bereits verwendet, versuchen Sie eine andere" })
            }
            else {
                const newUser = new User({
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    email: req.body.email,
                    password: hashpassword,
                    otp: hashOtp
                })

                const user = await newUser.save()
                sendOTPEmail(req.body.email,getOtp)
                res.status(200).json({ status: true, message: "Neuer Benutzer erstellt" })
            }
        }
        else {
            res.status(500).json({ status: false, message: "Passwort wird benötigt" })
        }
    }

    catch (err) {
        console.log(err)
        res.status(500).json({ status: false, message: err })
    }
})

//LOGIN 
router.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        console.log(user.social , " social")
        if (!user || user.social) {
            return res.status(400).json({ status: false, message: "Benutzer existiert nicht" });
        }

        const validate = await bcrypt.compare(req.body.password, user.password);
        if (!validate) {
            return res.status(400).json({ status: false, message: "Falsches Passwort" });
        } else {
            // Create a token payload with user information
            const tokenPayload = {
                userId: user._id,
                email: user.email, // You can include additional user-related data here
            };

            // Generate a JWT token with the token payload
            const token = jwt.sign(tokenPayload, 'hellodevstax123@@', { expiresIn: '1h' }); // Replace 'your-secret-key' with a secret key

            // Exclude the password from the response
            const { password, ...other } = user._doc;

            return res.status(200).json({ status: true, message: "Benutzer eingeloggt", user: other, token });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json(err);
    }
})

//RESET PASSWORD
router.put("/reset-password", async (req, res) => {

    const user = await Hash.findOne({ userid: req.body._id })
    if (!user) {
        res.status(404).json({ status: false, message: "Kein Eintrag gefunden" })
    }
    else if (user.hash == "") {
        res.status(401).json({ status: false, message: "Link abgelaufen." })
    }
    else if (user.status == false) {
        res.status(401).json({ status: false, message: "Das Passwort kann für diesen Benutzer nicht zurückgesetzt werden, bitte verifizieren Sie den Benutzer zuerst" })
    }
    else {
        try {
            const salt = await bcrypt.genSalt(10)
            const hashpassword = await bcrypt.hash(req.body.password, salt)
            console.log(hashpassword)
            await User.findByIdAndUpdate(
                req.body._id,
                {
                    $set: {
                        password: hashpassword
                    },
                },
                { new: true }
            );
            try {
                const salt = await bcrypt.genSalt(10)
                const hashpassword = await bcrypt.hash(req.body.password, salt)
                console.log(hashpassword)
                await Hash.findOneAndUpdate(
                    { userid: req.body._id },
                    {
                        $set: {
                            hash: "",
                            status: false
                        },
                    },
                    { new: true }
                );

                res.status(200).json({ status: true, message: "Passwort zurückgesetzt, Sie können sich wieder einloggen" })
            }
            catch (err) {
                console.log(err)
                res.status(400).json({ status: true, message: err })

                return err
            }
        }
        catch (err) {
            console.log(err)
            res.status(400).json({ status: true, message: err })

            return err
        }
    }
})

//ACTIVATE PASSWORD PASSWORD
router.put("/activate-password-link", async (req, res) => {
    console.log(req.body)
    const user = await Hash.findOne({ userid: req.body.userid })
    if (!user) {
        res.status(404).json({ status: false, message: "Kein Eintrag gefunden" })
    }
    else if (user.hash !== req.body.hash) {
        res.status(401).json({ status: false, message: "Unautorisierter Zugriff" })
    }
    else if (user.hash === "") {
        res.status(410).json({ status: false, message: "Link abgelaufen" })
    }
    else {
        try {
            await Hash.findOneAndUpdate(
                { userid: req.body.userid },
                {
                    $set: {
                        status: true
                    },
                },
                { new: true }
            );
            res.status(200).json({ status: true, message: "Passwort-Rücksetzung jetzt möglich" })
        }
        catch (err) {
            console.log(err)
            res.status(400).json({ status: true, message: err })

            return err
        }
    }
})

//RECOVER PASSWORD
router.post("/recover-password", async (req, res) => {
    try {
        const users = await User.findOne({ email: req.body.email })
        if (!users) {
            return res.status(400).json({ status: false, message: "Benutzer existiert nicht" })
        } const hashkey = await Hash.findOne({ userid: users._id })
        if (!hashkey) {
            const newHash = new Hash({
                userid: users._id,
                hash: "",
                status: false
            })
            const user = await newHash.save()
        }
        console.log(hashkey)
        sendNewMail(users.email, users._id).then(e => {
            console.log(e, "eeer")
            if (e == 0) {
                res.status(400).json({ status: false, message: "Email konnte nicht gesendet werden" })
            }
            else {
                res.status(201).json({ status: true, message: "Aktivierungslink wurde gesendet" })
            }
        }
        )
    }
    catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
})

//ACTIVATE OTP USER ACCOUNT
router.post("/activate-account", async (req, res) => {
    try {
        const user = await User.findOne({email:req.body.email})
        console.log(user)
        if (!user) {
            return res.status(404).json({ status: false, message: "Kein Benutzer gefunden" })
        }
        else if (user.otp == "") {
            return res.status(400).json({ status: false, message: "OTP abgelaufen" })
        }
        else {
            const validate = await bcrypt.compare(req.body.otp, user.otp);
            if (validate) {
                const update = await User.findByIdAndUpdate(user._id,{
                    $set:{
                        otp:"",
                        status:true
                    }
                })
                await update.save()
                res.status(200).json({ status: true, message: "OTP korrekt, Accunt aktiviert" })
            }
            else {
                return res.status(400).json({ status: false, message: "OTP falsch." })
            }
        }
    } catch (error) {
        console.log(error)
        res.status(400).json({ status: false, message: error })
    }
})

//GENERATE NEW OTP
router.post("/get-otp", async (req, res) => {
    try {
        // const findUser  = await
        const salt = await bcrypt.genSalt(10)
        const otp = GenerateOTP()
        const hashedOtp = await bcrypt.hash(otp, salt)
        const user = await User.findOneAndUpdate({ email: req.body.email }, {
            $set: {
                otp: hashedOtp
            }
        })
        if (!user) {
            return res.status(404).send({ status: false, message: "Kein Benutzer gefunden" })
        }
        if(user.status)
        {
            return res.status(400).send({ status: false, message: "Benuter bereits verifiziert" })
        }
        await user.save()
        sendOTPEmail(req.body.email,otp).then(e=>{
            console.log(e)
                res.status(200).send({ status: true, message: "Neuer OTP generiert, bitte überprüfen Sie Ihr Postfach" })
        })
    } catch (error) {
        console.log(error)
        res.status(400).send({ status: false, message: error })
    }
})
router.get("/get-users", async (req, res) => {
 try{
    const user  =  await User.find()
    res.status(200).send({ status: true, message: user })

 }
    catch (error) {
        console.log(error)
        res.status(400).send({ status: false, message: error })
    }
})
router.post("/social-login", async (req,res)=>{
    try {
        const user = await User.findOne({email:req.body.email})
        if(user && user.social)
        {
            //LOGIN USER
            const tokenPayload = {
                userId: user._id,
                email: user.email, // You can include additional user-related data here
            };

            // Generate a JWT token with the token payload
            const token = jwt.sign(tokenPayload, 'hellodevstax123@@', { expiresIn: '1h' }); // Replace 'your-secret-key' with a secret key

            // Exclude the password from the response
            const { password, ...other } = user._doc;

            return res.status(200).json({ status: true, message: "Benutzer eingeloggt", user: other, token });
        }
        else if(user && !user.social)
        {
            // THROW EXCEPTION
            return res.status(200).json({ status: false, message: "Diese Email wird bereits verwendet" });
        }
        else{
            //REGISTER USER
            const newUser = new User({
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                email: req.body.email,
                password: "NO_PASSWORD",
                social: true,
                provider:"GOOGLE"
            })
            await newUser.save()
            const tokenPayload = {
                userId: newUser._id,
                email: newUser.email, // You can include additional user-related data here
            };
            const { password, ...other } = newUser._doc;
            const token = jwt.sign(tokenPayload, 'hellodevstax123@@', { expiresIn: '1h' }); // Replace 'your-secret-key' with a secret key
            return res.status(200).json({ status: true, message: "Benutzer registriert und eingeloggt", user: other, token });
        }
    } catch (error) {
        console.log(error)
        return res.status(400).json({ status: false, message:"Ein Fehler ist aufgetretten!" ,error: error});
    }
})

module.exports = router