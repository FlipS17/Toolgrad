import { prisma } from '@/utils/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url)

		// Чтение параметров из URL
		const sort = searchParams.get('sort')
		const minPrice = searchParams.get('minPrice')
		const maxPrice = searchParams.get('maxPrice')
		const query = searchParams.get('q')
		const idsParam = searchParams.get('ids')
		const popular = searchParams.get('popular') === 'true'
		const isNew = searchParams.get('new') === 'true'
		const promotion = searchParams.get('promotion') === 'true'

		// Множественные параметры
		const brandSlugs = searchParams.getAll('brand')
		const categorySlugs = searchParams.getAll('category')

		// Начальное условие: только активные товары
		const where: any = { isActive: true }

		// Фильтрация по ID
		if (idsParam) {
			const ids = idsParam
				.split(',')
				.map(id => parseInt(id))
				.filter(id => !isNaN(id))
			if (ids.length > 0) where.id = { in: ids }
		}

		// Фильтрация по поисковому запросу
		if (query) {
			where.name = { contains: query, mode: 'insensitive' }
		}

		// Фильтрация по диапазону цен
		if (minPrice) {
			where.price = { ...(where.price || {}), gte: Number(minPrice) }
		}
		if (maxPrice) {
			where.price = { ...(where.price || {}), lte: Number(maxPrice) }
		}

		// Фильтрация по множеству брендов
		if (brandSlugs.length > 0) {
			where.brand = { slug: { in: brandSlugs } }
		}

		// Фильтрация по множеству категорий
		if (categorySlugs.length > 0) {
			where.categories = {
				some: {
					slug: { in: categorySlugs },
				},
			}
		}

		// Фильтрация по акциям (активные в текущую дату)
		if (promotion) {
			where.promotions = {
				some: {
					isActive: true,
					startDate: { lte: new Date() },
					endDate: { gte: new Date() },
				},
			}
		}

		// Фильтрация по новизне — товары, созданные за последние 30 дней
		if (isNew) {
			const date = new Date()
			date.setDate(date.getDate() - 30)
			where.createdAt = { gte: date }
		}

		// Фильтрация/сортировка по популярности
		if (popular || sort === 'popular') {
			// Получаем топ товаров по количеству заказов
			const popularOrderStats = await prisma.orderItem.groupBy({
				by: ['productId'],
				_sum: { quantity: true },
				orderBy: { _sum: { quantity: 'desc' } },
				take: 100,
			})

			const popularProductIds = popularOrderStats.map(p => p.productId)

			// Загружаем товары, соответствующие фильтру и попавшие в топ
			const popularProducts = await prisma.product.findMany({
				where: {
					...where,
					id: { in: popularProductIds },
				},
				include: { brand: true },
			})

			// Сортировка в том же порядке, что и популярность
			const sortedPopular = popularProductIds
				.map(id => popularProducts.find(p => p.id === id))
				.filter(Boolean)

			// Добавляем оставшиеся товары, которых не было в популярных (чтобы не терять)
			const remainingProducts = await prisma.product.findMany({
				where: {
					...where,
					id: { notIn: popularProductIds },
				},
				include: { brand: true },
			})

			const finalProducts = [...sortedPopular, ...remainingProducts]

			const maxProductPrice = await prisma.product.aggregate({
				where: { isActive: true },
				_max: { price: true },
			})

			return NextResponse.json({
				data: finalProducts,
				maxPrice: maxProductPrice._max.price,
			})
		}

		// Если не популярность — обычная сортировка
		let orderBy: any = { createdAt: 'desc' }
		if (sort === 'priceAsc') orderBy = { price: 'asc' }
		if (sort === 'priceDesc') orderBy = { price: 'desc' }

		// Запрос товаров с обычной сортировкой
		const products = await prisma.product.findMany({
			where,
			orderBy,
			include: { brand: true },
		})

		// Максимальная цена среди всех активных товаров
		const maxProductPrice = await prisma.product.aggregate({
			where: { isActive: true },
			_max: { price: true },
		})

		return NextResponse.json({
			data: products,
			maxPrice: maxProductPrice._max.price,
		})
	} catch (error) {
		console.error('API Error:', error)
		return new NextResponse('Internal Server Error', { status: 500 })
	}
}
