'use client'

import Image from 'next/image'
import { FiTrash } from 'react-icons/fi'

interface CartItemProps {
	id: number
	name: string
	brand?: string
	price: number
	oldPrice?: number
	image: string
	quantity: number
	onIncrement: (id: number) => void
	onDecrement: (id: number) => void
	onRemove: (id: number) => void
}

export default function CartItem({
	id,
	name,
	brand,
	price,
	oldPrice,
	image,
	quantity,
	onIncrement,
	onDecrement,
	onRemove,
}: CartItemProps) {
	const handleDecrement = () => {
		if (quantity === 1) {
			onRemove(id)
		} else {
			onDecrement(id)
		}
	}

	const handleIncrement = () => {
		onIncrement(id)
	}

	return (
		<div className='flex items-center justify-between rounded-xl bg-white px-4 py-4 shadow-sm'>
			{/* Картинка */}
			<div className='flex items-center gap-4 flex-1'>
				<Image
					src={image || '/placeholder.png'}
					alt={name}
					width={64}
					height={64}
					className='object-contain w-16 h-16 bg-gray-100 rounded'
				/>
				<div className='space-y-1'>
					<p className='font-medium text-sm text-gray-900'>{name}</p>
					{brand && <p className='text-xs text-gray-500'>{brand}</p>}
				</div>
			</div>

			{/* Кол-во */}
			<div className='flex items-center gap-2'>
				<button
					onClick={handleDecrement}
					className='w-8 h-8 border rounded hover:bg-gray-100 text-lg font-medium text-gray-700'
				>
					–
				</button>
				<span className='w-6 text-center'>{quantity}</span>
				<button
					onClick={handleIncrement}
					className='w-8 h-8 border rounded hover:bg-gray-100 text-lg font-medium text-gray-700'
				>
					+
				</button>
			</div>

			{/* Цена */}
			<div className='text-right w-24'>
				<p className='text-sm font-bold text-gray-900'>
					{(price * quantity).toLocaleString()} ₽
				</p>
				{oldPrice && oldPrice > price && (
					<p className='text-xs text-gray-400 line-through'>
						{(oldPrice * quantity).toLocaleString()} ₽
					</p>
				)}
			</div>

			{/* Удалить */}
			<button
				onClick={() => onRemove(id)}
				className='ml-4 text-gray-400 hover:text-red-500 transition'
			>
				<FiTrash className='w-4 h-4' />
			</button>
		</div>
	)
}
