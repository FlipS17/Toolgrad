'use client'

import { useState } from 'react'
import StoreDetails from './StoreDetails'
import StoreList from './StoreList'

export type Store = {
	id: number
	name: string
	city: string
	address: string
	phone: string | null
	schedule: string | null
	latitude: number
	longitude: number
}

export default function PickupPage({ stores }: { stores: Store[] }) {
	const [selectedStore, setSelectedStore] = useState<Store | null>(null)

	return (
		<div className='container mx-auto py-10 px-4 flex flex-col md:flex-row gap-6'>
			<div className='md:w-1/3'>
				<StoreList
					stores={stores}
					selectedStoreId={selectedStore?.id}
					onSelect={store => setSelectedStore(store)}
				/>
			</div>

			<div className='md:w-2/3'>
				{selectedStore ? (
					<StoreDetails store={selectedStore} />
				) : (
					<p className='text-gray-500 text-sm'>
						Выберите магазин для самовывоза
					</p>
				)}
			</div>
		</div>
	)
}
