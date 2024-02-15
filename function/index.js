const Hash = require("../models/hash")
const nodemailer = require("nodemailer")
const { Resend } = require("resend");

const sendNewMail = async (email, id) => {
    const hash = makeid(100) + `&&ID=${id}`
    console.log(hash)
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        requireTLS: true,
        auth: {
            user: 'helpdesk.servicesparrow@gmail.com',
            pass: 'gosu shca uwnn rlej'
        }
    });

    let mailOptions = {
        from: 'helpdesk.servicesparrow@gmail.com',
        to: email,
        subject: 'Passwort zurücksetzen',
        html: `<div>
            <h2>Mit dem folgenden Link können Sie ihr Passwort zurücksetzen</h2>
            <p>Bitte beachten Sie das der Link nach einer gewissen Zeit abläuft</p>
            <a href=${`http://localhost:3000/reset-password/${hash}`} target="_blank" >Reset Password</a>
     </div>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error.message)
            return 0;
        }
        else {
            console.log("success")

            return 1
        }
    });
    try {
        await Hash.findOneAndUpdate(
            { userid: id },
            {
                $set: {
                    hash: hash
                },
            },
            { new: true }
        );

        return 1
    }
    catch (err) {
        console.log(err)
        return err

    }
}

const sendOTPEmail = async (email, otp) => {
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        requireTLS: true,
        auth: {
            user: 'helpdesk.servicesparrow@gmail.com',
            pass: 'gosu shca uwnn rlej'
        }
    });

    let mailOptions = {
        from: 'helpdesk.servicesparrow@gmail.com',
        to: email,
        subject: 'Ihr Aktivierungscode',
        html: `<div>
           <h1>Hier finden Sie Ihren Aktivierungscode um Ihren Account zu aktivieren</h1>
           <p>Dieser Code wird nach einer gewissen Zeit ablaufen</p>
           <h2>${otp}</h2>
        </div>`
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", info);
        return 1;
    } catch (error) {
        console.error("Error sending email:", error.message);
        return 0;
    }
};


function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

const GenerateOTP = () => {

    var result = '';
    var characters = '0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < 4; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;

}

module.exports = {
    sendNewMail, GenerateOTP, sendOTPEmail
}