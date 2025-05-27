import { PrismaClient } from '@/../generated/prisma'
import axios from 'axios'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()
const SMS_API_KEY = process.env.SMS_API_KEY!

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
	const expires = new Date(Date.now() + 30 * 1000)

	await prisma.phoneVerificationCode.upsert({
		where: { phone },
		update: { code, expires },
		create: { phone, code, expires },
	})

	try {
		const text = `Код подтверждения: ${code}`
		const response = await axios.get('https://sms.ru/sms/send', {
			params: {
				api_id: SMS_API_KEY,
				to: phone.replace('+', ''),
				msg: text,
				json: 1,
			},
		})

		if (response.data.status !== 'OK') {
			console.error('Ошибка отправки SMS:', response.data)
			return NextResponse.json(
				{ error: 'Ошибка отправки SMS' },
				{ status: 500 }
			)
		}
	} catch (err) {
		console.error('Ошибка HTTP запроса к SMS API:', err)
		return NextResponse.json(
			{ error: 'Ошибка при отправке SMS' },
			{ status: 500 }
		)
	}
	console.log('🔑 SMS_API_KEY:', SMS_API_KEY)

	return NextResponse.json({ success: true })
}
