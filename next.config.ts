import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'loremflickr.com',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: '**.example.com',
			},
		],
	},
}

export default nextConfig
