import Link from "next/link"
import { Home, Search, MessageSquare, User } from "lucide-react" // Removed Plus icon

export default function BottomNavigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg flex items-center justify-around h-16 z-50">
      <Link href="/home" className="flex flex-col items-center text-gray-500 hover:text-purple-600">
        <Home className="w-6 h-6" />
        <span className="text-xs mt-1">首页</span>
      </Link>
      <Link href="/explore" className="flex flex-col items-center text-gray-500 hover:text-purple-600">
        <Search className="w-6 h-6" />
        <span className="text-xs mt-1">探索</span>
      </Link>
      {/* Removed the central Plus button */}
      <Link href="/discover" className="flex flex-col items-center text-gray-500 hover:text-purple-600">
        <MessageSquare className="w-6 h-6" />
        <span className="text-xs mt-1">发现</span>
      </Link>
      <Link href="/profile" className="flex flex-col items-center text-gray-500 hover:text-purple-600">
        <User className="w-6 h-6" />
        <span className="text-xs mt-1">我的</span>
      </Link>
    </nav>
  )
}
