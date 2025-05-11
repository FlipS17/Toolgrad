'use client'

import { X } from 'lucide-react'
import { useEffect } from 'react'
import { Brand } from '../../../../generated/prisma'
import CatalogFilters from './CatalogFilters'

interface MobileFiltersProps {
	isOpen: boolean
	onClose: () => void
	brands: Brand[]
}

const MobileFilters = ({ isOpen, onClose, brands }: MobileFiltersProps) => {
	useEffect(() => {
		if (isOpen) {
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
	}, [isOpen])

	if (!isOpen) return null

	return (
		<div className='fixed inset-0 z-50 bg-white p-4 overflow-y-auto'>
			<div className='flex justify-between items-center mb-4'>
				<h2 className='text-lg font-semibold'>Фильтры</h2>
				<button onClick={onClose}>
					<X />
				</button>
			</div>
			<CatalogFilters brands={brands} isMobile={true} onClose={onClose} />
		</div>
	)
}

export default MobileFilters
