'use client'

import { Product } from '@/../generated/prisma'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import ProductCard from '../catalog/components/ProductCard'

export default function FavouritePage() {
	const { data: session } = useSession()
	const isAuth = !!session?.user

	const [products, setProducts] = useState<Product[]>([])
	const [favoriteIds, setFavoriteIds] = useState<number[]>([])

	useEffect(() => {
		const fetchFavorites = async () => {
			if (!isAuth) return
			const res = await axios.get('/api/favorites')
			setFavoriteIds(res.data)
		}
		fetchFavorites()
	}, [isAuth])

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

	const toggleFavorite = async (productId: number): Promise<boolean> => {
		if (!isAuth) {
			alert('Войдите в аккаунт, чтобы добавлять в избранное')
			return false
		}

		const isFav = favoriteIds.includes(productId)
		await axios.post('/api/favorites/toggle', { productId })

		const updated = isFav
			? favoriteIds.filter(id => id !== productId)
			: [...favoriteIds, productId]

		setFavoriteIds(updated)
		return !isFav
	}

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
