const nodemailer = require("nodemailer");

const mailHelper=async(option)=>{
    const transporter = nodemailer.createTransport({
        // get hostname and all from mailtrap
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },

    });

    const message={
        from: 'contactbhagatsachin@gmail.com', // sender address
        to: option.email, // list of receivers
        subject: option.subject, // Subject line
        text: option.message, // plain text body
    }
    await transporter.sendMail(message);
}

module.exports=mailHelper;