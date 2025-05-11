'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { useEffect } from 'react'

interface NotificationProps {
	id: string
	message: string
	type?: 'success' | 'error' | 'info'
	onClose: (id: string) => void
}

const icons = {
	success: <CheckCircle className='w-5 h-5 text-white' />,
	error: <AlertTriangle className='w-5 h-5 text-white' />,
	info: <Info className='w-5 h-5 text-white' />,
}

const bgColors = {
	success: 'bg-green-500',
	error: 'bg-red-500',
	info: 'bg-blue-500',
}

export default function Notification({
	id,
	message,
	type = 'info',
	onClose,
}: NotificationProps) {
	useEffect(() => {
		const timer = setTimeout(() => onClose(id), 4000)
		return () => clearTimeout(timer)
	}, [id, onClose])

	return (
		<motion.div
			initial={{ opacity: 0, y: -20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -20 }}
			className={`w-full max-w-md mx-auto rounded-xl px-4 py-3 text-white shadow-lg flex items-center gap-3 ${bgColors[type]}`}
		>
			{icons[type]}
			<span className='text-sm font-medium'>{message}</span>
		</motion.div>
	)
}
