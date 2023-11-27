import { Roboto } from 'next/font/google'
import { Login, Logout } from './(auth)/Login/Auth'
import './globals.css'

const roboto = Roboto({
  weight: ["100", "300", "400", "500", "700", "900"],
  style: ["normal", "italic"],
  subsets: ['latin'],
})

export const metadata = {
  title: 'Matodo',
  description: 'Generated by create next app',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body className={roboto.className}>
        {children}
        <Login />
        <Logout />
      </body>
    </html>
  )
}
