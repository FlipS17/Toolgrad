'use client'

import { Product } from '@/../generated/prisma'
import { useFavorites } from '@/app/favorite/components/FavoriteProvider'
import axios from 'axios'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import ProductCard from '../catalog/components/ProductCard'

export default function FavouritePage() {
	const [products, setProducts] = useState<Product[]>([])
	const { favoriteIds, toggleFavorite } = useFavorites()

	useEffect(() => {
		if (favoriteIds.length === 0) {
			setProducts([])
			return
		}

		const fetchProducts = async () => {
			const res = await axios.get('/api/products', {
				params: { ids: favoriteIds.join(',') },
			})
			const productsWithDates = res.data.data.map((product: Product) => ({
				...product,
				createdAt: new Date(product.createdAt),
			}))
			setProducts(productsWithDates)
		}
		fetchProducts()
	}, [favoriteIds])

	const isEmpty = products.length === 0

	return (
		<div className='container mx-auto py-12 px-4'>
			<h2 className='text-2xl font-bold text-center mb-6'>Избранное</h2>

			{!isEmpty ? (
				<div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4'>
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
				<div className='text-center text-gray-500 mt-12'>
					<p className='mb-6'>Вы ещё не добавили товары в избранное.</p>
					<Link
						href='/catalog'
						className='inline-block bg-[#F89514] text-white px-6 py-2 rounded-xl hover:bg-[#d97c0f] transition'
					>
						К покупкам
					</Link>
				</div>
			)}
		</div>
	)
}
