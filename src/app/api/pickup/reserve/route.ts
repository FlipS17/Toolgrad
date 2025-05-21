import { PrismaClient } from '@/../generated/prisma'
import { authOptions } from '@/app/lib/authOptions'
import { getServerSession } from 'next-auth'
import { NextRequest } from 'next/server'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
	const session = await getServerSession(authOptions)
	if (!session || !session.user?.email) {
		return new Response(JSON.stringify({ error: 'Не авторизован' }), {
			status: 401,
		})
	}

	const user = await prisma.user.findUnique({
		where: { email: session.user.email },
		include: { addresses: true },
	})
	if (!user) {
		return new Response(JSON.stringify({ error: 'Пользователь не найден' }), {
			status: 404,
		})
	}

	const body = await req.json()
	const { storeId, deliveryType, selectedItems } = body

	if (
		!deliveryType ||
		!Array.isArray(selectedItems) ||
		selectedItems.length === 0
	) {
		return new Response(
			JSON.stringify({ error: 'Некорректные данные для оформления' }),
			{ status: 400 }
		)
	}

	try {
		const cart = await prisma.cart.findUnique({
			where: { userId: user.id },
			include: { items: { include: { product: true } } },
		})
		if (!cart)
			return new Response(JSON.stringify({ error: 'Корзина не найдена' }), {
				status: 404,
			})

		const selectedCartItems = cart.items.filter(item =>
			selectedItems.includes(item.id)
		)
		if (selectedCartItems.length === 0) {
			return new Response(JSON.stringify({ error: 'Нет выбранных товаров' }), {
				status: 400,
			})
		}

		const total = selectedCartItems.reduce(
			(sum, item) => sum + item.quantity * item.product.price,
			0
		)

		const order = await prisma.order.create({
			data: {
				userId: user.id,
				orderNumber: `ORD-${Date.now()}`,
				status: 'PENDING',
				total,
				deliveryType,
				addressId:
					deliveryType === 'DELIVERY' ? user.addresses[0]?.id ?? null : null,
				storeId: deliveryType === 'PICKUP' ? storeId : null,
				items: {
					create: selectedCartItems.map(item => ({
						productId: item.productId,
						quantity: item.quantity,
						price: item.product.price,
					})),
				},
			},
		})

		await prisma.cartItem.deleteMany({
			where: {
				id: {
					in: selectedCartItems.map(i => i.id),
				},
			},
		})

		return new Response(
			JSON.stringify({ message: 'Заказ успешно оформлен', orderId: order.id }),
			{
				status: 200,
			}
		)
	} catch (error) {
		console.error('Ошибка при оформлении заказа:', error)
		return new Response(
			JSON.stringify({ error: 'Ошибка при оформлении заказа' }),
			{
				status: 500,
			}
		)
	}
}
