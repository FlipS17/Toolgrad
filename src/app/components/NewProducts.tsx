import { prisma } from '@/utils/db'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import ProductGrid from './ProductGrid'

export default async function NewProducts() {
	const recentDate = new Date()
	recentDate.setMonth(recentDate.getMonth() - 1)

	const newProducts = await prisma.product.findMany({
		where: {
			isActive: true,
			createdAt: { gte: recentDate },
		},
		include: { brand: true },
		take: 8,
	})

	const cleaned = newProducts.map(p => ({
		...p,
		brand: p.brand ? { name: p.brand.name } : undefined,
		createdAt: new Date(p.createdAt),
	}))

	return (
		<section className='container mx-auto px-4 py-7'>
			<div className='relative mb-6'>
				<h2 className='text-2xl font-bold text-center'>Новинки</h2>
				<Link
					href='catalog?sort=newest'
					className='absolute right-0 top-1 text-orange-500 hover:underline flex items-center gap-1'
				>
					Ещё <ChevronRight className='w-4 h-4' />
				</Link>
			</div>
			<ProductGrid products={cleaned} />
		</section>
	)
}
