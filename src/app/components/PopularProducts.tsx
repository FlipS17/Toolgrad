import { prisma } from '@/utils/db'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import ProductGrid from './ProductGrid'

export default async function PopularProducts() {
	const products = await prisma.product.findMany({
		where: { isActive: true },
		include: { orderItems: true, brand: true },
	})

	const sorted = products
		.map(p => ({
			...p,
			brand: p.brand ? { name: p.brand.name } : undefined,
			createdAt: new Date(p.createdAt),
			sales: p.orderItems.reduce((sum, item) => sum + item.quantity, 0),
		}))
		.sort((a, b) => b.sales - a.sales)
		.slice(0, 8)

	return (
		<section className='container mx-auto px-4 py-7'>
			<div className='relative mb-6'>
				<h2 className='text-2xl font-bold text-center'>Популярное</h2>
				<Link
					href='/catalog?popular=true'
					className='absolute right-0 top-1 text-orange-500 hover:underline flex items-center gap-1'
				>
					Ещё <ChevronRight className='w-4 h-4' />
				</Link>
			</div>
			<ProductGrid products={sorted} />
		</section>
	)
}
