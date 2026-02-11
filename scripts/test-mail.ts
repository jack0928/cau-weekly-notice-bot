// Test runner for mail sender.
// Usage: npm run test:mail

import "dotenv/config";
import { sendMail } from "../src/core/mail/mailSender.js";

async function main() {
  const testHtml = `
    <div style="font-family: Arial, sans-serif;">
      <h2>테스트 메일입니다</h2>
      <p>이것은 <strong>HTML</strong> 형식의 테스트 메일입니다.</p>
      <ul>
        <li>항목 1</li>
        <li>항목 2</li>
      </ul>
    </div>
  `;
  
  await sendMail("테스트 메일입니다", testHtml);
  // eslint-disable-next-line no-console
  console.log("메일 전송 완료");
}

void main();
