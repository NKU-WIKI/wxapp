"use client"

import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, MoreHorizontal, CheckSquare } from "lucide-react"

export default function NotificationPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white border-b shadow-sm">
        <Link href="/home" className="text-gray-600">
          <ArrowLeft className="w-6 h-6" />
          <span className="sr-only">Back</span>
        </Link>
        <h1 className="text-lg font-semibold text-gray-800">消息通知</h1>
        <Button variant="ghost" size="icon" className="text-gray-600">
          <MoreHorizontal className="w-6 h-6" />
          <span className="sr-only">More options</span>
        </Button>
      </header>

      <div className="flex-1 p-4 space-y-4">
        <Tabs defaultValue="likes" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100 rounded-full p-1 h-auto">
            <TabsTrigger
              value="likes"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-full text-gray-700 py-2"
            >
              点赞
            </TabsTrigger>
            <TabsTrigger
              value="collections"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-full text-gray-700 py-2"
            >
              收藏
            </TabsTrigger>
            <TabsTrigger
              value="comments"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-full text-gray-700 py-2"
            >
              评论
            </TabsTrigger>
          </TabsList>
          <TabsContent value="likes" className="mt-4 space-y-3">
            {/* Sample Like Notification 1 */}
            <div className="bg-white rounded-lg shadow-sm p-4 flex items-start space-x-3">
              <div className="relative">
                <Avatar className="w-10 h-10 border">
                  <AvatarImage src="/placeholder-user.jpg" alt="User Avatar" />
                  <AvatarFallback>陈</AvatarFallback>
                </Avatar>
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold text-gray-900">陈小雨</span> 赞了你的帖子
                </p>
                <p className="text-xs text-gray-500">在「分享一下今天的穿搭」这条帖子</p>
                <span className="text-xs text-gray-500">10 分钟前</span>
              </div>
            </div>
            {/* Sample Like Notification 2 */}
            <div className="bg-white rounded-lg shadow-sm p-4 flex items-start space-x-3">
              <Avatar className="w-10 h-10 border">
                <AvatarImage src="/placeholder-user.jpg" alt="User Avatar" />
                <AvatarFallback>张</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold text-gray-900">张小北</span> 赞了你的帖子
                </p>
                <p className="text-xs text-gray-500">在「分享下午茶时光」这条帖子</p>
                <span className="text-xs text-gray-500">2 天前</span>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="collections" className="mt-4 space-y-3">
            {/* Content for Collections tab */}
            <div className="bg-white rounded-lg shadow-sm p-4 text-center text-gray-500">暂无收藏通知</div>
          </TabsContent>
          <TabsContent value="comments" className="mt-4 space-y-3">
            {/* Content for Comments tab */}
            <div className="bg-white rounded-lg shadow-sm p-4 text-center text-gray-500">暂无评论通知</div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Mark All As Read Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t shadow-md">
        <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-full flex items-center justify-center space-x-2">
          <CheckSquare className="w-5 h-5" />
          <span>全部标记为已读</span>
        </Button>
      </div>
    </div>
  )
}
