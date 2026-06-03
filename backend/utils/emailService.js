const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS }
});

const sendVerificationEmail = async (email, name, uid) => {
  const link = `${process.env.FRONTEND_URL}/verify-email?uid=${uid}`;
  await transporter.sendMail({
    from: `"QuickSell" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Verify your QuickSell account',
    html: `<div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:30px;border:1px solid #eee;border-radius:10px">
      <h2 style="color:#3b82f6">Welcome to QuickSell, ${name}! 🎉</h2>
      <p>Click the button below to verify your email address:</p>
      <a href="${link}" style="display:inline-block;padding:12px 24px;background:#3b82f6;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold">Verify Email</a>
      <p style="color:#999;font-size:12px;margin-top:20px">Link expires in 24 hours. If you didn't create this account, ignore this email.</p>
    </div>`
  });
};

const sendListingStatusEmail = async (email, name, title, status, reason = '') => {
  const isApproved = status === 'approved';
  await transporter.sendMail({
    from: `"QuickSell" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: `Your listing "${title}" has been ${status}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:30px;border:1px solid #eee;border-radius:10px">
      <h2 style="color:${isApproved ? '#10b981' : '#ef4444'}">Listing ${isApproved ? '✅ Approved' : '❌ Rejected'}</h2>
      <p>Hi ${name},</p>
      <p>Your listing <strong>"${title}"</strong> has been <strong>${status}</strong>.</p>
      ${!isApproved && reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      ${isApproved ? `<p>Your listing is now live on QuickSell!</p>` : '<p>You may re-submit after making changes.</p>'}
      <a href="${process.env.FRONTEND_URL}" style="display:inline-block;padding:12px 24px;background:#3b82f6;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold">Go to QuickSell</a>
    </div>`
  });
};

const sendWelcomeEmail = async (email, name) => {
  await transporter.sendMail({
    from: `"QuickSell" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Welcome to QuickSell!',
    html: `<div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:30px;border:1px solid #eee;border-radius:10px">
      <h2 style="color:#3b82f6">Welcome to QuickSell! 🛍️</h2>
      <p>Hi ${name}, your account is ready.</p>
      <p>Start buying and selling in Jaipur today!</p>
      <a href="${process.env.FRONTEND_URL}" style="display:inline-block;padding:12px 24px;background:#3b82f6;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold">Get Started</a>
    </div>`
  });
};

module.exports = { sendVerificationEmail, sendListingStatusEmail, sendWelcomeEmail };
