import './globals.css'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'ChronoTrack',
  description: 'Time tracking made simple',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-neutral-200 dark:border-neutral-800">
          <div className="mx-auto max-w-5xl px-4 py-4 flex items-center gap-4">
            <Link href="/projects" className="font-semibold text-lg">
              ChronoTrack
            </Link>
            <nav className="ml-auto flex items-center gap-4 text-sm">
              <Link href="/projects">Projects</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      </body>
    </html>
  )
}
