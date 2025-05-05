// app/api/brands/route.ts
import { PrismaClient } from '@/../generated/prisma'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET() {
	const brands = await prisma.brand.findMany({
		where: { products: { some: { isActive: true } } },
		orderBy: { name: 'asc' },
		select: {
			id: true,
			name: true,
			slug: true,
		},
	})

	return NextResponse.json(brands)
}
