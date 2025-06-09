'use client'

import Image from 'next/image'
import { useState } from 'react'

interface Props {
	images: string[]
	alt: string
}

export default function ProductImages({ images, alt }: Props) {
	const [selectedImage, setSelectedImage] = useState(images?.[0] || '')

	return (
		<>
			<div className='relative w-full h-[400px] bg-gray-100 rounded-xl overflow-hidden'>
				<Image
					src={selectedImage || '/placeholder.png'}
					alt={alt}
					fill
					className='object-contain'
				/>
			</div>

			<div className='flex gap-2 mt-3 overflow-x-auto'>
				{images.map((img, idx) => (
					<button
						key={idx}
						onClick={() => setSelectedImage(img)}
						className={`w-16 h-16 border rounded-md overflow-hidden ${
							selectedImage === img ? 'ring-2 ring-[#F89514]' : ''
						}`}
					>
						<Image
							src={img}
							alt={`preview-${idx}`}
							width={64}
							height={64}
							className='object-contain'
						/>
					</button>
				))}
			</div>
		</>
	)
}
