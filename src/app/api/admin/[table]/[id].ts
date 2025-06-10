import { PrismaClient } from '@/../generated/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

const prisma = new PrismaClient()

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const { table, id } = req.query

	if (typeof table !== 'string' || typeof id !== 'string') {
		return res.status(400).json({ error: 'Invalid parameters' })
	}

	try {
		switch (table) {
			case 'brand':
				await prisma.brand.delete({ where: { id: Number(id) } })
				break
			case 'user':
				await prisma.user.delete({ where: { id: Number(id) } })
				break
			case 'product':
				await prisma.product.delete({ where: { id: Number(id) } })
				break
			case 'order':
				await prisma.order.delete({ where: { id: Number(id) } })
				break
			case 'review':
				await prisma.review.delete({ where: { id: Number(id) } })
				break
			case 'slider':
				await prisma.slider.delete({ where: { id: Number(id) } })
				break
			default:
				return res.status(400).json({ error: 'Invalid table' })
		}

		return res.status(200).json({ success: true })
	} catch (error) {
		console.error(error)
		return res.status(500).json({ error: 'Failed to delete' })
	}
}
