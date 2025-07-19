"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Bold, Italic, ImageIcon, AtSign, PenTool, Lightbulb } from "lucide-react" // Removed Globe, MessageCircle as they are replaced by styled divs
import { useState } from "react"

export default function PublishPage() {
  const [isPublic, setIsPublic] = useState(true)
  const [allowComments, setAllowComments] = useState(true)
  const [useWikiAssistant, setUseWikiAssistant] = useState(false)

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white border-b shadow-sm">
        <Link href="/home" className="text-gray-600">
          <ArrowLeft className="w-6 h-6" />
          <span className="sr-only">Back</span>
        </Link>
        <h1 className="text-lg font-semibold text-gray-800">发布帖子</h1>
        <Button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-full">
          发布
        </Button>
      </header>

      <div className="flex-1 p-4 space-y-6">
        {/* Title Input */}
        <Input
          placeholder="请输入标题"
          className="text-lg font-semibold border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-white shadow-sm"
        />

        {/* Content Textarea */}
        <Textarea
          placeholder="分享你的想法..."
          className="min-h-[150px] border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-white shadow-sm resize-none"
        />

        {/* Toolbar */}
        <div className="flex items-center space-x-4 p-3 bg-white rounded-lg shadow-sm">
          <Button variant="ghost" size="icon" className="text-gray-600">
            <Bold className="w-5 h-5" />
            <span className="sr-only">Bold</span>
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-600">
            <Italic className="w-5 h-5" />
            <span className="sr-only">Italic</span>
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-600">
            <ImageIcon className="w-5 h-5" />
            <span className="sr-only">Add Image</span>
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-600">
            <AtSign className="w-5 h-5" />
            <span className="sr-only">Mention</span>
          </Button>
          <Button className="flex items-center space-x-1 bg-purple-100 text-purple-600 hover:bg-purple-200">
            <PenTool className="w-4 h-4" />
            <span>Wiki 润色</span>
          </Button>
        </div>

        {/* Select Topic */}
        <div className="bg-white rounded-lg shadow-sm p-4 space-y-3">
          <h2 className="text-base font-semibold text-gray-900">选择话题</h2>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full">
              #校园生活
            </Badge>
            <Badge variant="secondary" className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
              #学习交流
            </Badge>
            <Badge variant="secondary" className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
              #求助
            </Badge>
            <Button
              variant="outline"
              className="rounded-full text-gray-600 border-gray-300 h-7 px-3 text-sm bg-transparent"
            >
              #添加话题
            </Button>
          </div>
        </div>

        {/* Wiki Polish Suggestion */}
        <div className="bg-white rounded-lg shadow-sm p-4 flex items-start space-x-3">
          <Lightbulb className="w-5 h-5 text-purple-600 mt-1" />
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Wiki 润色建议</h3>
              <Button variant="link" className="text-purple-600 text-sm p-0 h-auto">
                应用
              </Button>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              建议调整：1. 增加段落间的过渡，使文章更加连贯 2. 补充更多具体细节，增强文章说服力 3.
              优化标点符号使用，提升可读性
            </p>
          </div>
        </div>

        {/* Writing Style Selection */}
        <div className="bg-white rounded-lg shadow-sm p-4 space-y-3">
          <h2 className="text-base font-semibold text-gray-900">文风选择</h2>
          <div className="flex space-x-2">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg">正式</Button>
            <Button variant="outline" className="border-gray-300 text-gray-700 px-4 py-2 rounded-lg bg-transparent">
              轻松
            </Button>
            <Button variant="outline" className="border-gray-300 text-gray-700 px-4 py-2 rounded-lg bg-transparent">
              幽默
            </Button>
            <Button variant="outline" className="border-gray-300 text-gray-700 px-4 py-2 rounded-lg bg-transparent">
              专业
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Toggles */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t shadow-md flex items-center justify-around">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded-full bg-gray-400" /> {/* Replaced Globe with a styled div */}
          <span className="text-sm text-gray-700">公开</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded-full bg-gray-400" /> {/* Replaced MessageCircle with a styled div */}
          <span className="text-sm text-gray-700">允许评论</span>
        </div>
        <div className="flex items-center space-x-2">
          <Lightbulb className="w-5 h-5 text-purple-600" />
          <span className="text-sm text-gray-700">wiki小知</span>
          <Switch checked={useWikiAssistant} onCheckedChange={setUseWikiAssistant} />
        </div>
      </div>
    </div>
  )
}
