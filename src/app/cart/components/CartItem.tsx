'use client'

import FavoriteToggleButton from '@/app/catalog/components/FavoriteToggleButton'
import { useNotification } from '@/app/components/NotificationProvider'
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
	const { notify } = useNotification()

	const handleDecrement = () => {
		if (quantity === 1) {
			handleRemove()
		} else {
			onDecrement(id)
		}
	}

	const handleIncrement = () => {
		onIncrement(id)
	}

	const handleRemove = () => {
		onRemove(id)
		notify('Товар удален из корзины', 'info')
	}

	const handleCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
		onCheck?.(id, e.target.checked)
	}

	const handleFavorite = () => {
		onToggleFavorite?.(id)
		notify(
			isFavorite ? 'Товар удалён из избранного' : 'Товар добавлен в избранное',
			isFavorite ? 'info' : 'success'
		)
	}

	return (
		<div className='flex gap-4 rounded-xl bg-white px-4 py-4 shadow-sm'>
			{/* Чекбокс по центру по вертикали */}
			<div className='flex items-center'>
				<input
					type='checkbox'
					checked={checked}
					onChange={handleCheck}
					className='w-5 h-5 accent-[#F89514] rounded border border-gray-300 cursor-pointer'
				/>
			</div>

			{/* Контент */}
			<div className='flex flex-col w-full'>
				{/* Верхняя часть: картинка + основная информация */}
				<div className='flex items-center gap-4'>
					{/* Картинка */}
					<Image
						src={image || '/placeholder.png'}
						alt={name}
						width={64}
						height={64}
						className='object-contain w-16 h-16 bg-gray-100 rounded'
					/>

					{/* Информация: по вертикали выровнена по центру картинки */}
					<div className='flex flex-col justify-center flex-1 gap-1'>
						<p className='font-medium text-sm text-gray-900'>{name}</p>
						{brand && <p className='text-xs text-gray-500'>{brand}</p>}

						<div className='flex justify-between items-center mt-2'>
							{/* Количество */}
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
							<div className='text-right w-[90px]'>
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
				</div>

				{/* Нижняя часть: Удалить + В избранное */}
				<div className='flex gap-4 mt-4 pl-[80px]'>
					<button
						onClick={handleRemove}
						className='text-gray-400 hover:text-red-500 transition text-xs flex items-center gap-1 cursor-pointer'
					>
						<FiTrash className='w-4 h-4' />
						<span>Удалить</span>
					</button>

					<FavoriteToggleButton
						isFavorite={isFavorite}
						onToggle={handleFavorite}
						variant='with-text'
					/>
				</div>
			</div>
		</div>
	)
}
