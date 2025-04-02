import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
    },
});

/**
 * Gửi email
 * @param {string} to - Email người nhận
 * @param {string} subject - Tiêu đề email
 * @param {string} html - Nội dung email
 */
export const sendEmail = async (to, subject, html) => {
    try {
        const mailOptions = {
            from: `"TripConnect Support" <${process.env.EMAIL_USERNAME}>`,
            to,
            subject,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("📧 Email sent:", info.response);
        return true;
    } catch (error) {
        console.error("❌ Error sending email:", error);
        return false;
    }
};
