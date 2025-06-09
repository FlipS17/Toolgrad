import HeroSlider from '@/app/components/HeroSlider'
import NewProducts from '@/app/components/NewProducts'
import PopularCategories from '@/app/components/PopularCategories'
import PopularProducts from '@/app/components/PopularProducts'
import PromoProducts from '@/app/components/PromoProducts'
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
			<PopularProducts />
			<PromoProducts />
			<NewProducts />
		</main>
	)
}
