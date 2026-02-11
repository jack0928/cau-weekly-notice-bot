// Test runner for mail sender.
// Usage: npm run test:mail

import "dotenv/config";
import { sendMail } from "../src/core/mail/mailSender.js";

async function main() {
  await sendMail("테스트 메일입니다", "이것은 테스트 메일입니다.");
  // eslint-disable-next-line no-console
  console.log("메일 전송 완료");
}

void main();
