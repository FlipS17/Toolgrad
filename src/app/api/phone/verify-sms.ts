import type { NextApiRequest, NextApiResponse } from 'next'

const CODES: Record<string, string> = {} // временное хранилище

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const { phone, code, action } = req.body

	if (action === 'send') {
		const generated = Math.floor(100000 + Math.random() * 900000).toString()
		CODES[phone] = generated
		console.log(`СМС-код для ${phone}: ${generated}`)
		return res.status(200).json({ success: true })
	}

	if (action === 'verify') {
		if (CODES[phone] === code) {
			delete CODES[phone]
			return res.status(200).json({ verified: true })
		} else {
			return res.status(400).json({ message: 'Неверный код' })
		}
	}

	return res.status(400).json({ message: 'Неверное действие' })
}
