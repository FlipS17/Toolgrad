import { prisma } from '@/utils/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url)

		const sort = searchParams.get('sort')
		const minPrice = searchParams.get('minPrice')
		const maxPrice = searchParams.get('maxPrice')
		const quantityFilter = searchParams.get('quantity')
		const brandSlug = searchParams.get('brand')
		const query = searchParams.get('q')

		const where: any = {}

		if (query) {
			where.name = { contains: query, mode: 'insensitive' }
		}

		if (minPrice) {
			where.price = { ...(where.price || {}), gte: Number(minPrice) }
		}

		if (maxPrice) {
			where.price = { ...(where.price || {}), lte: Number(maxPrice) }
		}

		if (quantityFilter === 'gt:0') {
			where.quantity = { gt: 0 }
		}

		if (brandSlug) {
			where.brand = { slug: brandSlug }
		}

		let orderBy: any = { createdAt: 'desc' }

		if (sort === 'priceAsc') orderBy = { price: 'asc' }
		if (sort === 'priceDesc') orderBy = { price: 'desc' }

		const products = await prisma.product.findMany({
			where,
			orderBy,
			include: { brand: true },
		})

		return NextResponse.json({ data: products })
	} catch (error) {
		console.error('API Error:', error)
		return new NextResponse('Internal Server Error', { status: 500 })
	}
}
