'use client'

import { Brand, Product } from '@/../generated/prisma'
import CatalogFilters from '@/app/catalog/components/CatalogFilters'
import CatalogSort from '@/app/catalog/components/CatalogSort'
import ProductCard from '@/app/catalog/components/ProductCard'
import { useNotification } from '@/app/components/NotificationProvider'
import { useFavorites } from '@/app/favorite/components/FavoriteProvider'
import axios from 'axios'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FiFilter } from 'react-icons/fi'
import CatalogSearch from './components/CatalogSearch'

export default function CatalogPage() {
	const [products, setProducts] = useState<Product[]>([])
	const [brands, setBrands] = useState<Brand[]>([])
	const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
	const [totalPages, setTotalPages] = useState(1)

	const searchParams = useSearchParams()
	const router = useRouter()

	const selectedBrand = searchParams.get('brand')
	const sort = searchParams.get('sort') || 'newest'
	const minPrice = Number(searchParams.get('minPrice') || '0')
	const maxPrice = Number(searchParams.get('maxPrice') || '100000')
	const page = Number(searchParams.get('page') || '1')
	const searchQuery = searchParams.get('q') || ''

	const { notify } = useNotification()
	const { favoriteIds, toggleFavorite } = useFavorites()

	const updateParam = (key: string, value: string | null) => {
		const params = new URLSearchParams(searchParams.toString())
		if (value === null) {
			params.delete(key)
		} else {
			params.set(key, value)
		}
		router.push(`?${params.toString()}`)
	}

	useEffect(() => {
		const fetchProducts = async () => {
			const res = await axios.get('/api/products', {
				params: {
					brand: selectedBrand || undefined,
					sort,
					minPrice,
					maxPrice,
					page,
					q: searchQuery || undefined,
				},
			})
			const productsWithDates = res.data.data.map((product: Product) => ({
				...product,
				createdAt: new Date(product.createdAt),
			}))
			setProducts(productsWithDates)
			setTotalPages(res.data.totalPages || 1)
		}

		const fetchBrands = async () => {
			const res = await axios.get('/api/brands')
			setBrands(res.data)
		}

		fetchProducts()
		fetchBrands()
	}, [selectedBrand, sort, minPrice, maxPrice, page, searchQuery])

	return (
		<div className='bg-gray-50 min-h-screen'>
			<div className='max-w-8xl mx-auto px-6 sm:px-8 lg:px-10 py-12'>
				<div className='mb-10'>
					<CatalogSearch />
				</div>

				<div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-8'>
					<h1 className='text-3xl font-bold text-gray-900 mb-4 md:mb-0'>
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

				<div className='flex flex-col lg:flex-row gap-8'>
					<aside className='hidden lg:block w-72 self-start'>
						<div className='bg-white border border-gray-200 rounded-2xl p-5 shadow-sm'>
							<h2 className='text-lg font-bold mb-5 text-gray-800'>Фильтры</h2>
							<CatalogFilters brands={brands} />
						</div>
					</aside>

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
								<p className='text-gray-500'>
									Товары не найдены. Попробуйте изменить параметры поиска или
									фильтрации.
								</p>
							</div>
						)}

						{/* Пагинация */}
						{totalPages > 1 && (
							<div className='mt-10 flex justify-center gap-2'>
								{Array.from({ length: totalPages }).map((_, i) => (
									<button
										key={i}
										onClick={() => updateParam('page', String(i + 1))}
										className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
											page === i + 1
												? 'bg-[#F89514] text-white shadow-md'
												: 'border border-gray-200 hover:bg-gray-100 shadow-sm'
										}`}
									>
										{i + 1}
									</button>
								))}
							</div>
						)}
					</main>
				</div>

				{/* Мобильные фильтры */}
				{mobileFiltersOpen && (
					<div className='fixed inset-0 z-60 bg-white flex flex-col p-4'>
						<div className='flex justify-between items-center mb-4'>
							<h2 className='text-lg font-bold'>Фильтры</h2>
							<button
								onClick={() => setMobileFiltersOpen(false)}
								className='text-2xl'
							>
								✕
							</button>
						</div>
						<div className='flex-1 overflow-y-auto'>
							<CatalogFilters
								brands={brands}
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
