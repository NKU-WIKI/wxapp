import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, CheckSquare, ThumbsUp, MessageCircle } from "lucide-react"

export default function MyLevelPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white border-b shadow-sm">
        <Link href="/profile" className="text-gray-600">
          <ArrowLeft className="w-6 h-6" />
          <span className="sr-only">Back</span>
        </Link>
        <h1 className="text-lg font-semibold text-gray-800">我的等级</h1>
        <div className="w-6 h-6" /> {/* Placeholder for alignment */}
      </header>

      <div className="flex-1 p-4 space-y-6">
        {/* Current Level Info */}
        <div className="bg-white rounded-lg shadow-sm p-4 space-y-3 text-center">
          <div className="flex items-center justify-center space-x-2">
            <Image src="/placeholder.svg?height=40&width=40" width={40} height={40} alt="小黄鱼 icon" />
            <span className="text-xl font-bold text-gray-900">小黄鱼</span>
          </div>
          <p className="text-sm text-gray-600">Lv1 : 2</p>
          <div className="flex items-center justify-between text-sm text-gray-700">
            <span>当前经验值</span>
            <span>2</span>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-700">
            <span>当前等级</span>
            <span>Lv1</span>
          </div>
          <Progress value={4} className="w-full h-2 bg-gray-200 rounded-full" />
          <span className="text-xs text-gray-500">2/50</span>
        </div>

        {/* Level Descriptions */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg shadow-sm p-4 text-center space-y-1">
            <h3 className="font-semibold text-gray-900">Lv0</h3>
            <p className="text-sm text-gray-600">0 经验值</p>
          </div>
          <div className="bg-purple-50 rounded-lg shadow-sm p-4 text-center space-y-1 border-2 border-purple-600">
            <h3 className="font-semibold text-purple-600">Lv1</h3>
            <p className="text-sm text-gray-600">1-50 经验值</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center space-y-1">
            <h3 className="font-semibold text-gray-900">Lv2</h3>
            <p className="text-sm text-gray-600">51-200 经验值</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center space-y-1">
            <h3 className="font-semibold text-gray-900">Lv3</h3>
            <p className="text-sm text-gray-600">201-450 经验值</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center space-y-1">
            <h3 className="font-semibold text-gray-900">Lv4</h3>
            <p className="text-sm text-gray-600">451-900 经验值</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center space-y-1">
            <h3 className="font-semibold text-gray-900">Lv5</h3>
            <p className="text-sm text-gray-600">901-1500 经验值</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center space-y-1">
            <h3 className="font-semibold text-gray-900">Lv6</h3>
            <p className="text-sm text-gray-600">1501-3000 经验值</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center space-y-1">
            <h3 className="font-semibold text-gray-900">Lv7</h3>
            <p className="text-sm text-gray-600">大于3000 经验值</p>
          </div>
        </div>

        {/* Gain Experience Section */}
        <div className="bg-white rounded-lg shadow-sm p-4 space-y-3">
          <h2 className="text-base font-semibold text-gray-900">获取经验值</h2>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <CheckSquare className="w-5 h-5 text-gray-600" />
              <span className="text-base text-gray-800">每日登录</span>
            </div>
            <span className="text-sm text-gray-500">未完成</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <ThumbsUp className="w-5 h-5 text-gray-600" />
              <span className="text-base text-gray-800">帖子被点赞</span>
            </div>
            <span className="text-sm text-purple-600">今日已获得 +2</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <MessageCircle className="w-5 h-5 text-gray-600" />
              <span className="text-base text-gray-800">评论他人帖子</span>
            </div>
            <span className="text-sm text-gray-500">已完成</span>
          </div>
        </div>
      </div>
    </div>
  )
}
