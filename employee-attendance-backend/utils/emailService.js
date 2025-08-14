const nodemailer = require("nodemailer")

// Create transporter using environment variables
const createTransport = () => {
  const emailPass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s/g, "") : null

  if (!process.env.EMAIL_USER || !emailPass) {
    throw new Error("Email credentials not configured properly")
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: Number.parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: emailPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  })
}

// Send welcome email with credentials to new employee
const sendWelcomeEmail = async (employeeData) => {
  try {
    console.log("🔄 Attempting to send welcome email to:", employeeData.email)

    const transporter = createTransport()

    await transporter.verify()
    console.log("✅ SMTP connection verified")

    const { name, email, employeeId, temporaryPassword, department, designation } = employeeData

    const mailOptions = {
      from: `"${process.env.COMPANY_NAME || "Employee Tracking System"}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to the Team - Your Login Credentials",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2c3e50; margin-bottom: 10px;">Welcome to ${process.env.COMPANY_NAME || "Our Company"}!</h1>
            <p style="color: #7f8c8d; font-size: 16px;">We're excited to have you join our team</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #2c3e50; margin-bottom: 15px;">Hello ${name},</h2>
            <p style="color: #34495e; line-height: 1.6; margin-bottom: 15px;">
              Congratulations on joining us as a <strong>${designation}</strong> in the <strong>${department}</strong> department! 
              Below are your login credentials for the Employee Tracking System.
            </p>
          </div>
          
          <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #27ae60;">
            <h3 style="color: #27ae60; margin-bottom: 15px;">🔐 Your Login Credentials</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #2c3e50; font-weight: bold;">Employee ID:</td>
                <td style="padding: 8px 0; color: #34495e; font-family: monospace; background-color: #fff; padding: 5px 10px; border-radius: 4px;">${employeeId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #2c3e50; font-weight: bold;">Temporary Password:</td>
                <td style="padding: 8px 0; color: #34495e; font-family: monospace; background-color: #fff; padding: 5px 10px; border-radius: 4px;">${temporaryPassword}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ffc107;">
            <h4 style="color: #856404; margin-bottom: 10px;">⚠️ Important Security Notice</h4>
            <ul style="color: #856404; margin: 0; padding-left: 20px;">
              <li>Please change your password immediately after your first login</li>
              <li>Keep your credentials secure and do not share them with anyone</li>
              <li>Contact IT support if you have any login issues</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #7f8c8d; margin-bottom: 10px;">Need help? Contact our support team</p>
            <p style="color: #7f8c8d; font-size: 14px;">
              Email: ${process.env.COMPANY_EMAIL || "support@company.com"} | 
              Phone: ${process.env.COMPANY_PHONE || "+1-234-567-8900"}
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee;">
            <p style="color: #95a5a6; font-size: 12px;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        </div>
      `,
      text: `
Welcome to ${process.env.COMPANY_NAME || "Our Company"}!

Hello ${name},

Congratulations on joining us as a ${designation} in the ${department} department!

Your Login Credentials:
- Employee ID: ${employeeId}
- Temporary Password: ${temporaryPassword}

IMPORTANT: Please change your password immediately after your first login.

For support, contact: ${process.env.COMPANY_EMAIL || "support@company.com"}

This is an automated message. Please do not reply to this email.
      `,
    }

    console.log("📧 Sending email with options:", {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
    })

    const info = await transporter.sendMail(mailOptions)
    console.log("✅ Welcome email sent successfully:", info.messageId)

    return {
      success: true,
      messageId: info.messageId,
      message: "Welcome email sent successfully",
    }
  } catch (error) {
    console.error("❌ Error sending welcome email:", error)
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      command: error.command,
    })

    return {
      success: false,
      error: error.message,
      message: "Failed to send welcome email",
    }
  }
}

// Test email configuration
const testEmailConfig = async () => {
  try {
    console.log("🔄 Testing email configuration...")
    const transporter = createTransport()
    await transporter.verify()
    console.log("✅ Email configuration is valid")
    return { success: true, message: "Email configuration is valid" }
  } catch (error) {
    console.error("❌ Email configuration error:", error)
    return { success: false, error: error.message }
  }
}

module.exports = {
  sendWelcomeEmail,
  testEmailConfig,
}
