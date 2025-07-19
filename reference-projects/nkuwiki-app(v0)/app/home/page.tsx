import Image from "next/image"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Bell, MessageSquare, Search, Heart, Star, Plus } from "lucide-react" // Added Plus icon

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white border-b shadow-sm">
        <div className="flex items-center flex-1 space-x-2">
          <Search className="w-5 h-5 text-gray-500" />
          <Input
            placeholder="搜索校园知识"
            className="flex-1 border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
          />
        </div>
        <div className="flex items-center space-x-4 ml-4">
          <Link href="/notification">
            <Bell className="w-6 h-6 text-gray-600" />
            <span className="sr-only">Notifications</span>
          </Link>
          <Link href="/notification">
            <MessageSquare className="w-6 h-6 text-gray-600" />
            <span className="sr-only">Messages</span>
          </Link>
          <h1 className="text-lg font-bold text-purple-600">TikuWiki</h1>
        </div>
      </header>

      {/* Categories Navigation */}
      <div className="flex overflow-x-auto py-3 px-4 bg-white border-b scrollbar-hide">
        <div className="flex space-x-4 whitespace-nowrap">
          <Button variant="ghost" className="flex flex-col items-center text-gray-700 hover:text-purple-600">
            <Image
              src="/placeholder.svg?height=32&width=32"
              width={32}
              height={32}
              alt="学习交流 icon"
              className="mb-1"
            />
            <span className="text-xs">学习交流</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center text-gray-700 hover:text-purple-600">
            <Image
              src="/placeholder.svg?height=32&width=32"
              width={32}
              height={32}
              alt="校园生活 icon"
              className="mb-1"
            />
            <span className="text-xs">校园生活</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center text-gray-700 hover:text-purple-600">
            <Image
              src="/placeholder.svg?height=32&width=32"
              width={32}
              height={32}
              alt="就业创业 icon"
              className="mb-1"
            />
            <span className="text-xs">就业创业</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center text-gray-700 hover:text-purple-600">
            <Image
              src="/placeholder.svg?height=32&width=32"
              width={32}
              height={32}
              alt="社团活动 icon"
              className="mb-1"
            />
            <span className="text-xs">社团活动</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center text-gray-700 hover:text-purple-600">
            <Image
              src="/placeholder.svg?height=32&width=32"
              width={32}
              height={32}
              alt="失物招领 icon"
              className="mb-1"
            />
            <span className="text-xs">失物招领</span>
          </Button>
        </div>
      </div>

      {/* Post List */}
      <div className="flex-1 p-4 space-y-4">
        {/* Sample Post 1 */}
        <div className="bg-white rounded-lg shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10 border">
                <AvatarImage src="/placeholder-user.jpg" alt="User Avatar" />
                <AvatarFallback>陈</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <div className="flex items-center space-x-1">
                  <span className="font-semibold text-gray-900">陈同学</span>
                  <Badge className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">Lv3</Badge>
                </div>
                <span className="text-xs text-gray-500">2分钟前</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="rounded-full text-purple-600 border-purple-600 hover:bg-purple-50 bg-transparent h-7 px-3 text-xs"
              >
                关注
              </Button>
              <Badge className="bg-green-100 text-green-600 text-xs px-2 py-0.5 rounded-full">New</Badge>
            </div>
          </div>
          <Link href="/post-detail" className="block">
            <h3 className="text-lg font-semibold text-gray-900">关于期末考试复习资料的分享</h3>
            <p className="text-gray-700 text-sm leading-relaxed line-clamp-2">
              整理了一份计算机网络的期末复习资料，包含历年真题和重点知识点总结，需要的同学可以私信我。
            </p>
            <Image
              src="/placeholder.svg?height=200&width=400"
              width={400}
              height={200}
              alt="Post image"
              className="object-cover w-full h-48 rounded-lg mt-3"
            />
          </Link>
          <div className="flex items-center justify-between text-gray-500 text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Heart className="w-4 h-4" />
                <span>28</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageSquare className="w-4 h-4" />
                <span>12</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4" />
                <span>15</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-purple-600">
              <MessageSquare className="w-5 h-5" />
              <span className="sr-only">Chat</span>
            </Button>
          </div>
        </div>

        {/* Sample Post 2 */}
        <div className="bg-white rounded-lg shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10 border">
                <AvatarImage src="/placeholder-user.jpg" alt="User Avatar" />
                <AvatarFallback>王</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <div className="flex items-center space-x-1">
                  <span className="font-semibold text-gray-900">王教授</span>
                  <Badge className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">Lv3</Badge>
                </div>
                <span className="text-xs text-gray-500">5分钟前</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="rounded-full text-purple-600 border-purple-600 hover:bg-purple-50 bg-transparent h-7 px-3 text-xs"
              >
                关注
              </Button>
              <Badge className="bg-green-100 text-green-600 text-xs px-2 py-0.5 rounded-full">New</Badge>
              <Badge className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">Hot</Badge>
            </div>
          </div>
          <Link href="/post-detail" className="block">
            <h3 className="text-lg font-semibold text-gray-900">开放实验室通知</h3>
            <p className="text-gray-700 text-sm leading-relaxed line-clamp-2">
              下周二起，创新实验室将开放给所有计算机系的学生使用，请提前预约时间段。
            </p>
          </Link>
          <div className="flex items-center justify-between text-gray-500 text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Heart className="w-4 h-4" />
                <span>28</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageSquare className="w-4 h-4" />
                <span>12</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4" />
                <span>15</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-purple-600">
              <MessageSquare className="w-5 h-5" />
              <span className="sr-only">Chat</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <Link href="/publish" className="fixed bottom-20 right-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          className="w-14 h-14 rounded-full bg-purple-600 text-white shadow-lg hover:bg-purple-700"
        >
          <Plus className="w-8 h-8" />
          <span className="sr-only">发布</span>
        </Button>
      </Link>
    </div>
  )
}
