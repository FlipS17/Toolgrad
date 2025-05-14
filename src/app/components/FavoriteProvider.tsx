'use client'

import axios from 'axios'
import { useSession } from 'next-auth/react'
import { createContext, useContext, useEffect, useState } from 'react'

type FavoriteContextType = {
	favoriteIds: number[]
	toggleFavorite: (productId: number) => Promise<boolean>
}

const FavoriteContext = createContext<FavoriteContextType>({
	favoriteIds: [],
	toggleFavorite: async () => false,
})

export function useFavorites() {
	return useContext(FavoriteContext)
}

export function FavoriteProvider({ children }: { children: React.ReactNode }) {
	const [favoriteIds, setFavoriteIds] = useState<number[]>([])
	const { data: session } = useSession()
	const isAuth = !!session?.user

	useEffect(() => {
		if (!isAuth) {
			setFavoriteIds([])
			return
		}

		const fetchFavorites = async () => {
			try {
				const res = await axios.get('/api/favorites')
				setFavoriteIds(res.data)
			} catch (error) {
				console.error('Ошибка загрузки избранного', error)
			}
		}

		fetchFavorites()
	}, [isAuth])

	const toggleFavorite = async (productId: number): Promise<boolean> => {
		if (!isAuth) return false

		const isFav = favoriteIds.includes(productId)

		try {
			await axios.post('/api/favorites/toggle', { productId })

			const updated = isFav
				? favoriteIds.filter(id => id !== productId)
				: [...favoriteIds, productId]

			setFavoriteIds(updated)

			return !isFav
		} catch (error) {
			console.error('Ошибка при обновлении избранного', error)
			return isFav
		}
	}

	return (
		<FavoriteContext.Provider value={{ favoriteIds, toggleFavorite }}>
			{children}
		</FavoriteContext.Provider>
	)
}
