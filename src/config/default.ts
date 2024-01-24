import type { Config } from '.';
import { getEnvironmentValue } from '.';

export const config: Config = {
  appName: 'mentored 🚀',
  env: getEnvironmentValue('NODE_ENV', 'development') as Config['env'],
  server: {
    port: Number(getEnvironmentValue('PORT', '4000')),
  },
  db: {
    uri: getEnvironmentValue(
      'MONGODB_URI',
      'mongodb://localhost:27017/mentored'
    ),
  },
  jwt: {
    secret: getEnvironmentValue(
      'JWT_SECRET',
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    ),
  },
  tokenLength: parseInt(getEnvironmentValue('TOKEN_LENGTH', '4')),
  resendApiKey: getEnvironmentValue(
    'RESEND_API_KEY',
    're_JZ3HwHjo_8pwPWsuLQPPMAoZcKCdb3caV'
  ),
  mentoredDomain: getEnvironmentValue('MENTORED_DOMAIN', 'mentored'),
  redis: {
    host: getEnvironmentValue('REDIS_HOST', 'localhost'),
    port: Number(getEnvironmentValue('REDIS_PORT', '6379')),
    password: getEnvironmentValue('REDIS_PASSWORD', 'mentored'),
    username: getEnvironmentValue('REDIS_USERNAME', 'default'),
  },
  cryptoKey: getEnvironmentValue(
    'CRYPTOGRAPHIC_KEY',
    'rN43B1Y8fzjGcUXLQ9OGoGvAk5PD9jQQ'
  ),
  email: {
    host: getEnvironmentValue('EMAIL_HOST', 'smtp.gmail.com'),
    port: Number(getEnvironmentValue('EMAIL_PORT', '587')),
    secure: !!getEnvironmentValue('EMAIL_SECURE', 'true'),
    user: getEnvironmentValue('EMAIL_USER', ''),
    password: getEnvironmentValue('EMAIL_PASSWORD', ''),
  },
  sanity: {
    projectId: getEnvironmentValue('SANITY_PROJECT_ID', 'develop'),
    dataset: getEnvironmentValue('SANITY_DATASET', ''),
    sanityToken: getEnvironmentValue('SANITY_TOKEN', ''),
    sanityApiUrl: getEnvironmentValue('SANITY_API_URL', ''),
  },
  cloudinary: {
    cloudName: getEnvironmentValue('CLOUDINARY_CLOUD_NAME', 'dqezpdvy9'),
    apiKey: getEnvironmentValue('CLOUDINARY_API_KEY', '246383416619938'),
    apiSecret: getEnvironmentValue(
      'CLOUDINARY_API_SECRET',
      'Uk0RW54o5bxB00zkJDvyiGAj-PU'
    ),
  },
  twilio: {
    accountSid: getEnvironmentValue('TWILIO_ACCOUNT_SID', ''),
    apiKey: getEnvironmentValue('TWILIO_API_KEY_SID', ''),
    apiKeySecret: getEnvironmentValue('TWILIO_API_KEY_SECRET', ''),
  },
};
