// Responsible for converting notices into email-friendly content.

import type { Notice } from "../../types/notice";

export interface FormattedEmail {
  subject: string;
  textBody: string;
  htmlBody?: string;
}

export function formatWeeklyEmail(
  _notices: Notice[],
  _options?: { subjectPrefix?: string }
): FormattedEmail {
  // TODO: build subject and body based on notices.
  return {
    subject: "",
    textBody: "",
  };
}

