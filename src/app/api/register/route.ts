import { prisma } from '@/utils/db'
import { hash } from 'bcryptjs'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
	const body = await req.json()
	const { email, password, firstName, lastName } = body

	if (!email || !password || !firstName || !lastName) {
		return NextResponse.json(
			{ message: 'Все поля обязательны' },
			{ status: 400 }
		)
	}

	const existingUser = await prisma.user.findUnique({ where: { email } })
	if (existingUser) {
		return NextResponse.json(
			{ message: 'Пользователь уже существует' },
			{ status: 400 }
		)
	}

	const hashedPassword = await hash(password, 10)

	const randomAvatarColorIndex = Math.floor(Math.random() * 4)

	const user = await prisma.user.create({
		data: {
			email,
			password: hashedPassword,
			firstName,
			lastName,
			avatar: randomAvatarColorIndex,
		},
	})

	return NextResponse.json({ message: 'Успешно', userId: user.id })
}
