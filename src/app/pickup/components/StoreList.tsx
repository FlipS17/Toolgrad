import Input from '@/app/account/components/Input'
import DOMPurify from 'dompurify'
import { ArrowLeft, Clock, MapPin } from 'lucide-react'
import { useState } from 'react'
import { Store } from './PickupPage'

interface StoreListProps {
	stores: Store[]
	selectedStoreId?: number
	onSelect: (store: Store) => void
	scrollable?: boolean
}

export default function StoreList({
	stores,
	selectedStoreId,
	onSelect,
	scrollable = false,
}: StoreListProps) {
	const [query, setQuery] = useState('')

	const filtered = stores.filter(
		store =>
			store.name.toLowerCase().includes(query.toLowerCase()) ||
			store.address.toLowerCase().includes(query.toLowerCase())
	)

	return (
		<div className='w-full space-y-4'>
			{/* Назад */}
			<button
				onClick={() => history.back()}
				className='flex items-center text-sm text-gray-600 hover:text-[#F89514] transition font-medium gap-2'
			>
				<ArrowLeft className='w-4 h-4 cursor-pointer' /> Назад
			</button>

			{/* Поиск */}
			<div className='relative'>
				<Input
					label='Поиск по магазинам'
					placeholder='Искать магазин'
					value={query}
					onChange={e => setQuery(DOMPurify.sanitize(e.target.value))}
					className='pl-10'
				/>
			</div>

			<div
				className={`space-y-3 ${
					scrollable ? 'overflow-y-auto max-h-[260px]' : ''
				}`}
			>
				{filtered.map(store => (
					<button
						key={store.id}
						onClick={() => onSelect(store)}
						className={`w-full text-left p-4 cursor-pointer border rounded-xl transition text-sm shadow-sm hover:shadow-md ${
							store.id === selectedStoreId
								? 'border-[#F89514] text-[#F89514]'
								: 'border-gray-200 text-gray-800'
						}`}
					>
						<div className='font-semibold'>{store.name}</div>
						<div className='flex items-center text-xs text-gray-500 gap-1'>
							<MapPin className='w-3 h-3' />
							{store.city}, {store.address}
						</div>
						{store.schedule && (
							<div className='flex items-center text-xs text-gray-400 gap-1 mt-0.5'>
								<Clock className='w-3 h-3' />
								{store.schedule}
							</div>
						)}
					</button>
				))}
			</div>
		</div>
	)
}
