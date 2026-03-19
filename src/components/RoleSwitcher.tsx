import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import useMainStore from '@/stores/useMainStore'

export function RoleSwitcher() {
  const { currentUser, users, setCurrentUser } = useMainStore()

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-background border border-border p-2 rounded-lg shadow-glow-white">
      <div className="text-xs text-muted-foreground mb-1 uppercase font-bold tracking-wider">
        Modo Dev
      </div>
      <Select
        value={currentUser.id}
        onValueChange={(val) => {
          const user = users.find((u) => u.id === val)
          if (user) setCurrentUser(user)
        }}
      >
        <SelectTrigger className="w-[180px] h-8 text-xs">
          <SelectValue placeholder="Selecione o papel" />
        </SelectTrigger>
        <SelectContent>
          {users.map((u) => (
            <SelectItem key={u.id} value={u.id}>
              {u.name} ({u.role})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
