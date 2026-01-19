import { Data } from "effect";

export class SMSError extends Data.TaggedError("SMSError")<{
  message: string;
  cause?: unknown;
}> {}

export class EmailError extends Data.TaggedError("EmailError")<{
  message: string;
  cause?: unknown;
}> {}
