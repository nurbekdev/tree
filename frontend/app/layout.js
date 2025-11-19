import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata = {
  title: 'Daraxt Monitoring Tizimi',
  description: 'Smart Agricultural Tree Monitoring System',
}

export default function RootLayout({ children }) {
  return (
    <html lang="uz">
      <body>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}

