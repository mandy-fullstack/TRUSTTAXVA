import { TokenService } from "../../apps/api/src/auth/token.service";

async function main() {
  console.log("🔒 Verifying High-Security URL Tokens (AES-256-GCM)...");

  const tokenService = new TokenService();

  // 1. Test Email Verification Token
  console.log("\n[1] Testing Email Verification Token:");
  const emailPayload = {
    email: "test@example.com",
    type: "email_verification",
  };
  const emailToken = tokenService.createUrlToken(emailPayload);
  console.log("   Generated Token:", emailToken);
  console.log("   Token Length:", emailToken.length);

  const decryptedEmail = tokenService.verifyUrlToken(emailToken);
  console.log("   Decrypted Payload:", decryptedEmail);

  if (
    decryptedEmail &&
    decryptedEmail.email === "test@example.com" &&
    decryptedEmail.type === "email_verification"
  ) {
    console.log("   ✅ Email Token Verification SUCCESS");
  } else {
    console.error("   ❌ Email Token Verification FAILED");
  }

  // 2. Test Password Reset Token
  console.log("\n[2] Testing Password Reset Token:");
  const resetPayload = { sub: "user-123-uuid", type: "password_reset" };
  const resetToken = tokenService.createUrlToken(resetPayload);
  console.log("   Generated Token:", resetToken);

  const decryptedReset = tokenService.verifyUrlToken(resetToken);
  console.log("   Decrypted Payload:", decryptedReset);

  if (
    decryptedReset &&
    decryptedReset.sub === "user-123-uuid" &&
    decryptedReset.type === "password_reset"
  ) {
    console.log("   ✅ Reset Token Verification SUCCESS");
  } else {
    console.error("   ❌ Reset Token Verification FAILED");
  }

  // 3. Test Invalid Token
  console.log("\n[3] Testing Invalid (Tampered) Token:");
  // Tamper with the middle part (auth tag) or end (content)
  const parts = emailToken.split(".");
  const tamperedToken = `${parts[0]}.${parts[1]}.${parts[2].substring(0, parts[2].length - 2)}00`;

  const decryptedTampered = tokenService.verifyUrlToken(tamperedToken);
  console.log("   Decrypted Tampered:", decryptedTampered);

  if (decryptedTampered === null) {
    console.log("   ✅ Tampered Token correctly REJECTED");
  } else {
    console.error("   ❌ Tampered Token was NOT rejected");
  }
}

main().catch(console.error);
