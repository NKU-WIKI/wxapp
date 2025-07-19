import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings, FileText, History, MessageSquare, Info, LogOut, ChevronRight, Award } from "lucide-react" // Added Award icon

export default function ProfilePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-center p-4 bg-white border-b shadow-sm">
        <h1 className="text-lg font-semibold text-gray-800">个人中心</h1>
      </header>

      {/* Profile Summary */}
      <div className="p-4 bg-white border-b shadow-sm space-y-4">
        <div className="flex items-center space-x-4">
          <Avatar className="w-20 h-20 border-2 border-purple-600">
            <AvatarImage src="/placeholder-user.jpg" alt="User Avatar" />
            <AvatarFallback>北</AvatarFallback>
          </Avatar>
          <div className="flex-1 flex flex-col">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-gray-900">北极熊</span>
              <Badge className="bg-purple-500 text-white text-sm px-2 py-0.5 rounded-full">Lv3</Badge>
              <Link href="/level" className="text-purple-600 text-sm flex items-center space-x-1">
                {" "}
                {/* Link to My Level page */}
                <Award className="w-4 h-4" />
                <span>我的等级</span>
              </Link>
            </div>
            <p className="text-sm text-gray-600">卷又卷不动，躺又躺不平</p>
            <p className="text-sm text-gray-500">南开大学</p>
          </div>
          <Link href="/edit-profile">
            <Button
              variant="outline"
              className="rounded-full text-purple-600 border-purple-600 hover:bg-purple-50 bg-transparent h-8 px-4 text-sm"
            >
              编辑资料
            </Button>
          </Link>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-gray-900">238</span>
            <span className="text-sm text-gray-600">帖子</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-gray-900">1,459</span>
            <span className="text-sm text-gray-600">获赞</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-gray-900">328</span>
            <span className="text-sm text-gray-600">关注</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-gray-900">892</span>
            <span className="text-sm text-gray-600">粉丝</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-gray-900">156</span>
            <span className="text-sm text-gray-600">收藏</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-gray-900">2,360</span>
            <span className="text-sm text-gray-600">积分</span>
          </div>
        </div>
      </div>

      {/* Application Settings */}
      <div className="flex-1 p-4 space-y-2">
        <h2 className="text-base font-semibold text-gray-900 mb-2">应用设置</h2>
        <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-100">
          <Link href="#" className="flex items-center justify-between p-4 hover:bg-gray-50">
            <div className="flex items-center space-x-3">
              <Settings className="w-5 h-5 text-gray-600" />
              <span className="text-base text-gray-800">设置</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>
          <Link href="#" className="flex items-center justify-between p-4 hover:bg-gray-50">
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-gray-600" />
              <span className="text-base text-gray-800">草稿箱</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>
          <Link href="#" className="flex items-center justify-between p-4 hover:bg-gray-50">
            <div className="flex items-center space-x-3">
              <History className="w-5 h-5 text-gray-600" />
              <span className="text-base text-gray-800">浏览历史</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>
          <Link href="#" className="flex items-center justify-between p-4 hover:bg-gray-50">
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-5 h-5 text-gray-600" />
              <span className="text-base text-gray-800">意见反馈</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>
          <Link href="#" className="flex items-center justify-between p-4 hover:bg-gray-50">
            <div className="flex items-center space-x-3">
              <Info className="w-5 h-5 text-gray-600" />
              <span className="text-base text-gray-800">关于我们</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-500 text-sm">
              <span>版本 0.1.0</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </Link>
          <Link href="#" className="flex items-center justify-between p-4 hover:bg-gray-50">
            <div className="flex items-center space-x-3">
              <LogOut className="w-5 h-5 text-gray-600" />
              <span className="text-base text-gray-800">退出登录</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>
        </div>
      </div>
    </div>
  )
}
