import { prisma } from '@/utils/db'
import { NextResponse } from 'next/server'

export async function GET() {
	try {
		const brands = await prisma.brand.findMany({
			where: {
				products: {
					some: {
						isActive: true, // хотя бы один активный товар
					},
				},
			},
			select: {
				id: true,
				name: true,
				slug: true,
				logo: true,
			},
			orderBy: { name: 'asc' },
		})

		return NextResponse.json(brands)
	} catch (error) {
		console.error('Ошибка при загрузке брендов:', error)
		return NextResponse.json(
			{ error: 'Ошибка при загрузке брендов' },
			{ status: 500 }
		)
	}
}
