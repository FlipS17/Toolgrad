import AccountLayoutWrapper from '../components/AccountLayoutWrapper'

export default function Layout({ children }: { children: React.ReactNode }) {
	return <AccountLayoutWrapper>{children}</AccountLayoutWrapper>
}
