import { prisma } from '@/utils/db'
import { NextResponse } from 'next/server'

export async function GET() {
	const promos = await prisma.promotion.findMany({
		where: {
			isActive: true,
			startDate: { lte: new Date() },
			endDate: { gte: new Date() },
		},
		select: {
			id: true,
			name: true,
			description: true,
			code: true,
		},
	})

	return NextResponse.json(promos)
}
