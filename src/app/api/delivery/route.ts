import { PrismaClient } from '@/../generated/prisma'
import { authOptions } from '@/app/lib/authOptions'
import { getServerSession } from 'next-auth'
import { NextRequest } from 'next/server'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
	const session = await getServerSession(authOptions)
	if (!session?.user?.email) {
		return new Response(JSON.stringify({ error: 'Не авторизован' }), {
			status: 401,
		})
	}

	const user = await prisma.user.findUnique({
		where: { email: session.user.email },
	})

	if (!user) {
		return new Response(JSON.stringify({ error: 'Пользователь не найден' }), {
			status: 404,
		})
	}
	if (!user.phoneVerified) {
		return new Response(
			JSON.stringify({
				error: 'Подтвердите номер телефона перед оформлением заказа',
			}),
			{ status: 400 }
		)
	}

	const body = await req.json()
	const {
		selectedItems,
		address,
		coordinates,
		phone,
		comment,
		deliveryPrice,
		addressExtra,
	} = body

	if (
		!address ||
		!coordinates ||
		!phone ||
		!selectedItems?.length ||
		!deliveryPrice
	) {
		return new Response(JSON.stringify({ error: 'Неверные данные' }), {
			status: 400,
		})
	}

	const cart = await prisma.cart.findUnique({
		where: { userId: user.id },
		include: { items: { include: { product: true } } },
	})

	if (!cart) {
		return new Response(JSON.stringify({ error: 'Корзина не найдена' }), {
			status: 404,
		})
	}

	const selectedCartItems = cart.items.filter(i => selectedItems.includes(i.id))
	if (!selectedCartItems.length) {
		return new Response(JSON.stringify({ error: 'Нет выбранных товаров' }), {
			status: 400,
		})
	}

	const total = selectedCartItems.reduce(
		(sum, item) => sum + item.product.price * item.quantity,
		0
	)

	try {
		const createdAddress = await prisma.address.create({
			data: {
				userId: user.id,
				country: 'Россия',
				city: address.city || '',
				settlement: address.settlement_with_type || '',
				street: address.street || '',
				building: address.house || '',
				apartment: address.flat || '',
				entrance: addressExtra?.entrance || '',
				floor: addressExtra?.floor || '',
				postalCode: address.postal_code || '',
				isDefault: false,
			},
		})

		const order = await prisma.order.create({
			data: {
				userId: user.id,
				orderNumber: `ORD-${Date.now()}`,
				status: 'PENDING',
				total: total + deliveryPrice,
				deliveryType: 'DELIVERY',
				addressId: createdAddress.id,
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
			where: { id: { in: selectedCartItems.map(i => i.id) } },
		})

		return new Response(
			JSON.stringify({ message: 'Заказ оформлен', orderId: order.id }),
			{ status: 200 }
		)
	} catch (error) {
		console.error('Ошибка при оформлении доставки:', error)
		return new Response(
			JSON.stringify({ error: 'Ошибка при создании заказа' }),
			{
				status: 500,
			}
		)
	}
}
