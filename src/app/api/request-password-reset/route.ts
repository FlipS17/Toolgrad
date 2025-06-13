import { sendPasswordResetEmail } from '@/app/lib/mail'
import { prisma } from '@/utils/db'
import { randomUUID } from 'crypto'
import { NextResponse } from 'next/server'
import { RateLimiterMemory } from 'rate-limiter-flexible'

const emailLimiter = new RateLimiterMemory({
	points: 3,
	duration: 3600,
})

const ipLimiter = new RateLimiterMemory({
	points: 10,
	duration: 3600,
})

export async function POST(req: Request) {
	const { email } = await req.json()
	const ip = (req.headers.get('x-forwarded-for') || 'unknown')
		.split(',')[0]
		.trim()

	if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		return NextResponse.json(
			{ message: 'Неверный формат email' },
			{ status: 400 }
		)
	}

	try {
		await Promise.all([emailLimiter.consume(email), ipLimiter.consume(ip)])
	} catch {
		return NextResponse.json(
			{ message: 'Слишком много запросов. Попробуйте позже.' },
			{ status: 429 }
		)
	}

	const user = await prisma.user.findUnique({ where: { email } })
	if (!user) {
		return NextResponse.json(
			{ message: 'Пользователь с таким email не найден' },
			{ status: 400 }
		)
	}

	const lastRequest = await prisma.passwordResetToken.findFirst({
		where: { email },
		orderBy: { createdAt: 'desc' },
	})

	if (lastRequest && Date.now() - lastRequest.createdAt.getTime() < 30000) {
		return NextResponse.json(
			{ message: 'Повторная отправка возможна через 30 секунд' },
			{ status: 400 }
		)
	}

	const token = randomUUID()
	const expires = new Date(Date.now() + 15 * 60 * 1000)

	try {
		await prisma.passwordResetToken.create({
			data: {
				email,
				token,
				expires,
				ip: ip,
				userAgent: req.headers.get('user-agent') || null,
			},
		})

		await sendPasswordResetEmail(email, token)
		return NextResponse.json({ message: 'Письмо отправлено' })
	} catch (e) {
		console.error('Ошибка:', e)
		return NextResponse.json({ message: 'Ошибка сервера' }, { status: 500 })
	}
}
