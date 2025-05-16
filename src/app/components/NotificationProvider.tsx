'use client'

import { AnimatePresence } from 'framer-motion'
import { createContext, ReactNode, useContext, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import Notification from './Notification'

interface NotificationItem {
	id: string
	message: string
	type?: 'success' | 'error' | 'info'
}

interface NotificationContextType {
	notify: (message: string, type?: 'success' | 'error' | 'info') => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(
	undefined
)

export const useNotification = () => {
	const context = useContext(NotificationContext)
	if (!context)
		throw new Error('useNotification must be used within NotificationProvider')
	return context
}

export function NotificationProvider({ children }: { children: ReactNode }) {
	const [notifications, setNotifications] = useState<NotificationItem[]>([])

	const MAX_NOTIFICATIONS = 3

	const notify = (
		message: string,
		type: 'success' | 'error' | 'info' = 'info'
	) => {
		const id = uuidv4()
		const newNotification = { id, message, type }

		setNotifications(prev => {
			if (prev.length >= MAX_NOTIFICATIONS) {
				return [...prev.slice(1), newNotification]
			}
			return [...prev, newNotification]
		})
	}

	const handleClose = (id: string) => {
		setNotifications(prev => prev.filter(n => n.id !== id))
	}

	return (
		<NotificationContext.Provider value={{ notify }}>
			{children}
			<div className='fixed top-4 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none w-full max-w-md h-[220px]'>
				<AnimatePresence initial={false}>
					{notifications.map((n, index) => (
						<div
							key={n.id}
							style={{ top: `${index * 50}px` }}
							className='absolute w-full'
						>
							<Notification {...n} onClose={handleClose} />
						</div>
					))}
				</AnimatePresence>
			</div>
		</NotificationContext.Provider>
	)
}
