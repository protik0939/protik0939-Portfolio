import { NextRequest, NextResponse } from "next/server";
import { sendContactSubmissionEmails } from "@/lib/admin-email";
import { verifyCaptcha } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type ContactBody = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  captchaToken?: string;
  captchaAnswer?: string;
};

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ContactBody;

    const name = normalizeText(body.name);
    const email = normalizeText(body.email).toLowerCase();
    const subject = normalizeText(body.subject);
    const message = normalizeText(body.message);
    const captchaToken = normalizeText(body.captchaToken);
    const captchaAnswer = normalizeText(body.captchaAnswer);

    if (!name || !email || !message || !captchaToken || !captchaAnswer) {
      return NextResponse.json({ error: "Name, email, message, and captcha are required." }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    if (name.length > 120 || subject.length > 200 || message.length > 5000) {
      return NextResponse.json({ error: "Input is too long." }, { status: 400 });
    }

    const captchaOk = verifyCaptcha(captchaToken, captchaAnswer);
    if (!captchaOk) {
      return NextResponse.json({ error: "Captcha verification failed." }, { status: 400 });
    }

    const siteConfig = await prisma.siteConfig.findUnique({
      where: { singletonKey: 1 },
      select: {
        siteTitleEn: true,
        contactEmail: true,
      },
    });

    const adminEmail = normalizeText(process.env.ADMIN_EMAIL) || normalizeText(siteConfig?.contactEmail);
    if (!adminEmail) {
      return NextResponse.json({ error: "ADMIN_EMAIL is not configured." }, { status: 500 });
    }

    const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || null;
    const userAgent = request.headers.get("user-agent") || null;

    const saved = await prisma.contactMessage.create({
      data: {
        name,
        email,
        subject: subject || null,
        message,
        ipAddress,
        userAgent,
      },
    });

    await sendContactSubmissionEmails({
      senderName: name,
      senderEmail: email,
      senderSubject: subject,
      senderMessage: message,
      adminEmail,
      siteTitle: siteConfig?.siteTitleEn || "Portfolio",
    });

    await prisma.contactMessage.update({
      where: { id: saved.id },
      data: { respondedAt: new Date() },
    });

    return NextResponse.json({ ok: true, message: "Thanks! Your message has been sent successfully." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send message.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
