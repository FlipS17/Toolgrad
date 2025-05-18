'use client'

import clsx from 'clsx'
import { Heart } from 'lucide-react'

interface FavoriteToggleButtonProps {
	isFavorite: boolean
	onToggle: () => void
	variant?: 'icon-only' | 'with-text'
}

export default function FavoriteToggleButton({
	isFavorite,
	onToggle,
	variant = 'icon-only',
}: FavoriteToggleButtonProps) {
	const baseClasses =
		'flex items-center gap-1 text-xs cursor-pointer transition'

	const icon = (
		<Heart
			className='w-5 h-5'
			strokeWidth={isFavorite ? 0 : 1.5}
			fill={isFavorite ? '#ef4444' : 'none'}
			color={isFavorite ? '#ef4444' : 'currentColor'}
		/>
	)

	if (variant === 'icon-only') {
		return (
			<button
				onClick={onToggle}
				className={clsx(baseClasses, 'text-gray-400 hover:text-red-500')}
				aria-label={
					isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'
				}
			>
				{icon}
			</button>
		)
	}

	// with-text
	return (
		<button
			onClick={onToggle}
			className={clsx(
				baseClasses,
				isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
			)}
		>
			{icon}
			<span>{isFavorite ? 'В избранном' : 'В избранное'}</span>
		</button>
	)
}
