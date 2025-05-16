'use client'

import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FaShoppingBag, FaSignOutAlt, FaStar, FaUser } from 'react-icons/fa'

const links = [
	{ href: '/account/profile', label: 'Информация', icon: <FaUser /> },
	{ href: '/account/orders', label: 'Заказы', icon: <FaShoppingBag /> },
	{ href: '/account/reviews', label: 'Отзывы', icon: <FaStar /> },
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
				<aside className='w-full lg:w-72 bg-white shadow-md p-6 rounded-xl flex flex-col justify-between min-h-[300px] lg:min-h-[600px]'>
					<div>
						<h2 className='text-xl font-bold mb-6'>Личный кабинет</h2>
						<nav className='space-y-2'>
							{links.map(link => {
								const isActive = pathname.startsWith(link.href)
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

					<button
						onClick={() => signOut({ callbackUrl: '/' })}
						className='mt-6 flex cursor-pointer items-center gap-2 w-full px-3 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors'
					>
						<FaSignOutAlt />
						<span>Выйти</span>
					</button>
				</aside>

				<main className='flex-1'>{children}</main>
			</div>
		</div>
	)
}
