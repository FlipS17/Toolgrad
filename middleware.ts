import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
	const token = await getToken({
		req,
		secret: process.env.NEXTAUTH_SECRET,
	})

	const url = req.nextUrl
	const pathname = url.pathname

	// 🔒 Страницы только для НЕавторизованных пользователей
	const guestOnlyRoutes = ['/account', '/account/reset-password']
	if (
		guestOnlyRoutes.some(
			route => pathname === route || pathname.startsWith(`${route}/`)
		)
	) {
		if (token) {
			return NextResponse.redirect(new URL('/', req.url))
		}
	}

	// 🔐 Страницы только для авторизованных пользователей
	const authOnlyRoutes = [
		'/account/profile',
		'/account/orders',
		'/account/delivery',
	]
	if (
		authOnlyRoutes.some(
			route => pathname === route || pathname.startsWith(`${route}/`)
		)
	) {
		if (!token) {
			return NextResponse.redirect(new URL('/', req.url))
		}
	}

	// 🚫 Полный запрет на прямой переход по /delivery и /pickup
	if (pathname === '/delivery' || pathname === '/pickup') {
		return NextResponse.redirect(new URL('/', req.url))
	}

	return NextResponse.next()
}

export const config = {
	// Применяем middleware ко всем нужным маршрутам
	matcher: ['/account/:path*', '/delivery', '/pickup'],
}
