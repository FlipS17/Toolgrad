'use client'

import { useFavorites } from '@/app/favorite/components/FavoriteProvider'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Header() {
	const [isMenuOpen, setIsMenuOpen] = useState(false)
	const [isScrolled, setIsScrolled] = useState(false)
	const [favoriteCount, setFavoriteCount] = useState<number>(0)
	const { data: session } = useSession()
	const { favoriteIds } = useFavorites()

	const userName = session?.user?.name

	useEffect(() => {
		const fetchFavorites = async () => {
			if (!session?.user) return
			try {
				const res = await fetch('/api/favorites')
				if (!res.ok) throw new Error('Ошибка запроса избранного')
				const data = await res.json()
				setFavoriteCount(data.length)
			} catch (err) {
				console.error('Не удалось загрузить избранное:', err)
			}
		}
		fetchFavorites()
	}, [session])

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 10)
		}
		window.addEventListener('scroll', handleScroll)
		return () => window.removeEventListener('scroll', handleScroll)
	}, [])

	const toggleMenu = () => {
		setIsMenuOpen(prev => {
			const newState = !prev

			if (newState) {
				document.body.style.overflow = 'hidden'
				document.body.style.position = 'fixed'
				document.body.style.top = `-${window.scrollY}px`
				document.body.style.width = '100%'
			} else {
				const scrollY = document.body.style.top
				document.body.style.overflow = ''
				document.body.style.position = ''
				document.body.style.top = ''
				document.body.style.width = ''
				window.scrollTo(0, parseInt(scrollY || '0') * -1)
			}

			return newState
		})
	}

	return (
		<>
			<header
				className={`sticky top-0 z-40 bg-white shadow-sm transition-all ${
					isScrolled ? 'shadow-md' : ''
				}`}
			>
				{/* Верхний блок с контактами - скрывается на мобильных */}
				<div className='hidden md:block bg-gray-50 py-2 px-4'>
					<div className='container mx-auto flex justify-between items-center text-sm'>
						<div className='flex items-center space-x-2'>
							<LocationIcon />
							<span>Красногорск, ул. Вилора Трифонова, д. 3</span>
						</div>
						<div className='flex items-center space-x-2'>
							<PhoneIcon />
							<span>+7 (925) 616-09-95</span>
						</div>
						<Link
							href={userName ? '/account/profile' : '/account'}
							className='flex items-center space-x-2 hover:text-gray-600 transition'
						>
							<AccountIcon />
							<span>{userName || 'Личный кабинет'}</span>
						</Link>
					</div>
				</div>

				{/* Основной header */}
				<div className='container mx-auto py-4 px-4'>
					<div className='flex justify-between items-center'>
						{/* Логотип */}
						<Link href='/' className='block'>
							<div className='w-24 md:w-24'>
								<Logo />
							</div>
						</Link>

						{/* Навигация для десктопа */}
						<nav className='hidden md:flex space-x-8'>
							<NavLink href='/'>Главная</NavLink>
							<NavLink href='/catalog'>Каталог</NavLink>
							<NavLink href='/sales'>Акции</NavLink>
							<NavLink href='/delivery'>Доставка</NavLink>
							<NavLink href='/contacts'>Контакты</NavLink>
						</nav>

						{/* Иконки корзины и избранного */}
						<div className='flex items-center space-x-6'>
							<Link href='/favorite' className='relative'>
								<HeartIcon />
								{favoriteIds.length > 0 && (
									<span className='absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
										{favoriteIds.length}
									</span>
								)}
							</Link>
							<Link href='/cart' className='relative'>
								<CartIcon />
								<span className='absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
									0
								</span>
							</Link>

							{/* Бургер-кнопка для мобильных */}
							<button
								className='md:hidden p-2 -mr-2'
								onClick={toggleMenu}
								aria-label='Меню'
							>
								<BurgerIcon isOpen={isMenuOpen} />
							</button>
						</div>
					</div>
				</div>
			</header>

			{/* Мобильное меню */}
			<div
				className={`fixed inset-0 z-40 bg-white transition-all duration-300 ease-in-out transform ${
					isMenuOpen ? 'translate-x-0' : 'translate-x-full'
				}`}
			>
				<div className='container mx-auto px-4 py-6 h-full flex flex-col'>
					{/* Шапка мобильного меню */}
					<div className='flex justify-between items-center mb-8'>
						<Link href='/' className='text-2xl font-bold' onClick={toggleMenu}>
							<Logo />
						</Link>
						<button
							className='p-2'
							onClick={toggleMenu}
							aria-label='Закрыть меню'
						>
							<CloseIcon />
						</button>
					</div>

					{/* Навигация */}
					<nav className='flex-1 flex flex-col space-y-6'>
						<MobileNavLink href='/' onClick={toggleMenu}>
							Главная
						</MobileNavLink>
						<MobileNavLink href='/catalog' onClick={toggleMenu}>
							Каталог
						</MobileNavLink>
						<MobileNavLink href='/sales' onClick={toggleMenu}>
							Акции
						</MobileNavLink>
						<MobileNavLink href='/delivery' onClick={toggleMenu}>
							Доставка
						</MobileNavLink>
						<MobileNavLink href='/contacts' onClick={toggleMenu}>
							Контакты
						</MobileNavLink>
					</nav>

					{/* Контакты в мобильном меню */}
					<div className='mt-auto pb-8 pt-6 border-t border-gray-200'>
						<div className='space-y-4'>
							<div className='flex items-center'>
								<LocationIcon className='text-gray-400 mr-3' />
								<span className='text-gray-600'>Москва, ул. Примерная 123</span>
							</div>
							<div className='flex items-center'>
								<PhoneIcon className='text-gray-400 mr-3' />
								<span className='text-gray-600'>+7 (925) 616-09-95</span>
							</div>
							<div className='flex items-center'>
								<AccountIcon className='text-gray-400 mr-3' />
								<Link
									href={userName ? '/account/profile' : '/account'}
									onClick={toggleMenu}
									className='text-gray-600 hover:text-[#F89514] transition'
								>
									{userName || 'Личный кабинет'}
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Мобильная нижняя панель навигации */}
			<div className='fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-30 md:hidden'>
				<div className='grid grid-cols-4'>
					<MobileNavButton href='/' icon={<HomeIcon />} label='Главная' />
					<MobileNavButton
						href='/catalog'
						icon={<CatalogIcon />}
						label='Каталог'
					/>
					<MobileNavButton href='/sales' icon={<SaleIcon />} label='Акции' />
					<MobileNavButton
						href={userName ? '/account/profile' : '/account'}
						icon={<AccountIcon />}
						label='Профиль'
					/>
				</div>
			</div>
		</>
	)
}

