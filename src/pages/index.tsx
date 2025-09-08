import { Inter } from 'next/font/google'
import JNFinancasSystem from '../components/JNFinancasSystem'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <main className={`${inter.className}`}>
      <JNFinancasSystem />
    </main>
  )
}
