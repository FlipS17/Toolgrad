import { prisma } from '@/utils/db'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url)
	const q = searchParams.get('q')

	if (!q || q.length < 2) return NextResponse.json([])

	const results = await prisma.product.findMany({
		where: {
			name: {
				contains: q,
				mode: 'insensitive',
			},
		},
		select: {
			id: true,
			name: true,
			price: true,
			images: true,
			brand: {
				select: { name: true },
			},
		},
		take: 10,
	})

	return NextResponse.json(results)
}