// Компоненты для навигации
function NavLink({
	href,
	children,
}: {
	href: string
	children: React.ReactNode
}) {
	return (
		<Link
			href={href}
			className='relative pb-1 hover:text-[#F89514] transition-colors duration-300'
		>
			{children}
			<span className='absolute left-0 bottom-0 w-0 h-0.5 bg-[#F89514] transition-all duration-300 hover:w-full'></span>
		</Link>
	)
}

function MobileNavLink({
	href,
	children,
	onClick,
}: {
	href: string
	children: React.ReactNode
	onClick: () => void
}) {
	return (
		<Link
			href={href}
			className='text-2xl font-medium py-2 hover:text-[#F89514] transition-colors'
			onClick={onClick}
		>
			{children}
		</Link>
	)
}

function MobileNavButton({
	href,
	icon,
	label,
}: {
	href: string
	icon: React.ReactNode
	label: string
}) {
	return (
		<Link
			href={href}
			className='flex flex-col items-center justify-center py-3 text-xs text-gray-600 hover:text-[#F89514] transition-colors'
		>
			<div className='h-6 w-6 mb-1'>{icon}</div>
			{label}
		</Link>
	)
}

// Иконки
function BurgerIcon({ isOpen }: { isOpen: boolean }) {
	return (
		<div className='relative w-7 h-7 flex items-center justify-center'>
			{/* Верхняя линия */}
			<span
				className={`absolute h-[3px] w-7 bg-[#F89514] rounded-full transition-all duration-300 ease-out
            ${
							isOpen
								? 'rotate-45 top-1/2 -translate-y-1/2'
								: 'top-1/4 -translate-y-1/2'
						}`}
				style={{
					transformOrigin: 'center',
				}}
			></span>

			{/* Центральная линия (исчезает) */}
			<span
				className={`absolute h-[3px] w-7 bg-[#F89514] rounded-full transition-all duration-200 ease-out
            top-1/2 -translate-y-1/2 ${
							isOpen ? 'opacity-0 scale-x-0' : 'opacity-100 scale-x-100'
						}`}
			></span>

			{/* Нижняя линия */}
			<span
				className={`absolute h-[3px] w-7 bg-[#F89514] rounded-full transition-all duration-300 ease-out
            ${
							isOpen
								? '-rotate-45 top-1/2 -translate-y-1/2'
								: 'bottom-1/4 translate-y-1/2'
						}`}
				style={{
					transformOrigin: 'center',
				}}
			></span>
		</div>
	)
}

