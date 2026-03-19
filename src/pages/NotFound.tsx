import { useLocation, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ShieldAlert } from 'lucide-react'

const NotFound = () => {
  const location = useLocation()

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname)
  }, [location.pathname])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
      <ShieldAlert className="w-24 h-24 text-destructive mb-6" />
      <h1 className="text-6xl font-black uppercase tracking-tighter mb-4">404</h1>
      <p className="text-xl text-muted-foreground mb-8 uppercase font-medium tracking-wide">
        Página não encontrada
      </p>
      <Button asChild size="lg" className="font-bold">
        <Link to="/">Voltar ao Início</Link>
      </Button>
    </div>
  )
}

export default NotFound
