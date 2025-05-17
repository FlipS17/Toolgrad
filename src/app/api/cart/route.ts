import { authOptions } from '@/app/lib/authOptions'
import { prisma } from '@/utils/db'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

// Получение корзины
export async function GET() {
	try {
		const session = await getServerSession(authOptions)
		if (!session?.user) {
			console.log('GET /api/cart → session отсутствует')
			return NextResponse.json([])
		}

		const userId = Number(session.user.id)
		if (isNaN(userId)) {
			console.log('GET /api/cart → userId не число:', session.user.id)
			return NextResponse.json([], { status: 400 })
		}

		const cart = await prisma.cart.findUnique({
			where: { userId },
			include: {
				items: {
					include: {
						product: { include: { brand: true } },
					},
				},
			},
		})

		return NextResponse.json(cart?.items ?? [])
	} catch (error) {
		console.error('Ошибка в GET /api/cart:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}

// Добавление товара
export async function POST(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions)
		if (!session?.user) {
			console.log('POST /api/cart → нет сессии')
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const userId = Number(session.user.id)
		if (isNaN(userId)) {
			console.log('POST /api/cart → userId не число:', session.user.id)
			return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
		}

		const { productId } = await req.json()
		console.log('POST /api/cart → productId:', productId)

		if (!productId) {
			return NextResponse.json({ error: 'Missing productId' }, { status: 400 })
		}

		const product = await prisma.product.findUnique({
			where: { id: productId },
		})
		if (!product) {
			return NextResponse.json({ error: 'Product not found' }, { status: 404 })
		}

		let cart = await prisma.cart.findUnique({ where: { userId } })
		if (!cart) {
			cart = await prisma.cart.create({ data: { userId } })
		}

		const existing = await prisma.cartItem.findFirst({
			where: { cartId: cart.id, productId },
		})

		if (existing) {
			await prisma.cartItem.update({
				where: { id: existing.id },
				data: { quantity: existing.quantity + 1 },
			})
		} else {
			await prisma.cartItem.create({
				data: { cartId: cart.id, productId, quantity: 1 },
			})
		}

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Ошибка в POST /api/cart:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}

// Изменение количества
export async function PATCH(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions)
		if (!session?.user) {
			console.log('PATCH /api/cart → нет сессии')
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const userId = Number(session.user.id)
		if (isNaN(userId)) {
			console.log('PATCH /api/cart → userId не число:', session.user.id)
			return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
		}

		const { itemId, quantity } = await req.json()
		if (!itemId || typeof quantity !== 'number' || quantity < 1) {
			return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
		}

		const item = await prisma.cartItem.findUnique({
			where: { id: itemId },
			include: { cart: true },
		})

		if (!item || !item.cart || item.cart.userId !== userId) {
			return NextResponse.json({ error: 'Not found' }, { status: 404 })
		}

		await prisma.cartItem.update({
			where: { id: itemId },
			data: { quantity },
		})

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Ошибка в PATCH /api/cart:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}

// Удаление товара
export async function DELETE(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions)
		if (!session?.user) {
			console.log('DELETE /api/cart → нет сессии')
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const userId = Number(session.user.id)
		if (isNaN(userId)) {
			console.log('DELETE /api/cart → userId не число:', session.user.id)
			return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
		}

		const { itemId } = await req.json()
		if (!itemId) {
			return NextResponse.json({ error: 'Missing itemId' }, { status: 400 })
		}

		const item = await prisma.cartItem.findUnique({
			where: { id: itemId },
			include: { cart: true },
		})

		if (!item || !item.cart || item.cart.userId !== userId) {
			return NextResponse.json({ error: 'Not found' }, { status: 404 })
		}

		await prisma.cartItem.delete({ where: { id: itemId } })

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Ошибка в DELETE /api/cart:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}
