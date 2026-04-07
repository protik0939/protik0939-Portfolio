import nodemailer from "nodemailer";

type SendAdminOtpEmailInput = {
  to: string;
  otpCode: string;
  expiresInMinutes: number;
  adminName?: string | null;
};

type SendContactSubmissionEmailsInput = {
  senderName: string;
  senderEmail: string;
  senderSubject?: string;
  senderMessage: string;
  adminEmail: string;
  siteTitle?: string;
};

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const portRaw = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM;

  if (!host || !portRaw || !user || !pass || !from) {
    throw new Error("SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM must be configured.");
  }

  const port = Number(portRaw);
  if (!Number.isFinite(port)) {
    throw new Error("SMTP_PORT must be a valid number.");
  }

  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  return { host, port, secure, user, pass, from };
}

function createTransporter() {
  const smtp = getSmtpConfig();
  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: {
      user: smtp.user,
      pass: smtp.pass,
    },
  });

  return {
    transporter,
    from: smtp.from,
  };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function toParagraphHtml(value: string) {
  return escapeHtml(value).replaceAll("\n", "<br />");
}

export async function sendAdminOtpEmail(input: SendAdminOtpEmailInput) {
  const { transporter, from } = createTransporter();

  const displayName = input.adminName?.trim() || "Admin";

  await transporter.sendMail({
    from,
    to: input.to,
    subject: "Your Admin OTP Code",
    text: `Hi ${displayName},\n\nYour OTP code is: ${input.otpCode}\nThis code expires in ${input.expiresInMinutes} minutes.\n\nIf you did not request this, ignore this email.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
        <p>Hi ${displayName},</p>
        <p>Your admin OTP code is:</p>
        <p style="font-size:24px;font-weight:700;letter-spacing:4px">${input.otpCode}</p>
        <p>This code expires in ${input.expiresInMinutes} minutes.</p>
        <p>If you did not request this, ignore this email.</p>
      </div>
    `,
  });
}

export async function sendContactSubmissionEmails(input: SendContactSubmissionEmailsInput) {
  const { transporter, from } = createTransporter();

  const siteTitle = input.siteTitle?.trim() || "Portfolio";
  const senderName = input.senderName.trim();
  const senderEmail = input.senderEmail.trim();
  const senderSubject = input.senderSubject?.trim() || "General Inquiry";
  const senderMessage = input.senderMessage.trim();

  const userSubject = `Thanks for contacting ${siteTitle}`;
  const adminSubject = `[New Contact] ${senderSubject} - ${senderName}`;

  await Promise.all([
    transporter.sendMail({
      from,
      to: senderEmail,
      subject: userSubject,
      text: `Hi ${senderName},\n\nThanks for reaching out to ${siteTitle}. I received your message and will get back to you shortly.\n\nYour message:\n${senderMessage}\n\nBest regards,\n${siteTitle}`,
      html: `
        <div style="margin:0;padding:28px;background:#090b13;background-image:radial-gradient(circle at 20% 20%, rgba(175,136,255,0.22), transparent 45%), radial-gradient(circle at 85% 30%, rgba(60,221,199,0.18), transparent 44%), radial-gradient(circle at 70% 82%, rgba(131,66,244,0.2), transparent 50%);font-family:Inter,Segoe UI,Arial,sans-serif;color:#e7e5e4;">
          <div style="max-width:640px;margin:0 auto;border:1px solid rgba(255,255,255,0.12);border-radius:24px;background:rgba(20,22,32,0.68);backdrop-filter:blur(10px);overflow:hidden;">
            <div style="padding:28px 30px;border-bottom:1px solid rgba(255,255,255,0.1);">
              <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#af88ff;">Let's Connect</p>
              <h1 style="margin:0;font-size:34px;line-height:1.1;font-weight:800;color:#ffffff;">Thanks, ${escapeHtml(senderName)}!</h1>
              <p style="margin:12px 0 0;font-size:14px;color:#c7c8d2;line-height:1.7;">Your message reached <strong style="color:#ffffff;">${escapeHtml(siteTitle)}</strong>. I usually reply within one business day.</p>
            </div>
            <div style="padding:24px 30px;">
              <div style="border:1px solid rgba(255,255,255,0.1);border-radius:16px;background:rgba(255,255,255,0.03);padding:18px;">
                <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#8ceee0;">Your Submitted Message</p>
                <p style="margin:0;font-size:14px;line-height:1.75;color:#e7e5e4;">${toParagraphHtml(senderMessage)}</p>
              </div>
            </div>
            <div style="padding:0 30px 28px;">
              <p style="margin:0;font-size:13px;color:#b7bac7;line-height:1.7;">If this email was sent by mistake, you can ignore it safely.</p>
            </div>
          </div>
        </div>
      `,
    }),
    transporter.sendMail({
      from,
      to: input.adminEmail,
      replyTo: senderEmail,
      subject: adminSubject,
      text: `New contact form submission\n\nName: ${senderName}\nEmail: ${senderEmail}\nSubject: ${senderSubject}\n\nMessage:\n${senderMessage}`,
      html: `
        <div style="margin:0;padding:28px;background:#090b13;background-image:radial-gradient(circle at 20% 20%, rgba(175,136,255,0.22), transparent 45%), radial-gradient(circle at 85% 30%, rgba(60,221,199,0.18), transparent 44%), radial-gradient(circle at 70% 82%, rgba(131,66,244,0.2), transparent 50%);font-family:Inter,Segoe UI,Arial,sans-serif;color:#e7e5e4;">
          <div style="max-width:680px;margin:0 auto;border:1px solid rgba(255,255,255,0.12);border-radius:24px;background:rgba(20,22,32,0.72);backdrop-filter:blur(10px);overflow:hidden;">
            <div style="padding:28px 30px;border-bottom:1px solid rgba(255,255,255,0.1);">
              <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#af88ff;">New Lead</p>
              <h1 style="margin:0;font-size:30px;line-height:1.1;font-weight:800;color:#ffffff;">${escapeHtml(senderName)}</h1>
              <p style="margin:12px 0 0;font-size:14px;color:#c7c8d2;">${escapeHtml(senderEmail)} | ${escapeHtml(senderSubject)}</p>
            </div>
            <div style="padding:24px 30px;">
              <div style="border:1px solid rgba(255,255,255,0.1);border-radius:16px;background:rgba(255,255,255,0.03);padding:18px;">
                <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#8ceee0;">Message</p>
                <p style="margin:0;font-size:14px;line-height:1.75;color:#e7e5e4;">${toParagraphHtml(senderMessage)}</p>
              </div>
              <p style="margin:16px 0 0;font-size:12px;color:#b7bac7;">Reply directly to this email to contact the sender.</p>
            </div>
          </div>
        </div>
      `,
    }),
  ]);
}
