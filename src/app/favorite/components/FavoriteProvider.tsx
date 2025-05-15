'use client'

import { useNotification } from '@/app/components/NotificationProvider'
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
	const { notify } = useNotification()

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
		if (!session?.user) {
			notify('Войдите в аккаунт, чтобы добавить в избранное', 'error')
			return false
		}

		const isFav = favoriteIds.includes(productId)

		try {
			await axios.post('/api/favorites/toggle', { productId })

			const updated = isFav
				? favoriteIds.filter(id => id !== productId)
				: [...favoriteIds, productId]

			setFavoriteIds(updated)

			return !isFav
		} catch (err) {
			console.error('Ошибка избранного:', err)
			notify('Не удалось обновить избранное', 'error')
			return false
		}
	}

	return (
		<FavoriteContext.Provider value={{ favoriteIds, toggleFavorite }}>
			{children}
		</FavoriteContext.Provider>
	)
}
