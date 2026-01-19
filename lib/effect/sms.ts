import { Effect, Schedule, Duration } from "effect";
import { SMSError } from "./errors";

const retryPolicy = Schedule.exponential(Duration.seconds(1)).pipe(
  Schedule.compose(Schedule.recurs(3))
);

export function sendSMS(number: string, message: string) {
  return Effect.tryPromise({
    try: async () => {
      const apiKey = process.env.ONECODESOFT_API_KEY;
      const senderId = process.env.ONECODESOFT_SENDER_ID;
      if (!apiKey || !senderId) throw new Error("SMS env not configured");
      const response = await fetch("https://sms.onecodesoft.com/api/send-sms", {
        method: "POST",
        body: new URLSearchParams({
          api_key: apiKey,
          senderid: senderId,
          number,
          message,
        }),
      });
      if (!response.ok) throw new Error(`SMS failed: ${response.status}`);
      return response.json();
    },
    catch: (error) =>
      new SMSError({ message: "Failed to send SMS", cause: error }),
  }).pipe(
    Effect.retry(retryPolicy),
    Effect.timeout(Duration.seconds(30))
  );
}

/** Bulk SMS: different messages to different numbers. Keys: Number, Text (PascalCase). */
export function sendBulkSMS(messages: { number: string; text: string }[]) {
  if (messages.length === 0) return Effect.succeed(undefined);
  const MessageParameters = messages.map((m) => ({ Number: m.number, Text: m.text }));
  return Effect.tryPromise({
    try: async () => {
      const apiKey = process.env.ONECODESOFT_API_KEY;
      const senderId = process.env.ONECODESOFT_SENDER_ID;
      if (!apiKey || !senderId) throw new Error("SMS env not configured");
      const response = await fetch("https://sms.onecodesoft.com/api/send-bulk-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: apiKey, senderid: senderId, MessageParameters }),
      });
      if (!response.ok) throw new Error(`Bulk SMS failed: ${response.status}`);
      return response.json();
    },
    catch: (error) =>
      new SMSError({ message: "Failed to send bulk SMS", cause: error }),
  }).pipe(
    Effect.retry(retryPolicy),
    Effect.timeout(Duration.seconds(30))
  );
}
