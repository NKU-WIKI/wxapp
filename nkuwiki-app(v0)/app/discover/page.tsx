import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Bell, MessageSquare } from "lucide-react"

export default function DiscoverPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white border-b shadow-sm">
        <h1 className="text-lg font-semibold text-gray-800 flex-1 text-center">发现</h1>
        <div className="flex items-center space-x-4">
          <Link href="/notification">
            <Bell className="w-6 h-6 text-gray-600" />
            <span className="sr-only">Notifications</span>
          </Link>
          <Link href="/notification">
            <MessageSquare className="w-6 h-6 text-gray-600" />
            <span className="sr-only">Messages</span>
          </Link>
        </div>
      </header>

      <div className="flex-1 p-4 space-y-6">
        {/* Campus Hotspots */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">
            校园热点 <span className="text-sm font-normal text-gray-500">实时更新</span>
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <Image
                src="/placeholder.svg?height=150&width=200"
                width={200}
                height={150}
                alt="期末复习攻略分享"
                className="object-cover w-full h-32"
              />
              <div className="p-3">
                <p className="text-sm font-medium text-gray-800 line-clamp-2">期末复习攻略分享</p>
                <span className="text-xs text-gray-500">2.3K 讨论</span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <Image
                src="/placeholder.svg?height=150&width=200"
                width={200}
                height={150}
                alt="校园美食探店"
                className="object-cover w-full h-32"
              />
              <div className="p-3">
                <p className="text-sm font-medium text-gray-800 line-clamp-2">校园美食探店</p>
                <span className="text-xs text-gray-500">1.8K 讨论</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Assistant */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">AI 助手</h2>
            <Link href="#" className="text-sm text-purple-600 hover:underline">
              查看更多
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant="ghost"
              className="flex flex-col items-center justify-center p-3 bg-purple-50 rounded-lg h-24"
            >
              <Image
                src="/placeholder.svg?height=40&width=40"
                width={40}
                height={40}
                alt="作业助手 icon"
                className="mb-2"
              />
              <span className="text-sm text-gray-800">作业助手</span>
            </Button>
            <Button
              variant="ghost"
              className="flex flex-col items-center justify-center p-3 bg-purple-50 rounded-lg h-24"
            >
              <Image
                src="/placeholder.svg?height=40&width=40"
                width={40}
                height={40}
                alt="英语口语 icon"
                className="mb-2"
              />
              <span className="text-sm text-gray-800">英语口语</span>
            </Button>
            <Button
              variant="ghost"
              className="flex flex-col items-center justify-center p-3 bg-purple-50 rounded-lg h-24"
            >
              <Image
                src="/placeholder.svg?height=40&width=40"
                width={40}
                height={40}
                alt="保研规划 icon"
                className="mb-2"
              />
              <span className="text-sm text-gray-800">保研规划</span>
            </Button>
          </div>
        </div>

        {/* Campus Activities */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">校园活动</h2>
            <Link href="#" className="text-sm text-purple-600 hover:underline">
              全部活动
            </Link>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 flex items-center space-x-4">
            <Image
              src="/placeholder.svg?height=80&width=80"
              width={80}
              height={80}
              alt="校园音乐节"
              className="object-cover rounded-lg"
            />
            <div className="flex-1 space-y-1">
              <h3 className="text-base font-semibold text-gray-900">校园音乐节</h3>
              <p className="text-sm text-gray-700">时间：2024-01-20 19:00</p>
              <p className="text-sm text-gray-700">地点：大学生活动中心</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
