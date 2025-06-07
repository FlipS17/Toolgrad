// app/api/send-confirmation-email/route.ts
import { sendOrderConfirmationEmail } from '@/app/lib/mail'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
	try {
		const body = await req.json()
		const { email, address, entrance, floor, comment } = body

		await sendOrderConfirmationEmail(email, {
			address,
			entrance,
			floor,
			comment,
		})
		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Ошибка при отправке письма:', error)
		return NextResponse.json(
			{ error: 'Не удалось отправить письмо' },
			{ status: 500 }
		)
	}
}
