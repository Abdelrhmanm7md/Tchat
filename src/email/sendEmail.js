import nodemailer from "nodemailer";
import { emailTemplate } from "./emailTemp.js";


export async function sendEmail(message,email ,name, phone) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "tchat717@gmail.com",
      pass: "wfmkudabxasptdtm",
    },
  });

  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: `Help Center" <tchat717@gmail.com>`,
    to: "info.tchatpro@gmail.com", 
    subject: "Help Center", 
    html: emailTemplate(email,message,name,phone),
  });

  console.log("Message sent: %s", info.messageId);

}