function CloseIcon() {
	return (
		<svg
			className='w-6 h-6'
			fill='none'
			stroke='currentColor'
			viewBox='0 0 24 24'
		>
			<path
				strokeLinecap='round'
				strokeLinejoin='round'
				strokeWidth='2'
				d='M6 18L18 6M6 6l12 12'
			/>
		</svg>
	)
}

function HomeIcon() {
	return (
		<svg
			className='w-6 h-6'
			fill='none'
			stroke='currentColor'
			viewBox='0 0 24 24'
		>
			<path
				strokeLinecap='round'
				strokeLinejoin='round'
				strokeWidth='2'
				d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
			/>
		</svg>
	)
}

function CatalogIcon() {
	return (
		<svg
			className='w-6 h-6'
			fill='none'
			stroke='currentColor'
			viewBox='0 0 24 24'
		>
			<path
				strokeLinecap='round'
				strokeLinejoin='round'
				strokeWidth='2'
				d='M4 6h16M4 12h16M4 18h16'
			/>
		</svg>
	)
}

function SaleIcon() {
	return (
		<svg
			className='w-6 h-6'
			fill='none'
			stroke='currentColor'
			viewBox='0 0 24 24'
		>
			<path
				strokeLinecap='round'
				strokeLinejoin='round'
				strokeWidth='2'
				d='M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z'
			/>
		</svg>
	)
}

function LocationIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={`h-5 w-5 ${className || ''}`}
			fill='none'
			viewBox='0 0 24 24'
			stroke='currentColor'
		>
			<path
				strokeLinecap='round'
				strokeLinejoin='round'
				strokeWidth={2}
				d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
			/>
			<path
				strokeLinecap='round'
				strokeLinejoin='round'
				strokeWidth={2}
				d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
			/>
		</svg>
	)
}

function PhoneIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={`h-5 w-5 ${className || ''}`}
			fill='none'
			viewBox='0 0 24 24'
			stroke='currentColor'
		>
			<path
				strokeLinecap='round'
				strokeLinejoin='round'
				strokeWidth={2}
				d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
			/>
		</svg>
	)
}

function AccountIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={`h-5 w-5 ${className || ''}`}
			fill='none'
			viewBox='0 0 24 24'
			stroke='currentColor'
		>
			<path
				strokeLinecap='round'
				strokeLinejoin='round'
				strokeWidth={2}
				d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
			/>
		</svg>
	)
}

