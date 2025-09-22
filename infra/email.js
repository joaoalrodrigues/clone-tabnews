import nodemailer from "nodemailer";

async function send(mailOptions) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SMTP_HOST,
    port: process.env.EMAIL_SMTP_PORT,
    auth: {
      user: process.env.EMAIL_SMTP_USER,
      pass: process.env.EMAIL_SMTP_PASSWORD,
    },
    secure: process.env.NODE_ENV === "production",
  });

  await transporter.sendMail({
    ...mailOptions,
  });
}

const email = {
  send,
};

export default email;
