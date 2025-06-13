'use client'

import ProductCard from '@/app/catalog/components/ProductCard'

type Product = {
	id: number
	name: string
	price: number
	oldPrice?: number | null
	images: string[]
	brand?: { name: string } | undefined
	createdAt: Date
}

type Props = {
	products: Product[]
	columns?: number // дефолт 4
}

export default function ProductGrid({ products, columns = 4 }: Props) {
	const gridCols =
		{
			2: 'grid-cols-1 sm:grid-cols-2',
			3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
			4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
			6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
		}[columns] || 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'

	return (
		<div className={`grid gap-6 ${gridCols}`}>
			{products.map(p => (
				<ProductCard
					key={p.id}
					product={p}
					isFavorite={false}
					onToggleFavorite={async () => false}
					onAddToCart={() => {}}
				/>
			))}
		</div>
	)
}
