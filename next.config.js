
const withTM = require('next-transpile-modules')([
  '@project-serum/sol-wallet-adapter',
])

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(withTM({
  target: 'serverless',
  webpack(config, {isServer}) {
      if (!isServer) config.resolve.fallback.fs = false


    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })

    return config
  },
}))
