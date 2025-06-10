import Sidebar from '@/app/admin/components/SideBar'

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<div className='flex h-screen'>
			<Sidebar />
			<main className='flex-1 overflow-y-auto p-4'>{children}</main>
		</div>
	)
}
