import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Shield, Loader2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { Link, useNavigate } from 'react-router-dom'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error, data } = await signUp(email, password, { name, date_of_birth: dateOfBirth })

    if (error) {
      if (error.message.toLowerCase().includes('already registered')) {
        toast.error('Este email já está cadastrado. Tente fazer login ou redefinir a senha.')
      } else {
        toast.error(error.message || 'Erro ao criar conta. Verifique os dados e tente novamente.')
      }
      setLoading(false)
    } else {
      if (data?.session) {
        toast.success('Conta criada com sucesso!')
        navigate('/agendar')
      } else {
        toast.success('Conta criada! Verifique seu email para confirmar o cadastro.')
        navigate('/')
      }
    }
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
              Novo Goleiro
            </CardTitle>
            <CardDescription className="text-md mt-1">
              Preencha seus dados para se cadastrar na AJF
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="font-bold uppercase text-xs text-muted-foreground tracking-wider"
              >
                Nome Completo
              </Label>
              <Input
                id="name"
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 bg-background"
                required
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="dob"
                className="font-bold uppercase text-xs text-muted-foreground tracking-wider"
              >
                Data de Nascimento
              </Label>
              <Input
                id="dob"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="h-12 bg-background text-foreground"
                required
              />
            </div>

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
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 bg-background"
                required
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full h-12 font-bold text-lg mt-6" disabled={loading}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Concluir Cadastro'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-border pt-6">
          <Link
            to="/"
            className="flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para o Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
