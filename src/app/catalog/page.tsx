'use client'

import { Brand, Product } from '@/../generated/prisma'
import CatalogFilters from '@/app/catalog/components/CatalogFilters'
import CatalogSort from '@/app/catalog/components/CatalogSort'
import ProductCard from '@/app/catalog/components/ProductCard'
import { useFavorites } from '@/app/favorite/components/FavoriteProvider'
import axios from 'axios'
import { useRouter, useSearchParams } from 'next/navigation'
// @ts-ignore
import qs from 'qs'
import { useEffect, useMemo, useState } from 'react'
import { FiFilter } from 'react-icons/fi'
import CatalogSearch from './components/CatalogSearch'

interface Category {
	id: number
	name: string
	slug: string
}

export default function CatalogPage() {
	const [products, setProducts] = useState<Product[]>([])
	const [brands, setBrands] = useState<Brand[]>([])
	const [categories, setCategories] = useState<Category[]>([])
	const [maxPrice, setMaxPrice] = useState<number>(200000)
	const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

	const searchParams = useSearchParams()
	const router = useRouter()

	// Мемоизация параметров из URL
	const selectedBrands = useMemo(
		() => searchParams.getAll('brand'),
		[searchParams]
	)
	const selectedCategories = useMemo(
		() => searchParams.getAll('category'),
		[searchParams]
	)
	const sort = searchParams.get('sort') || 'newest'
	const minPrice = Number(searchParams.get('minPrice') || '0')
	const maxPriceParam = Number(searchParams.get('maxPrice') || maxPrice)
	const searchQuery = searchParams.get('q') || ''

	const { favoriteIds, toggleFavorite } = useFavorites()

	// Функция обновления одного параметра в URL
	const updateParam = (key: string, value: string | null) => {
		const params = new URLSearchParams(searchParams.toString())
		if (value === null) {
			params.delete(key)
		} else {
			params.set(key, value)
		}
		router.push(`?${params.toString()}`)
	}

	// Основной эффект загрузки товаров
	useEffect(() => {
		const fetchAll = async () => {
			const [productsRes, brandsRes, categoriesRes] = await Promise.all([
				axios.get('/api/products', {
					params: {
						brand: selectedBrands,
						category: selectedCategories,
						sort,
						minPrice,
						maxPrice: maxPriceParam,
						q: searchQuery || undefined,
					},
					// ключевая часть: сериализация массивов как brand=a&brand=b
					paramsSerializer: params =>
						qs.stringify(params, { arrayFormat: 'repeat' }),
				}),
				axios.get('/api/brands'),
				axios.get('/api/categories'),
			])

			const data = productsRes.data
			const productsWithDates = data.data.map((product: Product) => ({
				...product,
				createdAt: new Date(product.createdAt),
			}))

			setProducts(productsWithDates)
			setMaxPrice(data.maxPrice || 200000)
			setBrands(brandsRes.data)
			setCategories(categoriesRes.data)
		}

		fetchAll()
	}, [
		selectedBrands.join(','),
		selectedCategories.join(','),
		sort,
		minPrice,
		maxPriceParam,
		searchQuery,
	])

	return (
		<div className='bg-gray-50 min-h-screen'>
			<div className='max-w-8xl mx-auto px-6 sm:px-8 lg:px-10 py-12'>
				{/* Поиск */}
				<div className='mb-10'>
					<CatalogSearch />
				</div>

				{/* Заголовок и сортировка */}
				<div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-8'>
					<h1 className='text-2xl font-bold text-gray-900 mb-4 md:mb-0'>
						Каталог
					</h1>
					<div className='flex gap-3 items-center'>
						<button
							onClick={() => setMobileFiltersOpen(true)}
							className='md:hidden flex items-center text-gray-600 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm hover:shadow transition'
						>
							<FiFilter className='mr-2' /> Фильтры
						</button>
						<CatalogSort />
					</div>
				</div>

				{/* Контент */}
				<div className='flex flex-col lg:flex-row gap-8'>
					{/* Фильтры */}
					<aside className='hidden lg:block w-72 self-start'>
						<div className='bg-white border border-gray-200 rounded-2xl p-5 shadow-sm'>
							<h2 className='text-lg font-bold mb-5 text-gray-800'>Фильтры</h2>
							<CatalogFilters
								brands={brands}
								categories={categories}
								maxAvailablePrice={maxPrice}
							/>
						</div>
					</aside>

					{/* Товары */}
					<main className='flex-1'>
						{products.length > 0 ? (
							<div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6'>
								{products.map(product => (
									<ProductCard
										key={product.id}
										product={product}
										isFavorite={favoriteIds.includes(product.id)}
										onToggleFavorite={toggleFavorite}
										onAddToCart={() => {}}
									/>
								))}
							</div>
						) : (
							<div className='bg-white rounded-2xl p-10 shadow-sm text-center'>
								<p className='text-gray-500'>Товары не найдены</p>
							</div>
						)}
					</main>
				</div>

				{/* Мобильные фильтры */}
				{mobileFiltersOpen && (
					<div className='fixed inset-0 z-60 bg-white flex flex-col p-4 overflow-y-auto'>
						<div className='flex justify-between items-center mb-4'>
							<h2 className='text-lg font-bold'>Фильтры</h2>
							<button
								onClick={() => setMobileFiltersOpen(false)}
								className='text-2xl'
							>
								✕
							</button>
						</div>
						<div className='flex-1'>
							<CatalogFilters
								brands={brands}
								categories={categories}
								maxAvailablePrice={maxPrice}
								isMobile
								onClose={() => setMobileFiltersOpen(false)}
							/>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
