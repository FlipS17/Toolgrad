import { sendVerificationEmail } from '@/app/lib/mail'
import { prisma } from '@/utils/db'
import { NextResponse } from 'next/server'
import { RateLimiterMemory } from 'rate-limiter-flexible'

// Лимиты
const emailLimiter = new RateLimiterMemory({
	points: 3,
	duration: 3600,
})

const ipLimiter = new RateLimiterMemory({
	points: 20,
	duration: 3600,
})

export async function POST(req: Request) {
	const body = await req.json()
	const { email, data } = body
	const ip = (req.headers.get('x-forwarded-for') || 'unknown')
		.split(',')[0]
		.trim()

	// Валидация
	if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		return NextResponse.json(
			{ message: 'Неверный формат email' },
			{ status: 400 }
		)
	}

	// // Ошибки лимитов
	try {
		await Promise.all([emailLimiter.consume(email), ipLimiter.consume(ip)])
	} catch {
		return NextResponse.json(
			{ message: 'Слишком много запросов. Попробуйте позже.' },
			{ status: 429 }
		)
	}

	// Код и время действия
	const code = Math.floor(100000 + Math.random() * 900000).toString()
	const expires = new Date(Date.now() + 5 * 60 * 1000)

	try {
		await prisma.verificationCode.upsert({
			where: { email },
			update: {
				code,
				expires,
				data,
				lastSentAt: new Date(),
			},
			create: {
				email,
				code,
				expires,
				data,
				lastSentAt: new Date(),
			},
		})

		await sendVerificationEmail(email, code)
		return NextResponse.json({ message: 'Код отправлен' })
	} catch (e) {
		console.error('Ошибка:', e)
		return NextResponse.json({ message: 'Ошибка сервера' }, { status: 500 })
	}
}
