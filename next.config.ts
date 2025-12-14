import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // eslint config moved to eslint.config.js (Next.js 16+)
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    NEXT_PUBLIC_WORLDPAY_CHECKOUT_ID:
      process.env.NEXT_PUBLIC_WORLDPAY_CHECKOUT_ID ||
      process.env.WORLDPAY_CHECKOUT_ID ||
      '',
    NEXT_PUBLIC_WORLDPAY_ENVIRONMENT:
      process.env.NEXT_PUBLIC_WORLDPAY_ENVIRONMENT ||
      process.env.WORLDPAY_ENVIRONMENT ||
      'sandbox',
    NEXT_PUBLIC_WORLDPAY_ENTITY_ID:
      process.env.NEXT_PUBLIC_WORLDPAY_ENTITY_ID ||
      process.env.WORLDPAY_ENTITY_ID ||
      '',
  },
  // Hide X-Powered-By header
  poweredByHeader: false,
};

export default nextConfig;
