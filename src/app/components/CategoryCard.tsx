import Image from 'next/image'
import Link from 'next/link'

export default function CategoryCard({
	category,
}: {
	category: { id: number; name: string; image: string }
}) {
	return (
		<Link href={`/category/${category.id}`} className='group block text-center'>
			<div className='relative h-40 w-full mb-2 overflow-hidden rounded-lg'>
				<Image
					src={category.image}
					alt={category.name}
					fill
					className='object-cover group-hover:scale-105 transition duration-300'
				/>
			</div>
			<h3 className='font-medium text-gray-800 group-hover:text-orange-500'>
				{category.name}
			</h3>
		</Link>
	)
}
