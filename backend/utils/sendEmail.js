const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create transporter using Gmail service
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER ,
      pass: process.env.EMAIL_PASS , 
    },
  });

  // Define email options
  const message = {
    from: `"Deepak Steel Udyog" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #2563eb;">Deepak Steel Udyog</h2>
        <p style="font-size: 16px;">${options.message.replace(/\n/g, '<br/>')}</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #777;">This is an automated message, please do not reply.</p>
      </div>
    `
  };

  // Send email
  const info = await transporter.sendMail(message);

  console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;
