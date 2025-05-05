'use client'

import Image from 'next/image'
import Link from 'next/link'
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/pagination'
import { Autoplay, EffectFade, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

type SliderItem = {
	id: number
	title: string
	description: string | null
	image: string
	link: string | null
	buttonText: string | null
}

export default function HeroSlider({ items }: { items: SliderItem[] }) {
	return (
		<div className='relative w-full h-[250px] sm:h-[350px] md:h-[450px] lg:h-[550px] mb-5'>
			<Swiper
				modules={[Autoplay, Pagination, EffectFade]}
				autoplay={{
					delay: 5000,
					disableOnInteraction: false,
				}}
				pagination={{
					clickable: true,
					bulletClass: 'swiper-bullet',
					bulletActiveClass: 'swiper-bullet-active',
				}}
				effect='fade'
				loop={true}
				className='h-full'
			>
				{items.map(item => (
					<SwiperSlide key={item.id} className='relative'>
						<Image
							src={item.image}
							alt={item.title}
							fill
							className='object-cover'
							priority
						/>
						<div className='absolute inset-0 bg-black/30 flex items-center'>
							<div className='container px-4 text-white'>
								<div className='max-w-xs sm:max-w-sm md:max-w-md bg-black/40 p-4 sm:p-6 rounded-lg'>
									<h2 className='text-xl sm:text-2xl md:text-3xl font-bold mb-2'>
										{item.title}
									</h2>
									{item.description && (
										<p className='text-sm sm:text-base md:text-lg mb-3'>
											{item.description}
										</p>
									)}
									{item.link && (
										<Link
											href={item.link}
											className='inline-block bg-orange-500 hover:bg-orange-600 text-white text-sm sm:text-base font-medium py-1.5 sm:py-2 px-4 sm:px-6 rounded transition-colors'
										>
											{item.buttonText || 'Подробнее'}
										</Link>
									)}
								</div>
							</div>
						</div>
					</SwiperSlide>
				))}
			</Swiper>
		</div>
	)
}
