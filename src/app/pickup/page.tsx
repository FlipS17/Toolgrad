import { PrismaClient } from '@/../generated/prisma'
import PickupPage from './components/PickupPage'

const prisma = new PrismaClient()

export default async function PickupRoute() {
	const stores = await prisma.store.findMany({
		orderBy: { name: 'asc' },
	})

	return <PickupPage stores={stores} />
}
