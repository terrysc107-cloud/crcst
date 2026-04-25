import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="text-muted-foreground">The page you are looking for does not exist.</p>
      <Link href="/" className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90">
        Go home
      </Link>
    </div>
  )
}
