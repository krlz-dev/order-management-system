import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/useAppStore'
import { Menu, Bell, User, Search, LogOut } from 'lucide-react'

interface HeaderProps {
  onMenuClick: () => void
  title: string
}

export function Header({ onMenuClick, title }: HeaderProps) {
  const { user, logout } = useAppStore()

  const handleLogout = () => {
    logout()
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden hover:bg-gray-100"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-2 min-w-[300px]">
          <Search className="h-4 w-4 text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search orders, customers..."
            className="bg-transparent border-none outline-none flex-1 text-sm text-gray-700 placeholder-gray-500"
          />
        </div>
        
        <Button variant="ghost" size="icon" className="relative hover:bg-gray-100">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
        </Button>
        
        {user && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">{user.name}</span>
          </div>
        )}
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleLogout}
          className="hover:bg-red-50 hover:text-red-600"
          title="Logout"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}