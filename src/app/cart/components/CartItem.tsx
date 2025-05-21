'use client'

import Image from 'next/image'
import CartItemActions from './CartItemAction'
import QuantityCounter from './CartItemCounter'

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
	checked?: boolean
	onCheck?: (id: number, checked: boolean) => void
	isFavorite?: boolean
	onToggleFavorite?: (id: number) => void
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
	checked = true,
	onCheck,
	isFavorite = false,
	onToggleFavorite,
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

	const handleCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
		onCheck?.(id, e.target.checked)
	}

	return (
		<div className='flex items-start gap-4 rounded-xl bg-white px-4 py-4 shadow-sm'>
			{/* Чекбокс */}
			<div className='pt-2'>
				<input
					type='checkbox'
					checked={checked}
					onChange={handleCheck}
					className='w-5 h-5 accent-[#F89514] rounded border border-gray-300 cursor-pointer'
				/>
			</div>

			{/* Картинка */}
			<div className='w-[88px] h-[88px] shrink-0 bg-gray-100 rounded flex items-center justify-center'>
				<Image
					src={image || '/placeholder.png'}
					alt={name}
					width={88}
					height={88}
					className='object-contain w-full h-full'
				/>
			</div>

			{/* Основная информация */}
			<div className='flex flex-col flex-1 h-[88px]'>
				<div className='mb-auto'>
					<h3 className='font-medium text-sm text-gray-900'>{name}</h3>
					{brand && <p className='text-xs text-gray-500'>{brand}</p>}
				</div>

				<CartItemActions
					onRemove={() => onRemove(id)}
					isFavorite={isFavorite}
					onToggleFavorite={() => onToggleFavorite?.(id)}
				/>
			</div>

			{/* Кол-во и цена */}
			<div className='flex items-center gap-6 h-[88px]'>
				<QuantityCounter
					quantity={quantity}
					onDecrement={handleDecrement}
					onIncrement={handleIncrement}
				/>

				<div className='text-right min-w-[90px]'>
					<p className='text-sm font-bold text-gray-900'>
						{(price * quantity).toLocaleString('ru-RU')} ₽
					</p>
					{oldPrice && oldPrice > price && (
						<p className='text-xs text-gray-400 line-through'>
							{(oldPrice * quantity).toLocaleString('ru-RU')} ₽
						</p>
					)}
				</div>
			</div>
		</div>
	)
}
