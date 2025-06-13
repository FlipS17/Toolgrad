'use client'

import OrderCard from '@/app/account/orders/components/OrderCard'
import { Order } from '@/app/types/order'
import axios from 'axios'
import { useEffect, useState } from 'react'

export default function OrdersPage() {
	const [orders, setOrders] = useState<Order[]>([])
	const [loading, setLoading] = useState(true)
	const [openOrderId, setOpenOrderId] = useState<number | null>(null)

	useEffect(() => {
		// Загружаем все заказы
		axios
			.get('/api/account/orders')
			.then(res => {
				// Фильтруем завершённые и отменённые
				const completedOrders = res.data.filter((order: Order) =>
					['DELIVERED', 'CANCELLED'].includes(order.status)
				)

				setOrders(completedOrders)
			})
			.finally(() => setLoading(false))
	}, [])

	if (loading) return <div>Загрузка...</div>

	return (
		<div className='space-y-6'>
			<h1 className='text-2xl font-bold text-center'>История заказов</h1>

			{orders.length === 0 ? (
				<p className='text-center text-gray-600 mt-10'>
					У вас пока нет завершённых заказов.
				</p>
			) : (
				orders.map(order => (
					<OrderCard
						key={order.id}
						number={order.orderNumber}
						date={
							order.statusChangedAt
								? new Date(order.statusChangedAt).toLocaleDateString('ru-RU')
								: new Date(order.createdAt).toLocaleDateString('ru-RU')
						}
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
