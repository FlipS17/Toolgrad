'use client'

import OrderCard from '@/app/account/orders/components/OrderCard'
import { Order } from '@/app/types/order'
import axios from 'axios'
import { useEffect, useState } from 'react'

export default function DeliveryPage() {
	const [orders, setOrders] = useState<Order[]>([])
	const [loading, setLoading] = useState(true)
	const [openOrderId, setOpenOrderId] = useState<number | null>(null)

	// Приоритеты сортировки статусов
	const statusPriority: Record<string, number> = {
		READY: 1,
		SHIPPED: 2,
		PROCESSING: 3,
		PENDING: 4,
	}

	useEffect(() => {
		axios
			.get('/api/account/orders')
			.then(res => {
				// Оставляем только активные статусы доставки
				const activeDelivery = res.data.filter((order: Order) =>
					['READY', 'SHIPPED', 'PROCESSING', 'PENDING'].includes(order.status)
				)

				// Сортируем по приоритету
				const sorted = [...activeDelivery].sort((a, b) => {
					const aPriority = statusPriority[a.status] ?? 99
					const bPriority = statusPriority[b.status] ?? 99
					return aPriority - bPriority
				})

				setOrders(sorted)
			})
			.finally(() => setLoading(false))
	}, [])

	if (loading) return <div>Загрузка...</div>

	return (
		<div className='space-y-6'>
			<h1 className='text-2xl font-bold text-center'>Текущая доставка</h1>

			{orders.length === 0 ? (
				<p className='text-center text-gray-600 mt-10'>
					У вас пока нет активных заказов.
				</p>
			) : (
				orders.map(order => (
					<OrderCard
						key={order.id}
						number={order.orderNumber}
						date={new Date(order.createdAt).toLocaleDateString('ru-RU')}
						status={order.status}
						total={order.total}
						deliveryType={order.deliveryType}
						address={order.address}
						store={order.store}
						products={order.items}
						isOpen={openOrderId === order.id}
						onToggle={() =>
							setOpenOrderId(prev => (prev === order.id ? null : order.id))
						}
					/>
				))
			)}
		</div>
	)
}
