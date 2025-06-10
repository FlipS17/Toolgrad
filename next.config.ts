import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'images.unsplash.com',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'loremflickr.com',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'i.imgur.com',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'cdn.example.com',
				pathname: '/**',
			},
		],
	},
}

export default nextConfig
