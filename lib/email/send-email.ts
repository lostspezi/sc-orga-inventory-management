/**
 * Unified email sending.
 *
 * - Production (RESEND_API_KEY set): routes through Resend.
 * - Development / local (no RESEND_API_KEY): routes through MailDev SMTP
 *   running at SMTP_HOST:SMTP_PORT (default localhost:1025).
 *   Start MailDev with: docker compose -f docker-compose.maildev.yml up -d
 *   Then view sent emails at http://localhost:1080
 */

import { Resend } from "resend";
import nodemailer from "nodemailer";

export type EmailAttachment = {
    filename: string;
    content: Buffer;
    contentType: string;
};

export type SendEmailOptions = {
    to: string;
    subject: string;
    html: string;
    text: string;
    attachments?: EmailAttachment[];
};

export async function sendEmail(opts: SendEmailOptions): Promise<void> {
    const from =
        process.env.EMAIL_FROM ??
        "SC Orga Manager <no-reply@scoim.io>";

    if (process.env.RESEND_API_KEY) {
        await sendViaResend(from, opts);
    } else {
        await sendViaSmtp(from, opts);
    }
}

async function sendViaResend(from: string, opts: SendEmailOptions): Promise<void> {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { error } = await resend.emails.send({
        from,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
        attachments: opts.attachments?.map((a) => ({
            filename: a.filename,
            content: a.content,
        })),
    });

    if (error) {
        throw new Error(`Resend error: ${error.message}`);
    }
}

async function sendViaSmtp(from: string, opts: SendEmailOptions): Promise<void> {
    const host = process.env.SMTP_HOST ?? "localhost";
    const port = parseInt(process.env.SMTP_PORT ?? "1025", 10);

    const transporter = nodemailer.createTransport({
        host,
        port,
        secure: false,
        ignoreTLS: true,
    });

    await transporter.sendMail({
        from,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
        attachments: opts.attachments?.map((a) => ({
            filename: a.filename,
            content: a.content,
            contentType: a.contentType,
        })),
    });
}
