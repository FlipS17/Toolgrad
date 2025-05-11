import { prisma } from '@/utils/db'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'POST') return res.status(405).end()

	const { userId, phone } = req.body
	try {
		await prisma.user.update({
			where: { id: parseInt(userId, 10) },
			data: { phone },
		})
		res.status(200).json({ success: true })
	} catch {
		res.status(500).json({ message: 'Ошибка при сохранении' })
	}
}
