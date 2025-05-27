'use client'

import {
	CheckCircle,
	ChevronDown,
	ChevronUp,
	Clock,
	PackageCheck,
	Truck,
	XCircle,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { ReactElement } from 'react'

interface OrderProduct {
	id: number
	name: string
	quantity: number
	price: number
	image: string
	productId: number
}

interface Address {
	city: string
	street: string
	settlement?: string
	building: string
	apartment: string
	entrance?: string
	floor?: string
	postalCode?: string
}

interface Store {
	city: string
	address: string
}

interface OrderCardProps {
	number: string
	date: string
	total: number
	status: string
	products: OrderProduct[]
	address?: string
	store?: Store
	deliveryType: 'PICKUP' | 'DELIVERY'
	isOpen?: boolean
	onToggle?: () => void
}

const statusMap: Record<
	string,
	{ label: string; icon: ReactElement; color: string; bg: string }
> = {
	DELIVERED: {
		label: 'Получен',
		icon: <PackageCheck className='w-5 h-5 mr-2' />,
		color: 'text-blue-700',
		bg: 'bg-blue-50',
	},
	READY: {
		label: 'Готов к выдаче',
		icon: <CheckCircle className='w-5 h-5 mr-2' />,
		color: 'text-green-700',
		bg: 'bg-green-50',
	},
	PROCESSING: {
		label: 'В сборке',
		icon: <Clock className='w-5 h-5 mr-2' />,
		color: 'text-orange-700',
		bg: 'bg-orange-50',
	},
	SHIPPED: {
		label: 'Передан в доставку',
		icon: <Truck className='w-5 h-5 mr-2' />,
		color: 'text-indigo-700',
		bg: 'bg-indigo-50',
	},
	PENDING: {
		label: 'Ожидает обработки',
		icon: <Clock className='w-5 h-5 mr-2' />,
		color: 'text-gray-700',
		bg: 'bg-gray-50',
	},
	CANCELLED: {
		label: 'Отменён',
		icon: <XCircle className='w-5 h-5 mr-2' />,
		color: 'text-red-700',
		bg: 'bg-red-50',
	},
}

function formatAddress(address?: Address): string {
	if (!address) return 'Адрес не указан'

	const parts = [
		address.settlement || address.city,
		address.street,
		address.building ? `д. ${address.building}` : '',
		address.apartment ? `кв. ${address.apartment}` : '',
		address.entrance ? `подъезд ${address.entrance}` : '',
		address.floor ? `этаж ${address.floor}` : '',
	]

	return parts.filter(Boolean).join(', ')
}

function formatStoreAddress(store?: Store): string {
	if (!store) return 'Магазин не найден'
	return `${store.city}, ${store.address}`
}

export default function OrderCard({
	number,
	date,
	total,
	status,
	products,
	address,
	store,
	deliveryType,
	isOpen = false,
	onToggle,
}: OrderCardProps) {
	const statusMeta = statusMap[status] || {
		label: 'Неизвестно',
		icon: <Clock className='w-5 h-5 mr-2' />,
		color: 'text-gray-700',
		bg: 'bg-gray-50',
	}

	return (
		<div
			className={`rounded-xl shadow-sm ${statusMeta.bg} px-4 py-3 space-y-4`}
		>
			<div className='flex justify-between items-start flex-wrap gap-2'>
				<div className='space-y-1'>
					<p className='text-sm text-gray-500'>Заказ №{number}</p>
					<p className={`flex items-center font-semibold ${statusMeta.color}`}>
						{statusMeta.icon}
						{statusMeta.label === 'Получен'
							? `${statusMeta.label} ${date}`
							: statusMeta.label}
					</p>
				</div>
				<button
					onClick={onToggle}
					className='flex items-center text-sm text-blue-600 hover:underline'
				>
					{isOpen ? (
						<>
							<ChevronUp className='w-4 h-4 mr-1' />
							Скрыть
						</>
					) : (
						<>
							<ChevronDown className='w-4 h-4 mr-1' />
							Подробнее
						</>
					)}
				</button>
			</div>

			{isOpen && (
				<div className='space-y-4'>
					{products.map(product => (
						<div
							key={product.id}
							className='flex flex-col sm:flex-row sm:items-center gap-3'
						>
							<Image
								src={product.image || '/placeholder.png'}
								alt={product.name}
								width={48}
								height={48}
								className='w-12 h-12 object-contain rounded border'
							/>
							<div className='flex-1'>
								<p className='text-sm font-medium text-gray-800 line-clamp-2'>
									{product.name}
								</p>
							</div>
							<div className='flex items-center gap-4 sm:gap-6'>
								<div className='text-sm whitespace-nowrap min-w-[60px] text-right'>
									{product.quantity} шт.
								</div>
								<div className='text-sm font-semibold whitespace-nowrap text-right min-w-[80px]'>
									{product.price.toLocaleString('ru-RU')} ₽
								</div>
								<Link
									href={`/products/${product.productId}`}
									className='text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-xl whitespace-nowrap'
								>
									К товару
								</Link>
							</div>
						</div>
					))}

					<div className='flex flex-col sm:flex-row justify-between text-sm text-gray-700 pt-2 border-t gap-3 sm:gap-0'>
						<div>
							{deliveryType === 'PICKUP'
								? `Самовывоз — ${formatStoreAddress(store)}`
								: `Доставка — ${address || 'Адрес не указан'}`}
						</div>
						<div className='font-bold text-[#F89514] text-base'>
							Итого {total.toLocaleString('ru-RU')} ₽
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
