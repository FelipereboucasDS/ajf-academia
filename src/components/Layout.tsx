import { useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import {
  Shield,
  Home,
  Calendar as CalendarIcon,
  List,
  DollarSign,
  User,
  Users,
  MapPin,
  Settings,
  Bell,
  LogOut,
} from 'lucide-react'
import useMainStore from '@/stores/useMainStore'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/use-auth'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'

export default function Layout() {
  const { user, signOut, loading: authLoading } = useAuth()
  const { currentUser, initStore, loading: storeLoading, setCurrentUser } = useMainStore()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      initStore(user.id)
    } else {
      setCurrentUser({} as any)
    }
  }, [user, initStore, setCurrentUser])

  useEffect(() => {
    if (
      user &&
      currentUser.id &&
      (location.pathname === '/cadastro' || location.pathname === '/login')
    ) {
      navigate('/agendar', { replace: true })
    }
  }, [user, currentUser.id, location.pathname, navigate])

  if (authLoading || (user && storeLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <p className="font-bold uppercase tracking-widest text-muted-foreground text-sm">
            Carregando...
          </p>
        </div>
      </div>
    )
  }

  if (!user || !currentUser.id) {
    if (location.pathname === '/cadastro') {
      return <RegisterPage />
    }
    return <LoginPage />
  }

  const navItems = {
    student: [
      { title: 'Início', url: '/', icon: Home },
      { title: 'Agendar', url: '/agendar', icon: CalendarIcon },
      { title: 'Meus Treinos', url: '/meus-treinos', icon: List },
      { title: 'Financeiro', url: '/financeiro', icon: DollarSign },
    ],
    teacher: [
      { title: 'Início', url: '/', icon: Home },
      { title: 'Presença', url: '/presenca', icon: CalendarIcon },
    ],
    admin: [
      { title: 'Início', url: '/', icon: Home },
      { title: 'Alunos', url: '/alunos', icon: Users },
      { title: 'Unidades', url: '/unidades', icon: MapPin },
      { title: 'Financeiro', url: '/financeiro', icon: DollarSign },
      { title: 'Configurações', url: '/configuracoes', icon: Settings },
    ],
  }

  const items = navItems[currentUser.role] || []

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <Sidebar variant="sidebar" className="border-r border-border bg-card">
          <SidebarHeader className="p-4 flex items-center justify-center border-b border-border">
            <Link to="/" className="flex flex-col items-center gap-2 group">
              <div className="p-2 bg-primary rounded-xl group-hover:scale-105 transition-transform duration-300">
                <Shield className="w-8 h-8 text-primary-foreground" />
              </div>
              <span className="font-display font-black tracking-widest text-xl">AJF</span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="p-4">
            <SidebarMenu>
              {items.map((item) => {
                const isActive = location.pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className="hover:bg-accent hover:text-accent-foreground transition-colors py-6"
                    >
                      <Link to={item.url} className="flex items-center gap-3">
                        <item.icon
                          className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                        />
                        <span
                          className={`font-semibold ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}
                        >
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-background/80 backdrop-blur-md sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-xl font-bold hidden sm:block uppercase tracking-wide text-foreground/90">
                {items.find((i) => i.url === location.pathname)?.title || 'AJF Goleiros'}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="relative text-muted-foreground hover:text-foreground"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-pulse"></span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                      <AvatarFallback className="bg-accent text-accent-foreground font-bold">
                        {currentUser.name ? currentUser.name.charAt(0) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem asChild>
                    <Link to="/perfil" className="cursor-pointer flex items-center w-full">
                      <User className="mr-2 h-4 w-4" />
                      <span>Meu Perfil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive cursor-pointer"
                    onClick={() => {
                      signOut()
                      setCurrentUser({} as any)
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <div className="p-6 flex-1 overflow-auto animate-fade-in-up">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
