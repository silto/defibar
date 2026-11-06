/** @type {import('next').NextConfig} */
for (const name of ['NEXT_PUBLIC_API_URL', 'NEXT_PUBLIC_APP_URL']) {
  if (!process.env[name]) throw new Error(`${name} must be set before building the frontend`);
}

module.exports = {
  reactStrictMode: true,
  output: 'export',
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      issuer: {
        and: [/\.(js|ts)x?$/],
      },

      use: ['@svgr/webpack'],
    });

    return config;
  },
};
