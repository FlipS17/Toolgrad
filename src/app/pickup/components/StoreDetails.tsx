/* --- StoreDetails.tsx --- */
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

		const params = new URLSearchParams()
		params.append('storeId', String(store.id))
		selectedIds.forEach(id => params.append('selected', String(id)))

		axios
			.get(`/api/pickup/stock?${params.toString()}`)
			.then(res => setProducts(res.data))
			.catch(err => console.error('Ошибка загрузки остатков', err))
	}, [store.id])

	const handleReserve = async () => {
		setLoading(true)
		try {
			const res = await axios.post('/api/pickup/reserve', {
				storeId: store.id,
				deliveryType: 'PICKUP',
				selectedItems: selectedIds,
			})

			notify(res.data.message || 'Бронь оформлена', 'success')
			localStorage.removeItem('selectedItems')
			await refreshCart()
			router.push('/account/orders')
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
			<div>
				<h3 className='text-lg font-semibold text-gray-900'>{store.name}</h3>
				<p className='text-sm text-gray-600'>
					{store.city}, {store.address}
				</p>
				{store.phone && (
					<p className='text-sm text-gray-600'>Телефон: {store.phone}</p>
				)}
				{store.schedule && (
					<p className='text-sm text-gray-600'>
						Режим работы: {store.schedule}
					</p>
				)}
			</div>

			<div className='w-full h-[280px] rounded-xl overflow-hidden'>
				<iframe
					key={`${store.latitude}-${store.longitude}`}
					src={`https://yandex.ru/map-widget/v1/?ll=${store.longitude},${store.latitude}&z=16&pt=${store.longitude},${store.latitude},pm2rdm`}
					width='100%'
					height='100%'
					frameBorder='0'
				></iframe>
			</div>

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
