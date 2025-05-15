import { prisma } from '@/utils/db'
import { hash } from 'bcryptjs'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
	const body = await req.json()
	const { email, code, userData } = body

	if (!email || !code || !userData) {
		return NextResponse.json({ message: 'Неверные данные' }, { status: 400 })
	}

	const entry = await prisma.verificationCode.findUnique({ where: { email } })

	if (!entry || entry.code !== code || entry.expires < new Date()) {
		return NextResponse.json(
			{ message: 'Код недействителен или истёк' },
			{ status: 400 }
		)
	}

	try {
		const existing = await prisma.user.findUnique({ where: { email } })
		if (existing) {
			return NextResponse.json(
				{ message: 'Email уже используется' },
				{ status: 409 }
			)
		}

		const hashedPassword = await hash(userData.password, 10)

		const user = await prisma.user.create({
			data: {
				email,
				password: hashedPassword,
				firstName: userData.firstName,
				lastName: userData.lastName,
				birthDate: userData.birthDate ? new Date(userData.birthDate) : null,
				avatar: userData.avatar ?? Math.floor(Math.random() * 4),
			},
		})

		await prisma.verificationCode.delete({ where: { email } })

		return NextResponse.json({
			message: 'Регистрация завершена',
			userId: user.id,
		})
	} catch (error) {
		return NextResponse.json(
			{ message: 'Ошибка при создании пользователя' },
			{ status: 500 }
		)
	}
}
