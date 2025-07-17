import Image from "next/image"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Heart, MessageCircle, Share2, MapPin, Send, ChevronDown } from "lucide-react"

export default function PostDetailPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white border-b shadow-sm">
        <Link href="#" className="text-gray-600">
          <ArrowLeft className="w-6 h-6" />
          <span className="sr-only">Back</span>
        </Link>
        <h1 className="text-lg font-semibold text-gray-800">帖子详情</h1>
        <div className="w-6 h-6" /> {/* Placeholder for alignment */}
      </header>

      {/* Post Content */}
      <div className="flex-1 p-4 space-y-4 bg-white">
        {/* User Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10 border">
              <AvatarImage src="/placeholder-user.jpg" alt="User Avatar" />
              <AvatarFallback>NK</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1">
                <span className="font-semibold text-gray-900">南开艺术学院的小艺</span>
                <Badge className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">Lv3</Badge>
              </div>
              <span className="text-xs text-gray-500">2小时前 · 在校学生</span>
            </div>
          </div>
          <Button
            variant="outline"
            className="rounded-full text-purple-600 border-purple-600 hover:bg-purple-50 bg-transparent"
          >
            关注
          </Button>
        </div>

        {/* Post Title and Text */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-gray-900">巍巍南开，百年日新</h2>
          <p className="text-gray-700 leading-relaxed">
            今天漫步南开大学校园，感受到了百年学府的厚重与活力。阳光透过梧桐树叶洒在主楼前，学子们穿梭其中，构成一幅生机勃勃的画面。站在伯苓大讲堂前，仿佛能听到“允公允能，日新月异”的校训回响。分享一组照片，希望能带给大家一份学术氛围与青春活力。
          </p>
        </div>

        {/* Post Images */}
        <div className="grid grid-cols-2 gap-2">
          <Image
            src="/placeholder.svg?height=200&width=200"
            width={200}
            height={200}
            alt="Post image 1"
            className="object-cover w-full h-full rounded-lg"
          />
          <Image
            src="/placeholder.svg?height=200&width=200"
            width={200}
            height={200}
            alt="Post image 2"
            className="object-cover w-full h-full rounded-lg"
          />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 text-sm text-gray-600">
          <Badge variant="secondary" className="bg-gray-100 text-gray-700 rounded-full px-3 py-1">
            #南开大学
          </Badge>
          <Badge variant="secondary" className="bg-gray-100 text-gray-700 rounded-full px-3 py-1">
            #大学生活
          </Badge>
          <div className="flex items-center space-x-1 bg-gray-100 text-gray-700 rounded-full px-3 py-1">
            <MapPin className="w-4 h-4" />
            <span>南开大学八里台校区</span>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-around py-2 border-t border-b border-gray-100">
          <Button variant="ghost" className="flex items-center space-x-1 text-gray-600 hover:text-purple-600">
            <Heart className="w-5 h-5" />
            <span>2.8k</span>
          </Button>
          <Button variant="ghost" className="flex items-center space-x-1 text-gray-600 hover:text-purple-600">
            <MessageCircle className="w-5 h-5" />
            <span>128</span>
          </Button>
          <Button variant="ghost" className="flex items-center space-x-1 text-gray-600 hover:text-purple-600">
            <Share2 className="w-5 h-5" />
            <span>128</span>
          </Button>
        </div>

        {/* Comments Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">评论 (128)</h3>
            <Button variant="ghost" className="flex items-center space-x-1 text-gray-600 hover:text-purple-600">
              <span>时间</span>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>

          {/* Sample Comment 1 */}
          <div className="flex items-start space-x-3">
            <Avatar className="w-9 h-9 border">
              <AvatarImage src="/placeholder-user.jpg" alt="User Avatar" />
              <AvatarFallback>NK</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-900">NKUWiki</span>
                <Badge className="bg-purple-100 text-purple-600 text-xs px-2 py-0.5 rounded-full">AI助手</Badge>
                <span className="text-xs text-gray-500 ml-auto">1小时前</span>
              </div>
              <p className="text-gray-700 leading-relaxed">
                南开大学的主楼建于1982年，是学校的标志性建筑之一。伯苓大讲堂则是为纪念南开创始人张伯苓先生而命名。“允公允能，日新月异”的校训出自张伯苓先生，寓意南开人要心怀天下、追求卓越。
              </p>
              <div className="flex items-center space-x-4 text-gray-500 text-sm">
                <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                  <Heart className="w-4 h-4" />
                  <span>89</span>
                </Button>
                <Button variant="ghost" size="sm">
                  回复
                </Button>
              </div>
            </div>
          </div>

          {/* Sample Comment 2 */}
          <div className="flex items-start space-x-3">
            <Avatar className="w-9 h-9 border">
              <AvatarImage src="/placeholder-user.jpg" alt="User Avatar" />
              <AvatarFallback>NK</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-900">南开数院小可爱</span>
                <Badge className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">Lv3</Badge>
                <span className="text-xs text-gray-500 ml-auto">45分钟前</span>
              </div>
              <p className="text-gray-700 leading-relaxed">
                南开的秋天最美了 主楼前的梧桐树开始变黄了吗？期待今年的落叶大道！
              </p>
              <div className="flex items-center space-x-4 text-gray-500 text-sm">
                <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                  <Heart className="w-4 h-4" />
                  <span>56</span>
                </Button>
                <Button variant="ghost" size="sm">
                  回复
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Comment Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t shadow-md flex items-center space-x-2">
        <Input
          placeholder="说点什么..."
          className="flex-1 rounded-full bg-gray-100 border-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <Button variant="ghost" size="icon" className="rounded-full text-purple-600">
          <Send className="w-5 h-5" />
          <span className="sr-only">Send</span>
        </Button>
      </div>
    </div>
  )
}
