import { prisma } from '@/utils/db'
import { NextResponse } from 'next/server'

export async function GET() {
	try {
		const categories = await prisma.category.findMany({
			select: {
				id: true,
				name: true,
				slug: true,
				image: true,
			},
			orderBy: { name: 'asc' },
		})

		return NextResponse.json(categories)
	} catch (error) {
		console.error('Ошибка при загрузке категорий:', error)
		return NextResponse.json(
			{ error: 'Ошибка при загрузке категорий' },
			{ status: 500 }
		)
	}
}
