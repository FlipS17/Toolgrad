import { PrismaClient } from '@/../generated/prisma'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function POST(req: Request) {
	try {
		const { name, email, message } = await req.json()

		if (
			!name ||
			!email ||
			!message ||
			message.length < 10 ||
			message.length > 500
		) {
			return NextResponse.json(
				{ error: 'Поля заполнены некорректно' },
				{ status: 400 }
			)
		}

		await prisma.contactMessage.create({
			data: { name, email, message },
		})

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Ошибка при отправке сообщения:', error)
		return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
	}
}
