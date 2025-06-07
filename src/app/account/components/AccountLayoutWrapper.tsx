'use client'
import { Truck } from 'lucide-react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FaShoppingBag, FaSignOutAlt, FaUser } from 'react-icons/fa'

// Массив ссылок для личного кабинета
const links = [
	{ href: '/account/profile', label: 'Информация', icon: <FaUser /> },
	{ href: '/account/delivery', label: 'Доставка', icon: <Truck /> },
	{ href: '/account/orders', label: 'Мои заказы', icon: <FaShoppingBag /> },
]

export default function AccountLayoutWrapper({
	children,
}: {
	children: React.ReactNode
}) {
	const pathname = usePathname()

	return (
		<div className='min-h-screen bg-gray-50 p-4'>
			<div className='container mx-auto flex flex-col lg:flex-row gap-6'>
				<aside className='w-full lg:w-72 bg-white shadow-md p-6 rounded-xl flex flex-col justify-between h-full lg:sticky lg:top-32 lg:self-start'>
					<div>
						<h2 className='text-xl font-bold mb-6'>Личный кабинет</h2>
						<nav className='space-y-2'>
							{/* Генерация ссылок */}
							{links.map(link => {
								const isActive = pathname.startsWith(link.href) // Проверка, активна ли ссылка
								return (
									<Link
										key={link.href}
										href={link.href}
										className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors duration-200 ${
											isActive
												? 'bg-[#F89514] text-white font-semibold border-[#F89514]'
												: 'bg-white text-gray-700 hover:text-[#F89514] hover:border-[#F89514] border-gray-200'
										}`}
									>
										<span className='text-base'>{link.icon}</span>
										<span>{link.label}</span>
									</Link>
								)
							})}
						</nav>
					</div>

					{/* Кнопка выхода из аккаунта */}
					<button
						onClick={() => signOut({ callbackUrl: '/' })}
						className='mt-10 flex cursor-pointer items-center gap-2 w-full px-3 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors'
					>
						<FaSignOutAlt />
						<span>Выйти</span>
					</button>
				</aside>

				{/* Основной контент, переданный через пропс */}
				<main className='flex-1'>{children}</main>
			</div>
		</div>
	)
}
