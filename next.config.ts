import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
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
};

export default nextConfig;
