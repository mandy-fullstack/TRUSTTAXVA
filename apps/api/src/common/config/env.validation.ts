/**
 * Validates required environment variables at application startup
 * Throws error if critical variables are missing
 */
export function validateEnv(): void {
  const requiredVars = ['DATABASE_URL', 'JWT_SECRET', 'ENCRYPTION_KEY'];

  const missing: string[] = [];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
        'Please check your .env file or environment configuration.',
    );
  }

  // Validate JWT_SECRET length
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    throw new Error(
      'JWT_SECRET must be at least 32 characters long for security.',
    );
  }

  // Validate ENCRYPTION_KEY length
  if (process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_KEY.length < 32) {
    throw new Error(
      'ENCRYPTION_KEY must be at least 32 characters long for security.',
    );
  }

  // Warn about optional but recommended variables
  const recommendedVars = [
    {
      name: 'REDIS_URL',
      message: 'Redis is recommended for rate limiting and WebSocket scaling',
    },
    {
      name: 'FIREBASE_SERVICE_ACCOUNT_JSON',
      message: 'Firebase is required for push notifications and file storage',
    },
    { name: 'SMTP_USER', message: 'SMTP is required for sending emails' },
  ];

  for (const { name, message } of recommendedVars) {
    if (!process.env[name]) {
      console.warn(`⚠️  ${name} is not set. ${message}`);
    }
  }
}
