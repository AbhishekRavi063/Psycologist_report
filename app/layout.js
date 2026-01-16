import './globals.css'

export const metadata = {
  title: 'Psychologist Record Management',
  description: 'Manage client records and sessions',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
