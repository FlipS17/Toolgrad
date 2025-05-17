import Footer from '@/app/components/Footer'
import Header from '@/app/components/Header'
import { NotificationProvider } from '@/app/components/NotificationProvider'
import SessionProviderWrapper from '@/app/components/SessionProviderWrapper'
import { FavoriteProvider } from '@/app/favorite/components/FavoriteProvider' // ✅ добавлено
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { CartProvider } from './cart/components/CartProvider'
import './globals.css'

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
})

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
})

export const metadata: Metadata = {
	title: 'ToolGrad',
	description:
		'Широкий выбор строительных инструментов и садового инвентаря по выгодным ценам',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang='ru' className='h-full'>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-full bg-gray-50`}
			>
				<SessionProviderWrapper>
					<NotificationProvider>
						<CartProvider>
							<FavoriteProvider>
								<Header />
								<main className='flex-grow'>{children}</main>
								<Footer />
							</FavoriteProvider>
						</CartProvider>
					</NotificationProvider>
				</SessionProviderWrapper>
			</body>
		</html>
	)
}
