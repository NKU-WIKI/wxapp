import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Camera, ChevronRight } from "lucide-react"

export default function EditProfilePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white border-b shadow-sm">
        <Link href="/profile" className="text-gray-600">
          <ArrowLeft className="w-6 h-6" />
          <span className="sr-only">Back</span>
        </Link>
        <h1 className="text-lg font-semibold text-gray-800">编辑资料</h1>
        <Button variant="link" className="text-purple-600 font-semibold">
          保存
        </Button>
      </header>

      <div className="flex-1 p-4 space-y-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center space-y-2 py-4">
          <div className="relative w-24 h-24">
            <Avatar className="w-24 h-24 border-2 border-gray-200">
              <AvatarImage src="/placeholder-user.jpg" alt="User Avatar" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0 bg-purple-600 rounded-full p-2 text-white">
              <Camera className="w-5 h-5" />
              <span className="sr-only">Change Avatar</span>
            </div>
          </div>
          <span className="text-sm text-gray-600">点击更换头像</span>
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-100">
          <h2 className="text-base font-semibold text-gray-900 p-4">基本信息</h2>
          <div className="flex items-center justify-between p-4">
            <span className="text-base text-gray-800">昵称</span>
            <Input
              defaultValue="陈小明"
              className="text-right border-none focus-visible:ring-0 focus-visible:ring-offset-0 w-auto"
            />
          </div>
          <div className="flex items-center justify-between p-4">
            <span className="text-base text-gray-800">生日</span>
            <div className="flex items-center space-x-2 text-gray-600">
              <span>1995 年 8 月 16 日</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Social Accounts */}
        <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-100">
          <h2 className="text-base font-semibold text-gray-900 p-4">社交账号</h2>
          <div className="flex items-center justify-between p-4">
            <span className="text-base text-gray-800">微信号</span>
            <Input
              defaultValue="xiaoming_95"
              className="text-right border-none focus-visible:ring-0 focus-visible:ring-offset-0 w-auto"
            />
          </div>
          <div className="flex items-center justify-between p-4">
            <span className="text-base text-gray-800">QQ号</span>
            <Input
              defaultValue="12345678"
              className="text-right border-none focus-visible:ring-0 focus-visible:ring-offset-0 w-auto"
            />
          </div>
        </div>

        {/* Personal Bio */}
        <div className="bg-white rounded-lg shadow-sm p-4 space-y-3">
          <h2 className="text-base font-semibold text-gray-900">个人简介</h2>
          <Textarea
            defaultValue="热爱生活，享受工作。喜欢摄影、旅行和美食，希望能在这里认识更多志同道合的朋友。目前在一家科技公司担任产品经理，对新技术和创新充满热情。"
            className="min-h-[120px] border-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
          />
        </div>
      </div>
    </div>
  )
}
