import { PrismaClient } from '@/../generated/prisma'
import { authOptions } from '@/app/lib/authOptions'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET() {
	const session = await getServerSession(authOptions)

	if (!session?.user?.email) {
		return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
	}

	const user = await prisma.user.findUnique({
		where: { email: session.user.email },
	})

	if (!user) {
		return NextResponse.json(
			{ error: 'Пользователь не найден' },
			{ status: 404 }
		)
	}

	const orders = await prisma.order.findMany({
		where: { userId: user.id },
		orderBy: { createdAt: 'desc' },
		include: {
			items: {
				include: {
					product: true,
				},
			},
			address: true,
		},
	})

	const data = orders.map(order => ({
		id: order.id,
		orderNumber: order.orderNumber,
		status: order.status,
		total: order.total,
		createdAt: order.createdAt,
		deliveryType: order.deliveryType,
		address: order.address
			? `${order.address.city}, ${order.address.street}, д ${
					order.address.building
			  }${order.address.apartment ? `, кв ${order.address.apartment}` : ''}`
			: null,
		items: order.items.map(item => ({
			id: item.id,
			name: item.product.name,
			quantity: item.quantity,
			price: item.price,
			image: item.product.images[0] || '/placeholder.png',
			productId: item.product.id,
		})),
	}))

	return NextResponse.json(data)
}
