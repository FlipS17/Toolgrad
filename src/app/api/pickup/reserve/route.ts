// app/api/pickup/reserve/route.ts
import { PrismaClient } from '@/../generated/prisma'
import { authOptions } from '@/app/lib/authOptions'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
	const session = await getServerSession(authOptions)
	if (!session || !session.user?.id) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	const userId = session.user.id
	const body = await req.json()
	const { storeId } = body

	if (!storeId) {
		return NextResponse.json({ error: 'storeId is required' }, { status: 400 })
	}

	const cart = await prisma.cart.findUnique({
		where: { userId },
		include: {
			items: true,
		},
	})

	if (!cart || cart.items.length === 0) {
		return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
	}

	// Проверим наличие на складе
	const stock = await prisma.productStock.findMany({
		where: {
			storeId,
			productId: { in: cart.items.map(i => i.productId) },
		},
	})

	const insufficient = cart.items.filter(item => {
		const found = stock.find(s => s.productId === item.productId)
		return (found?.quantity ?? 0) < item.quantity
	})

	if (insufficient.length > 0) {
		return NextResponse.json(
			{
				error: 'Некоторые товары недоступны для брони',
				missing: insufficient.map(i => i.productId),
			},
			{ status: 409 }
		)
	}

	// Здесь можно создать "черновой" заказ или просто сохранить факт бронирования
	return NextResponse.json({ message: 'Бронь оформлена успешно' })
}
