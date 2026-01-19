import { Effect, Schedule, Duration } from "effect";
import nodemailer from "nodemailer";
import { EmailError } from "./errors";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const retryPolicy = Schedule.exponential(Duration.seconds(1)).pipe(
  Schedule.compose(Schedule.recurs(3))
);

export function sendEmail(to: string, subject: string, html: string) {
  const from = process.env.EMAIL_FROM;
  if (!from) {
    return Effect.fail(new EmailError({ message: "EMAIL_FROM not configured" }));
  }
  return Effect.tryPromise({
    try: () =>
      transporter.sendMail({
        from,
        to,
        subject,
        html,
      }),
    catch: (error) =>
      new EmailError({ message: "Failed to send email", cause: error }),
  }).pipe(
    Effect.retry(retryPolicy),
    Effect.timeout(Duration.seconds(30))
  );
}
