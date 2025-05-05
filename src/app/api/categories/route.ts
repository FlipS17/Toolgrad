import { prisma } from '@/utils/db'
import { NextResponse } from 'next/server'

export async function GET() {
	try {
		const categories = await prisma.category.findMany({
			where: { isActive: true },
			select: {
				id: true,
				name: true,
				slug: true,
				image: true,
			},
			orderBy: { name: 'asc' },
			take: 12,
		})

		return NextResponse.json(categories)
	} catch (error) {
		return NextResponse.json(
			{ error: 'Failed to fetch categories' },
			{ status: 500 }
		)
	}
}
