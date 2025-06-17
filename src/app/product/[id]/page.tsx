import AddToCartClient from '@/app/product/components/AddToCartClient'
import ProductImages from '@/app/product/components/ProductImages'
import { prisma } from '@/utils/db'
import { notFound } from 'next/navigation'

export default async function ProductPage({
	params,
}: {
	params: { id: string }
}) {
	// Загружаем продукт с привязками: бренд и характеристики
	const product = await prisma.product.findUnique({
		where: { id: Number(params.id) },
		include: {
			brand: true,
			specifications: true,
		},
	})

	// Если продукт не найден — 404
	if (!product) return notFound()

	// Вычисление скидки
	const discount =
		product.oldPrice && product.oldPrice > product.price
			? Math.round(100 - (product.price / product.oldPrice) * 100)
			: null

	return (
		<div className='container mx-auto px-4 py-10'>
			<div className='flex flex-col lg:flex-row gap-10'>
				{/* Левая колонка: изображения */}
				<div className='w-full lg:w-1/2'>
					<ProductImages images={product.images} alt={product.name} />
				</div>

				{/* Правая колонка: информация */}
				<div className='flex-1'>
					<h1 className='text-2xl font-bold mb-2'>{product.name}</h1>

					{product.brand?.name && (
						<p className='text-sm text-gray-500 mb-4'>
							Бренд: {product.brand.name}
						</p>
					)}

					{/* Блок цен */}
					<div className='flex items-baseline gap-4 mb-6'>
						<span className='text-3xl font-bold text-[#F89514]'>
							{product.price.toLocaleString()} ₽
						</span>

						{/* Старая цена и скидка, только если старая цена больше */}
						{product.oldPrice && product.oldPrice > product.price && (
							<>
								<span className='text-xl line-through text-gray-400'>
									{product.oldPrice.toLocaleString()} ₽
								</span>
								{discount && (
									<span className='text-sm text-red-500 font-semibold'>
										–{discount}%
									</span>
								)}
							</>
						)}
					</div>

					{/* Кнопка "В корзину" */}
					<AddToCartClient productId={product.id} />

					{/* Описание */}
					<div className='mt-10'>
						<h2 className='text-lg font-semibold mb-2'>Описание</h2>
						<p className='text-gray-700 text-sm whitespace-pre-line'>
							{product.description}
						</p>
					</div>

					{/* Характеристики */}
					{(product.weight ||
						product.dimensions ||
						product.warrantyMonths ||
						product.specifications.length > 0) && (
						<div className='mt-6'>
							<h2 className='text-lg font-semibold mb-2'>Характеристики</h2>
							<ul className='text-sm text-gray-800 divide-y'>
								{product.weight && (
									<li className='py-1 flex justify-between'>
										<span>Вес:</span>
										<span>{product.weight} кг</span>
									</li>
								)}
								{product.dimensions && (
									<li className='py-1 flex justify-between'>
										<span>Упаковка:</span>
										<span>{product.dimensions}</span>
									</li>
								)}
								{product.warrantyMonths && (
									<li className='py-1 flex justify-between'>
										<span>Гарантия:</span>
										<span>{product.warrantyMonths} мес.</span>
									</li>
								)}
								{product.specifications.map((spec, i) => (
									<li key={i} className='py-1 flex justify-between'>
										<span>{spec.name}:</span>
										<span className='text-right text-gray-600'>
											{spec.value}
										</span>
									</li>
								))}
							</ul>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
