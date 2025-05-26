import { PrismaClient } from '@/../generated/prisma'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function POST(req: Request) {
	const { phone } = await req.json()

	if (!phone) {
		return NextResponse.json({ message: 'Телефон не указан' }, { status: 400 })
	}

	const existingUser = await prisma.user.findFirst({ where: { phone } })

	if (existingUser?.phoneVerified) {
		return NextResponse.json({ alreadyVerified: true })
	}

	const code = Math.floor(1000 + Math.random() * 9000).toString()
	const expires = new Date(Date.now() + 30 * 1000) // 30 секунд

	await prisma.phoneVerificationCode.upsert({
		where: { phone },
		update: { code, expires },
		create: { phone, code, expires },
	})

	console.log(`Отправка SMS на ${phone}: код ${code}`)
	// Подключить SMS API здесь

	return NextResponse.json({ success: true })
}
