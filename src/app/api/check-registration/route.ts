import { prisma } from '@/utils/db'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
	const body = await req.json()
	const { email, firstName, lastName, password, birthDate } = body

	if (!email || !firstName || !lastName || !password || !birthDate) {
		return NextResponse.json(
			{ message: 'Не все поля заполнены' },
			{ status: 400 }
		)
	}

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	if (!emailRegex.test(email)) {
		return NextResponse.json(
			{ message: 'Неверный формат email' },
			{ status: 400 }
		)
	}

	if (password.length < 6) {
		return NextResponse.json(
			{ message: 'Пароль должен быть не менее 6 символов' },
			{ status: 400 }
		)
	}

	if (!/^[a-zA-Z0-9!@#$%^&*()_+=\\-]+$/.test(password)) {
		return NextResponse.json(
			{ message: 'Пароль содержит недопустимые символы' },
			{ status: 400 }
		)
	}

	const existing = await prisma.user.findUnique({ where: { email } })
	if (existing) {
		return NextResponse.json(
			{ message: 'Email уже используется' },
			{ status: 409 }
		)
	}

	return NextResponse.json({ message: 'OK' })
}
