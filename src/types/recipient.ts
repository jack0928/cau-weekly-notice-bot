// Recipient type for email delivery.

export interface Recipient {
  name: string;    // For management/identification (e.g., "홍길동 교수님", "학과사무실")
  email: string;   // Actual email address
}
