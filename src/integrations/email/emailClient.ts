// Email provider abstraction. Concrete implementation will wrap a library such as nodemailer or an API.

import type { FormattedEmail } from "../../core/formatting/emailFormatter.js";

export interface EmailClient {
  send(message: FormattedEmail): Promise<void>;
}

export function createEmailClientFromEnv(): EmailClient {
  // TODO: read environment variables and construct a concrete email client.
  return {
    async send(_message: FormattedEmail): Promise<void> {
      // TODO: implement email sending.
    },
  };
}

