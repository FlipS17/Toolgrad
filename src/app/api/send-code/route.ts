import { sendVerificationEmail } from '@/app/lib/mail'
import { prisma } from '@/utils/db'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
	const body = await req.json()
	const { email, data } = body

	if (!email || !data) {
		return NextResponse.json(
			{ message: 'Неверный формат запроса' },
			{ status: 400 }
		)
	}

	const code = Math.floor(100000 + Math.random() * 900000).toString()
	const expires = new Date(Date.now() + 5 * 60 * 1000)

	await prisma.verificationCode.upsert({
		where: { email },
		update: { code, expires, data },
		create: { email, code, expires, data },
	})

	try {
		await sendVerificationEmail(email, code)
	} catch (e) {
		console.error('Ошибка при отправке письма:', e)
		return NextResponse.json(
			{ message: 'Не удалось отправить письмо' },
			{ status: 500 }
		)
	}

	return NextResponse.json({ message: 'Код отправлен' })
}
