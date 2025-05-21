// CartItemActions.tsx
import FavoriteToggleButton from '@/app/catalog/components/FavoriteToggleButton'
import { useNotification } from '@/app/components/NotificationProvider'
import { FiTrash } from 'react-icons/fi'

interface CartItemActionsProps {
	onRemove: () => void
	isFavorite: boolean
	onToggleFavorite: () => void
}

export default function CartItemActions({
	onRemove,
	isFavorite,
	onToggleFavorite,
}: CartItemActionsProps) {
	const { notify } = useNotification()

	const handleRemove = () => {
		onRemove()
		notify('Товар удалён из корзины', 'info')
	}

	const handleToggleFavorite = () => {
		onToggleFavorite()
		notify(
			isFavorite ? 'Товар удалён из избранного' : 'Товар добавлен в избранное',
			isFavorite ? 'info' : 'success'
		)
	}

	return (
		<div className='flex gap-3 mt-auto'>
			<button
				onClick={handleRemove}
				className='text-gray-400 hover:text-red-500 transition text-xs flex items-center gap-1 cursor-pointer'
			>
				<FiTrash className='w-4 h-4' />
				<span>Удалить</span>
			</button>

			<FavoriteToggleButton
				isFavorite={isFavorite}
				onToggle={handleToggleFavorite}
				variant='with-text'
			/>
		</div>
	)
}
