const HANUOTP_ENDPOINT = "https://api.hanuotp.in/sms-otp.php";

// HanuOTP is a plain SMS-delivery gateway, not an OTP provider — it doesn't
// generate or verify codes itself. We generate the code, hash + store it
// ourselves (see lib/otp.ts and models/Otp.ts), and only use this to deliver
// the SMS. Their public site doesn't document a response schema, so we treat
// any HTTP-OK response as a successful send rather than parsing a specific
// success field we can't confirm exists.
export async function sendOtpSms(mobileNumber: string, code: string): Promise<void> {
  const apiKey = process.env.HANUOTP_API_KEY;
  if (!apiKey) {
    throw new Error("HANUOTP_API_KEY environment variable is not set");
  }

  const params = new URLSearchParams({
    number: mobileNumber,
    OTP: code,
    apikey: apiKey,
    templatesid: "default",
  });

  const response = await fetch(`${HANUOTP_ENDPOINT}?${params.toString()}`);
  const raw = await response.text();

  if (!response.ok) {
    console.error("HanuOTP send failed", response.status, raw);
    throw new Error("Failed to send OTP SMS");
  }

  console.log("HanuOTP send response", raw);
}