function HeartIcon() {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className='h-6 w-6'
			fill='none'
			viewBox='0 0 24 24'
			stroke='currentColor'
		>
			<path
				strokeLinecap='round'
				strokeLinejoin='round'
				strokeWidth={2}
				d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
			/>
		</svg>
	)
}

function CartIcon() {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className='h-6 w-6'
			fill='none'
			viewBox='0 0 24 24'
			stroke='currentColor'
		>
			<path
				strokeLinecap='round'
				strokeLinejoin='round'
				strokeWidth={2}
				d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z'
			/>
		</svg>
	)
}

function Logo() {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className='w-[90px] h-[65px]'
			viewBox='0 0 90 65'
			fill='none'
		>
			<g clipPath='url(#a)'>
				<path
					fill='#F89514'
					d='M51.12 26.041 39.77 0 10.12 65h23.983L51.12 26.041Z'
				/>
			</g>
			<path
				fill='#000'
				d='M6.078 34.385c.807 0 1.656.028 2.547.086.89.057 1.828.169 2.813.336v1.984a15.292 15.292 0 0 0-1.196-.281 22.847 22.847 0 0 0-1.39-.211 19.79 19.79 0 0 0-1.836-.133v10.11h-1.86v-10.11a19.79 19.79 0 0 0-1.836.133c-.541.068-1.005.138-1.39.21-.448.09-.847.183-1.196.282v-1.984a26.78 26.78 0 0 1 2.813-.336 40.018 40.018 0 0 1 2.531-.086Zm12.235 2.828c.437 0 .872.02 1.304.062.438.042.857.11 1.258.203.401.094.776.212 1.125.352.349.14.651.31.906.508.26.198.464.427.61.687a1.7 1.7 0 0 1 .218.86v4.047c0 .28-.073.539-.218.773a2.252 2.252 0 0 1-.61.633 4.115 4.115 0 0 1-.906.477 7.7 7.7 0 0 1-1.125.335c-.401.089-.82.154-1.258.196a12.233 12.233 0 0 1-2.61 0 10.458 10.458 0 0 1-1.25-.196 7.7 7.7 0 0 1-1.124-.335 4.366 4.366 0 0 1-.906-.477 2.345 2.345 0 0 1-.602-.625 1.45 1.45 0 0 1-.219-.781v-4.047c0-.318.073-.604.219-.86.146-.26.346-.49.602-.687.26-.198.562-.367.906-.508.349-.14.724-.258 1.125-.352a9.499 9.499 0 0 1 1.25-.203c.437-.041.872-.062 1.305-.062Zm-3.422 6.219c0 .24.099.448.296.625.204.171.467.317.79.437.322.115.687.2 1.093.258.412.057.826.086 1.242.086.438 0 .86-.031 1.266-.094a5.802 5.802 0 0 0 1.094-.266c.318-.12.57-.265.758-.437.192-.177.289-.38.289-.61v-3.25c0-.223-.097-.424-.29-.6a2.169 2.169 0 0 0-.757-.454 5.071 5.071 0 0 0-1.094-.281 7.69 7.69 0 0 0-1.265-.102c-.417 0-.831.031-1.243.094-.406.057-.77.146-1.093.265-.323.12-.586.271-.79.454a.814.814 0 0 0-.296.625v3.25Zm15.968-6.22c.438 0 .873.022 1.305.063.438.042.857.11 1.258.203.4.094.776.212 1.125.352.349.14.65.31.906.508.26.198.464.427.61.687.145.256.218.542.218.86v4.047c0 .28-.073.539-.218.773a2.254 2.254 0 0 1-.61.633 4.117 4.117 0 0 1-.906.477 7.7 7.7 0 0 1-1.125.335c-.401.089-.82.154-1.258.196a12.233 12.233 0 0 1-2.61 0 10.455 10.455 0 0 1-1.25-.196 7.694 7.694 0 0 1-1.124-.335 4.367 4.367 0 0 1-.907-.477 2.344 2.344 0 0 1-.601-.625 1.449 1.449 0 0 1-.219-.781v-4.047a1.7 1.7 0 0 1 .219-.86c.146-.26.346-.49.601-.687.26-.198.563-.367.907-.508.349-.14.724-.258 1.125-.352a9.496 9.496 0 0 1 1.25-.203c.437-.041.872-.062 1.304-.062Zm-3.422 6.22c0 .24.1.448.297.625.203.171.466.317.79.437.322.115.687.2 1.093.258a9.01 9.01 0 0 0 1.242.086c.438 0 .86-.031 1.266-.094a5.804 5.804 0 0 0 1.094-.266c.317-.12.57-.265.758-.437.192-.177.289-.38.289-.61v-3.25c0-.223-.097-.424-.29-.6a2.169 2.169 0 0 0-.757-.454 5.073 5.073 0 0 0-1.094-.281 7.69 7.69 0 0 0-1.266-.102c-.416 0-.83.031-1.242.094-.406.057-.77.146-1.094.265-.322.12-.585.271-.789.454a.814.814 0 0 0-.297.625v3.25Zm12.797 2.828h-1.78V34.525h1.78V46.26Zm8.172-11.907c.787 0 1.529.07 2.227.212.698.14 1.307.335 1.828.585.526.25.943.55 1.25.899.307.349.46.732.46 1.148v1.266h-2.03v-.672c0-.224-.086-.438-.258-.64-.172-.204-.42-.383-.742-.54a4.646 4.646 0 0 0-1.172-.367 7.845 7.845 0 0 0-1.563-.14c-.562 0-1.073.044-1.531.132a5.189 5.189 0 0 0-1.18.36c-.328.15-.58.33-.758.539a.981.981 0 0 0-.265.656v5.063c0 .229.088.447.266.656.177.203.43.383.757.539.328.15.722.27 1.18.36.458.088.969.132 1.531.132.584 0 1.104-.044 1.563-.133a4.843 4.843 0 0 0 1.172-.375c.323-.156.57-.336.742-.539.172-.203.258-.416.258-.64v-1.126c-.485 0-.92.014-1.305.04-.38.026-.706.052-.977.078-.317.036-.599.075-.843.117l.203-1.89a28.854 28.854 0 0 1 2.25-.095c.942 0 1.843.047 2.703.141v3.328c0 .417-.154.8-.461 1.149-.307.344-.724.64-1.25.89-.52.25-1.13.446-1.828.586-.698.136-1.44.203-2.227.203a11.68 11.68 0 0 1-2.226-.203 7.925 7.925 0 0 1-1.836-.586c-.521-.25-.935-.546-1.242-.89-.308-.35-.461-.732-.461-1.149v-6.25c0-.416.153-.8.46-1.148.308-.35.722-.649 1.243-.899a7.92 7.92 0 0 1 1.836-.585c.698-.141 1.44-.212 2.226-.212Zm14.969 3c0 .542-.018 1.107-.055 1.696a17.47 17.47 0 0 1-.21 1.804h-1.891c.047-.177.09-.37.133-.578.03-.177.06-.382.086-.617.03-.24.046-.492.046-.758a5.12 5.12 0 0 0-1.14.133 3.293 3.293 0 0 0-.742.266c-.198.099-.36.2-.485.304a3.241 3.241 0 0 1-.336.25v6.407h-2v-6.453a.945.945 0 0 0-.148-.422 1.289 1.289 0 0 0-.235-.282 1.246 1.246 0 0 0-.32-.218l.828-1.532a3 3 0 0 1 .57.274 3.7 3.7 0 0 1 .508.383c.183.15.344.338.485.562.265-.182.51-.336.734-.46.224-.13.44-.24.649-.329.213-.088.432-.156.656-.203.229-.052.479-.094.75-.125.276-.031.583-.052.922-.062.343-.016.742-.03 1.195-.04Zm10.828 5.72a2.9 2.9 0 0 0-.484-.337 3.414 3.414 0 0 0-.711-.289 6.057 6.057 0 0 0-1.008-.21 9.372 9.372 0 0 0-1.36-.087c-.463 0-.903.01-1.32.032a4.651 4.651 0 0 0-1.086.156c-.312.083-.56.219-.742.406-.182.188-.273.448-.273.781v1a21.028 21.028 0 0 0 3.36.25c.54 0 1.116-.018 1.726-.054a16.763 16.763 0 0 0 1.898-.242v-1.407Zm-3.516-5.72c.26 0 .576.014.946.04.37.026.755.072 1.156.14.401.063.797.151 1.188.266.395.11.75.255 1.062.437.318.177.573.391.766.641.192.25.289.544.289.883v6.047c-.438.088-.932.164-1.485.226-.474.057-1.039.11-1.695.157a31.09 31.09 0 0 1-2.195.07c-.802 0-1.656-.034-2.563-.102a30.778 30.778 0 0 1-2.828-.351v-2.813c0-.302.07-.565.211-.789.146-.23.344-.424.594-.586.25-.161.544-.294.883-.398a8.037 8.037 0 0 1 1.093-.25c.391-.063.797-.104 1.22-.125.421-.026.843-.04 1.265-.04.64 0 1.185.042 1.633.126.453.078.828.164 1.125.258.343.114.627.242.851.382v-1.265a.94.94 0 0 0-.156-.547 1.272 1.272 0 0 0-.422-.39 2.311 2.311 0 0 0-.61-.259 5.154 5.154 0 0 0-.718-.156 7.317 7.317 0 0 0-.766-.07c-.255-.01-.495-.016-.719-.016-.234 0-.484.008-.75.024a8.21 8.21 0 0 0-.796.07c-.26.036-.513.088-.758.156-.24.063-.453.149-.64.258-.188.11-.34.242-.454.398a.907.907 0 0 0-.164.547l-1.938-.5c0-.349.086-.65.258-.906.172-.26.399-.482.68-.664.287-.182.615-.33.984-.445.37-.12.753-.211 1.149-.274.4-.068.8-.114 1.195-.14.396-.026.766-.04 1.11-.04Zm12.735 0c.458 0 .937.053 1.437.157.506.104.995.24 1.47.406v-3.547h2.046V45.65a9.798 9.798 0 0 1-.992.235c-.38.073-.79.138-1.227.195-.437.052-.893.096-1.367.133-.469.031-.924.047-1.367.047a12.65 12.65 0 0 1-2.149-.164c-.63-.115-1.164-.29-1.601-.524-.438-.234-.771-.531-1-.89-.23-.36-.344-.787-.344-1.282v-3.187c0-.495.115-.922.344-1.281.229-.36.562-.657 1-.891.437-.234.971-.406 1.601-.516.63-.114 1.347-.172 2.149-.172Zm.562 7.454a7.744 7.744 0 0 0 1.266-.117c.208-.037.404-.079.586-.125a4.74 4.74 0 0 0 .492-.149V39.51a7.143 7.143 0 0 0-1.11-.422 4.209 4.209 0 0 0-1.234-.172c-.322 0-.638.008-.945.024a6.11 6.11 0 0 0-.852.085 3.79 3.79 0 0 0-.734.188 1.825 1.825 0 0 0-.578.32 1.42 1.42 0 0 0-.367.5 1.733 1.733 0 0 0-.133.711v2.297c0 .422.096.753.29.992.197.235.46.41.788.524a4.26 4.26 0 0 0 1.149.21c.437.027.898.04 1.382.04Z'
			/>
			<defs>
				<clipPath id='a'>
					<path fill='#fff' d='M10.12 0h41v65h-41z' />
				</clipPath>
			</defs>
		</svg>
	)
}
