import { prisma } from '@/utils/db'
import { hash } from 'bcryptjs'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
	const { token, password } = await req.json()

	if (!token || !password) {
		return NextResponse.json(
			{ message: 'Токен и пароль обязательны' },
			{ status: 400 }
		)
	}

	const record = await prisma.passwordResetToken.findUnique({
		where: { token },
	})

	if (!record || record.expires < new Date()) {
		return NextResponse.json(
			{ message: 'Ссылка недействительна или устарела' },
			{ status: 400 }
		)
	}

	const hashed = await hash(password, 10)

	await prisma.user.update({
		where: { email: record.email },
		data: { password: hashed },
	})

	await prisma.passwordResetToken.delete({ where: { token } })

	return NextResponse.json({ message: 'Пароль обновлён' })
}
