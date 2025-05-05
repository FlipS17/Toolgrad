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
				hostname: '**.example.com', // Добавьте ваши реальные домены
			},
		],
	},
}

export default nextConfig
