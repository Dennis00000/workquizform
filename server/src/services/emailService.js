const nodemailer = require('nodemailer');
const { generatePDF } = require('./pdfService');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sendResponseEmail = async (email, template, response, authorName) => {
  const pdfBuffer = await generatePDF(template, response);

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: `Your responses for ${template.title}`,
    html: `
      <h1>Your Form Responses</h1>
      <p>Thank you for filling out the form "${template.title}" by ${authorName}.</p>
      <p>Please find your responses attached as PDF.</p>
    `,
    attachments: [
      {
        filename: `${template.title}-responses.pdf`,
        content: pdfBuffer
      }
    ]
  });
};

module.exports = {
  sendResponseEmail
}; 