import { PrismaClient } from '@/../generated/prisma'
import { authOptions } from '@/app/lib/authOptions'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
	const session = await getServerSession(authOptions)
	if (!session || !session.user?.email) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	const user = await prisma.user.findUnique({
		where: { email: session.user.email },
	})

	if (!user) {
		return NextResponse.json({ error: 'User not found' }, { status: 404 })
	}

	const { searchParams } = new URL(req.url)
	const storeId = Number(searchParams.get('storeId'))
	const selected = searchParams.getAll('selected')?.map(Number)

	if (!storeId || selected.length === 0) {
		return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
	}

	const cart = await prisma.cart.findUnique({
		where: { userId: user.id },
		include: {
			items: {
				where: {
					id: { in: selected },
				},
				include: { product: true },
			},
		},
	})

	if (!cart || cart.items.length === 0) return NextResponse.json([])

	const productIds = cart.items.map(i => i.productId)

	const stock = await prisma.productStock.findMany({
		where: {
			storeId,
			productId: { in: productIds },
		},
	})

	const result = cart.items.map(item => {
		const found = stock.find(s => s.productId === item.productId)
		return {
			id: item.product.id,
			name: item.product.name,
			quantity: item.quantity,
			inStock: (found?.quantity ?? 0) >= item.quantity,
		}
	})

	return NextResponse.json(result)
}
