import Image from 'next/image'
import Link from 'next/link'

interface OrderProduct {
	id: number
	name: string
	quantity: number
	price: number
	image: string
	productId: number
}

interface OrderCardProps {
	number: string
	date: string
	total: number
	status: string
	products: OrderProduct[]
	address?: string
	deliveryType: 'PICKUP' | 'DELIVERY'
	isOpen?: boolean
	onToggle?: () => void
}

const statusColorMap: Record<string, string> = {
	DELIVERED: 'text-blue-600',
	READY: 'text-green-600',
	PROCESSING: 'text-orange-500',
	SHIPPED: 'text-indigo-600',
	CANCELLED: 'text-red-500',
}

export default function OrderCard({
	number,
	date,
	total,
	status,
	products,
	address,
	deliveryType,
	isOpen = false,
	onToggle,
}: OrderCardProps) {
	return (
		<div className='bg-white border rounded-xl shadow-sm p-4 space-y-4'>
			<div className='flex items-center justify-between'>
				<div className='space-y-1'>
					<p className='text-sm text-gray-500'>Заказ №{number}</p>
					<p
						className={`font-semibold ${
							statusColorMap[status] || 'text-gray-800'
						}`}
					>
						{status === 'DELIVERED'
							? `Получен ${date}`
							: status === 'READY'
							? 'Готов к выдаче'
							: status === 'PROCESSING'
							? 'В сборке'
							: status === 'SHIPPED'
							? 'Передан в доставку'
							: status === 'CANCELLED'
							? 'Отменен'
							: status}
					</p>
				</div>
				<button
					className='text-sm text-blue-500 hover:underline'
					onClick={onToggle}
				>
					Подробнее {isOpen ? '▲' : '▼'}
				</button>
			</div>

			{isOpen && (
				<div className='space-y-3'>
					{products.map(product => (
						<div key={product.id} className='flex items-center gap-3'>
							<Image
								src={product.image || '/placeholder.png'}
								alt={product.name}
								width={50}
								height={50}
								className='object-contain w-12 h-12 border rounded'
							/>
							<div className='flex-1'>
								<p className='line-clamp-2 text-sm text-gray-900 font-medium'>
									{product.name}
								</p>
							</div>
							<div className='whitespace-nowrap text-sm'>
								{product.quantity} шт.
							</div>
							<div className='whitespace-nowrap text-sm font-semibold'>
								{product.price.toLocaleString('ru-RU')} ₽
							</div>
							<Link
								href={`/products/${product.productId}`}
								className='ml-4 text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-xl'
							>
								К товару
							</Link>
						</div>
					))}

					<div className='text-sm text-gray-700'>
						{deliveryType === 'PICKUP' ? 'Самовывоз' : 'Доставка'}
						{address && <span className='ml-2 text-gray-900'>{address}</span>}
					</div>

					<div className='text-right font-bold text-lg text-[#F89514]'>
						Итого {total.toLocaleString('ru-RU')} ₽
					</div>
				</div>
			)}
		</div>
	)
}
