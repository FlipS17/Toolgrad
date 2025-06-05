import { prisma } from '@/utils/db'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
	const { code } = await req.json()

	if (!code) {
		return NextResponse.json({ error: 'Введите промокод' }, { status: 400 })
	}

	const promo = await prisma.promotion.findFirst({
		where: {
			code: {
				equals: code,
				mode: 'insensitive',
			},
			isActive: true,
			startDate: { lte: new Date() },
			endDate: { gte: new Date() },
		},
	})

	if (!promo) {
		return NextResponse.json(
			{ error: 'Промокод недействителен' },
			{ status: 404 }
		)
	}

	return NextResponse.json({
		id: promo.id,
		discount: promo.discount,
		description: promo.description,
	})
}
