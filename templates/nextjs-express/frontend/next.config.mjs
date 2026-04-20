  import { withSentryConfig } from '@sentry/nextjs';

  const nextConfig = {
    reactStrictMode: true,
  };

  export default withSentryConfig(nextConfig, {
    // Suppress source map upload warnings in local dev
    silent: !process.env.CI,

    // Disable source map upload for the reference app (no auth token)
    disableServerWebpackPlugin: true,
    disableClientWebpackPlugin: true,
  });