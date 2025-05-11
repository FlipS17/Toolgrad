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

	const notify = (
		message: string,
		type: 'success' | 'error' | 'info' = 'info'
	) => {
		const id = uuidv4()
		setNotifications(prev => [...prev.slice(-2), { id, message, type }])
	}

	const handleClose = (id: string) => {
		setNotifications(prev => prev.filter(n => n.id !== id))
	}

	return (
		<NotificationContext.Provider value={{ notify }}>
			{children}
			<div className='fixed top-4 inset-x-0 flex flex-col items-center space-y-2 z-50 pointer-events-none'>
				<AnimatePresence>
					{notifications.map(n => (
						<Notification key={n.id} {...n} onClose={handleClose} />
					))}
				</AnimatePresence>
			</div>
		</NotificationContext.Provider>
	)
}
