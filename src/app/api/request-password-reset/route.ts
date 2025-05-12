import { sendPasswordResetEmail } from '@/app/lib/mail'
import { prisma } from '@/utils/db'
import { randomUUID } from 'crypto'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
	const { email } = await req.json()

	if (!email) {
		return NextResponse.json({ message: 'Email обязателен' }, { status: 400 })
	}

	const user = await prisma.user.findUnique({ where: { email } })

	if (!user) {
		return NextResponse.json(
			{ message: 'Почта не зарегистрирована' },
			{ status: 400 }
		)
	}

	const token = randomUUID()
	const expires = new Date(Date.now() + 15 * 60 * 1000)

	await prisma.passwordResetToken.create({
		data: {
			email,
			token,
			expires,
		},
	})

	await sendPasswordResetEmail(email, token)

	return NextResponse.json({ message: 'Письмо отправлено' })
}
