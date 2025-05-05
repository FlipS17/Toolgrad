// /api/favorite.ts
import { prisma } from '@/utils/db'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
	const { productId, userId } = await req.json()

	const existing = await prisma.favorite.findFirst({
		where: { productId, userId },
	})
	if (existing) {
		await prisma.favorite.delete({ where: { id: existing.id } })
		return NextResponse.json({ removed: true })
	} else {
		await prisma.favorite.create({ data: { productId, userId } })
		return NextResponse.json({ added: true })
	}
}
