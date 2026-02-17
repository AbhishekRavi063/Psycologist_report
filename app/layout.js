import './globals.css'
import LoadingScreen from '@/components/LoadingScreen'

export const metadata = {
  title: 'Psychologist Record Management',
  description: 'Manage client records and sessions',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen antialiased">
        {children}
        <LoadingScreen />
      </body>
    </html>
  )
}
