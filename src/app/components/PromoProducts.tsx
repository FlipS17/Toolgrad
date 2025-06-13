import { prisma } from '@/utils/db'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default async function PromoProducts() {
	// Выгружаем акции которые действуют и активные
	const promotions = await prisma.promotion.findMany({
		where: {
			isActive: true,
			startDate: { lte: new Date() },
			endDate: { gte: new Date() },
		},
		take: 2,
	})

	return (
		<section className='container mx-auto px-4 py-7'>
			<div className='relative mb-6'>
				<h2 className='text-2xl font-bold text-center'>Акции</h2>
				<Link
					href='/sales'
					className='absolute right-0 top-1 text-orange-500 hover:underline flex items-center gap-1'
				>
					Ещё <ChevronRight className='w-4 h-4' />
				</Link>
			</div>
			<div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
				{promotions.map(promo => (
					<div
						key={promo.id}
						className='bg-[#fef7f1] rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition border border-orange-100'
					>
						<div className='mb-5'>
							<span className='inline-block bg-[#F89514] text-white text-xs font-bold px-3 py-1 rounded-full mb-3'>
								-{Math.round(promo.discount)}%
							</span>
							<h3 className='text-lg font-bold text-[#1a365d]'>{promo.name}</h3>
							<p className='text-sm text-[#1a365d]/80'>{promo.description}</p>
						</div>
						<Link
							href='/sales'
							className='inline-flex items-center justify-center bg-[#1a365d] hover:bg-[#163152] text-white text-sm font-semibold rounded-full px-5 py-2 transition w-fit'
						>
							Перейти <ChevronRight className='ml-2 w-4 h-4' />
						</Link>
					</div>
				))}
			</div>
		</section>
	)
}
