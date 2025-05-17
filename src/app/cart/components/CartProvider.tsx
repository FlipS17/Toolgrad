'use client'

import { useNotification } from '@/app/components/NotificationProvider'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { createContext, useContext, useEffect, useState } from 'react'

type CartContextType = {
	cartIds: number[]
	addToCart: (productId: number) => Promise<void>
	isInCart: (productId: number) => boolean
	refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType>({
	cartIds: [],
	addToCart: async () => {},
	isInCart: () => false,
	refreshCart: async () => {},
})

export function useCart() {
	return useContext(CartContext)
}

export function CartProvider({ children }: { children: React.ReactNode }) {
	const [cartIds, setCartIds] = useState<number[]>([])
	const { data: session } = useSession()
	const isAuth = !!session?.user
	const { notify } = useNotification()

	const refreshCart = async () => {
		if (!isAuth) {
			setCartIds([])
			return
		}
		try {
			const res = await axios.get('/api/cart')
			const ids = res.data.map((item: any) => item.product.id)
			setCartIds(ids)
		} catch (error) {
			console.error('Ошибка загрузки корзины', error)
		}
	}

	useEffect(() => {
		refreshCart()
	}, [isAuth])

	const addToCart = async (productId: number) => {
		if (!session?.user) {
			notify('Войдите в аккаунт, чтобы добавить в корзину', 'error')
			return
		}

		try {
			await axios.post('/api/cart', { productId })
			await refreshCart()
			notify('Товар добавлен в корзину', 'success')
		} catch (error) {
			console.error('Ошибка добавления в корзину', error)
			notify('Не удалось добавить товар в корзину', 'error')
		}
	}

	const isInCart = (productId: number) => cartIds.includes(productId)

	return (
		<CartContext.Provider value={{ cartIds, addToCart, isInCart, refreshCart }}>
			{children}
		</CartContext.Provider>
	)
}
