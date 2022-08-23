const nodemailer = require('nodemailer');

module.exports = async (email , subject , text)=>{
    try {
         // create reusable transporter object using the default SMTP transport
      let transporter = nodemailer.createTransport({
        host: "smtp.gmail.email",
        service: "gmail",
        port: 587,
        secure: true, 
        auth: {
          user: "a.abdo.mae@gmail.com", 
          pass: "abdo1500@", 
        },
      });
      
      let info = await transporter.sendMail({
        from: '"abdo mos👻" <foo@example.com>', // sender address
        to: email,
        subject: subject, // Subject line
        text: text, // plain text body
        html: "<b>Hello world?</b>", // html body
      });
      console.log("Message sent: %s", info.messageId);
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

    } catch (error) {
        console.log(error);
        console.log("email not send")
    }

}