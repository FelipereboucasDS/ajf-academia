import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const [email, setEmail] = useState('aluno@ajf.com')
  const [password, setPassword] = useState('securepassword123')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await signIn(email, password)
    if (error) {
      toast.error('Erro ao fazer login. Verifique suas credenciais.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 animate-fade-in">
      <Card className="w-full max-w-md border-border bg-card shadow-xl">
        <CardHeader className="space-y-4 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Shield className="w-10 h-10 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-3xl font-black uppercase tracking-tight">
              AJF Goleiros
            </CardTitle>
            <CardDescription className="text-md mt-1">
              Acesse sua conta para continuar
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="font-bold uppercase text-xs text-muted-foreground tracking-wider"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-background"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="font-bold uppercase text-xs text-muted-foreground tracking-wider"
                >
                  Senha
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 bg-background"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full h-12 font-bold text-lg" disabled={loading}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Entrar'}
            </Button>

            <div className="mt-8 p-4 bg-accent/50 rounded-lg border border-border/50 text-sm text-center text-muted-foreground flex flex-col gap-1.5">
              <p className="font-bold text-foreground uppercase tracking-wide text-xs mb-1">
                Contas de Demonstração
              </p>
              <div className="grid grid-cols-2 gap-2 text-left">
                <div
                  className="bg-background p-2 rounded border border-border/50 cursor-pointer hover:border-primary transition-colors"
                  onClick={() => setEmail('felipereboucas35@gmail.com')}
                >
                  <p className="font-bold text-xs">Admin</p>
                  <p className="text-[10px] truncate">felipereboucas35@gmail.com</p>
                </div>
                <div
                  className="bg-background p-2 rounded border border-border/50 cursor-pointer hover:border-primary transition-colors"
                  onClick={() => setEmail('aluno@ajf.com')}
                >
                  <p className="font-bold text-xs">Aluno</p>
                  <p className="text-[10px] truncate">aluno@ajf.com</p>
                </div>
                <div
                  className="bg-background p-2 rounded border border-border/50 cursor-pointer hover:border-primary transition-colors col-span-2 text-center"
                  onClick={() => setEmail('prof@ajf.com')}
                >
                  <p className="font-bold text-xs">Professor</p>
                  <p className="text-[10px] truncate">prof@ajf.com</p>
                </div>
              </div>
              <p className="text-xs mt-2">
                Senha para todas: <strong className="text-foreground">securepassword123</strong>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
