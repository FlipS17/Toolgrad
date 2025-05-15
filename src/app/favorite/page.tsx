'use client'

import { Product } from '@/../generated/prisma'
import { useFavorites } from '@/app/favorite/components/FavoriteProvider'
import axios from 'axios'
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

	return (
		<div className='max-w-7xl mx-auto px-4 py-10'>
			<h1 className='text-3xl font-bold mb-6'>Избранное</h1>

			{products.length > 0 ? (
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
				<p className='text-gray-500'>Вы ещё не добавили товары в избранное.</p>
			)}
		</div>
	)
}
