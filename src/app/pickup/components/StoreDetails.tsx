'use client'

import { useCart } from '@/app/cart/components/CartProvider'
import { useNotification } from '@/app/components/NotificationProvider'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import PickupCartPreview from './PickupCartPreview'
import { Store } from './PickupPage'

interface CartProduct {
	id: number
	name: string
	quantity: number
	inStock: boolean
}

export default function StoreDetails({ store }: { store: Store }) {
	const [products, setProducts] = useState<CartProduct[]>([])
	const [selectedIds, setSelectedIds] = useState<number[]>([])
	const [loading, setLoading] = useState(false)
	const { notify } = useNotification()
	const router = useRouter()
	const { refreshCart } = useCart()

	useEffect(() => {
		const selectedIds = JSON.parse(
			localStorage.getItem('selectedItems') || '[]'
		) as number[]

		if (!selectedIds.length) return

		// Формируем query параметры
		const params = new URLSearchParams()
		params.append('storeId', String(store.id))
		selectedIds.forEach(id => params.append('selected', String(id)))

		// Получаем остатки
		axios
			.get(`/api/pickup/stock?${params.toString()}`)
			.then(res => setProducts(res.data))
			.catch(err => console.error('Ошибка загрузки остатков', err))
	}, [store.id])

	// Отправка запроса на оформление самовывоза
	const handleReserve = async () => {
		setLoading(true)
		try {
			const res = await axios.post('/api/pickup/reserve', {
				storeId: store.id,
				deliveryType: 'PICKUP',
				selectedItems: selectedIds,
			})

			// Оформление заказа
			notify(res.data.message || 'Заказ оформлен', 'success')
			localStorage.removeItem('selectedItems') // очищаем
			await refreshCart()
			router.push('/account/delivery')
		} catch (err: any) {
			console.log('Ошибка оформления заказа:', err)
			notify(
				err.response?.data?.error || 'Ошибка при оформлении заказа',
				'error'
			)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='space-y-6'>
			<div className='pt-4 border-t'>
				<PickupCartPreview
					onReserve={handleReserve}
					disabled={loading || products.length === 0}
					onItemsLoaded={setSelectedIds}
				/>
			</div>
		</div>
	)
}
