import { PrismaClient } from '@/../generated/prisma'
import { authOptions } from '@/app/lib/authOptions'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function POST(req: Request) {
	const session = await getServerSession(authOptions)

	if (!session?.user?.email) {
		return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
	}

	const { phone, code } = await req.json()

	const stored = await prisma.phoneVerificationCode.findFirst({
		where: { phone },
	})

	if (!stored || stored.code !== code || stored.expires < new Date()) {
		return NextResponse.json(
			{ error: 'Неверный код или срок истёк' },
			{ status: 400 }
		)
	}

	await prisma.user.update({
		where: { email: session.user.email },
		data: {
			phone,
			phoneVerified: true,
		},
	})

	await prisma.phoneVerificationCode.deleteMany({
		where: { phone },
	})

	return NextResponse.json({ success: true })
}
