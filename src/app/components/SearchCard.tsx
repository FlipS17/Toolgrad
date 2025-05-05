'use client'

import Image from 'next/image'
import Link from 'next/link'

type Product = {
	id: number
	name: string
	price: number
	images: string[]
	brand?: {
		name: string
	}
}

type SearchCardProps = {
	product: Product
	onClick?: () => void
}

export default function SearchCard({ product, onClick }: SearchCardProps) {
	return (
		<Link
			href={`/product/${product.id}`}
			onClick={onClick}
			className='flex items-center w-full px-4 py-2 hover:bg-gray-100 transition rounded-md'
		>
			<div className='relative w-14 h-14 rounded-md overflow-hidden bg-gray-100 mr-4'>
				<Image
					src={product.images[0] || '/placeholder.png'}
					alt={product.name}
					fill
					className='object-contain'
				/>
			</div>

			<div className='flex-1'>
				<p className='text-sm font-medium text-gray-900 line-clamp-1'>
					{product.name}
				</p>
				{product.brand?.name && (
					<p className='text-xs text-gray-500'>{product.brand.name}</p>
				)}
			</div>

			<div className='text-sm font-semibold text-[#F89514] ml-4 whitespace-nowrap'>
				{product.price.toLocaleString('ru-RU')} ₽
			</div>
		</Link>
	)
}
