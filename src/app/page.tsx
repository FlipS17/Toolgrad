import HeroSlider from '@/app/components/HeroSlider'
import PopularCategories from '@/app/components/PopularCategories'
import { prisma } from '@/utils/db'
import HomeSearch from './components/HomeSearch'

export default async function Home() {
	const sliderItems = await prisma.slider.findMany({
		where: { isActive: true },
		orderBy: { order: 'asc' },
	})

	return (
		<main>
			<HeroSlider items={sliderItems} />
			<HomeSearch />
			<PopularCategories />
		</main>
	)
}
