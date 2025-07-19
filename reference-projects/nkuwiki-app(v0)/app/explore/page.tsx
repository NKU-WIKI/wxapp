"use client"

import Image from "next/image"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Mic,
  Globe,
  MessageSquare,
  ShoppingBag,
  Music,
  RefreshCcw,
  MessageCircle,
  User,
  FileText,
  BookOpen,
  Plus,
  X,
  Bell,
} from "lucide-react"
import { useState } from "react"

export default function ExplorePage() {
  const [isSearchActive, setIsSearchActive] = useState(false)

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white border-b shadow-sm">
        <div className="flex items-center flex-1 space-x-2">
          <Plus className="w-5 h-5 text-gray-500" /> {/* Plus icon for search input */}
          <Input
            placeholder="搜索关于南开的一切，或者贡献您的资料"
            className="flex-1 rounded-full bg-gray-100 border-none focus-visible:ring-0 focus-visible:ring-offset-0"
            onFocus={() => setIsSearchActive(true)}
          />
          {isSearchActive ? (
            <Button variant="ghost" size="icon" className="text-gray-500" onClick={() => setIsSearchActive(false)}>
              <X className="w-5 h-5" />
              <span className="sr-only">Cancel Search</span>
            </Button>
          ) : (
            <Button variant="ghost" size="icon" className="text-gray-500">
              <Mic className="w-5 h-5" />
              <span className="sr-only">Voice Search</span>
            </Button>
          )}
        </div>
        {!isSearchActive && ( // Only show notification icons when search is not active
          <div className="flex items-center space-x-4 ml-4">
            <Link href="/notification">
              <Bell className="w-6 h-6 text-gray-600" />
              <span className="sr-only">Notifications</span>
            </Link>
            <Link href="/notification">
              <MessageSquare className="w-6 h-6 text-gray-600" />
              <span className="sr-only">Messages</span>
            </Link>
          </div>
        )}
      </header>

      {isSearchActive ? (
        // Search Skills View
        <div className="flex-1 p-4 space-y-6">
          <div className="flex items-center space-x-2">
            <div className="w-1 h-5 bg-purple-600 rounded-full" />
            <h2 className="text-lg font-semibold text-gray-900">搜索技巧</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">@wiki</h3>
              <p className="text-sm text-gray-600">提问任何南开相关问题</p>
              <p className="text-xs text-gray-500">例：@wiki 推荐今晚吃什么</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                <User className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">@user</h3>
              <p className="text-sm text-gray-600">查看和关注感兴趣的人</p>
              <p className="text-xs text-gray-500">例：@user 王老师</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900">@post</h3>
              <p className="text-sm text-gray-600">查找帖子，发现校园热点内容</p>
              <p className="text-xs text-gray-500">例：@post 校园活动</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900">@knowledge</h3>
              <p className="text-sm text-gray-600">搜索知识库，获取校园资讯</p>
              <p className="text-xs text-gray-500">例：@knowledge 选课指南</p>
            </div>
          </div>
        </div>
      ) : (
        // Default Explore View
        <>
          {/* Content Source Navigation */}
          <div className="flex overflow-x-auto py-3 px-4 bg-white border-b scrollbar-hide">
            <div className="flex space-x-4 whitespace-nowrap">
              <Button variant="ghost" className="flex flex-col items-center text-gray-700 hover:text-purple-600">
                <Globe className="w-6 h-6 mb-1" />
                <span className="text-xs">网站</span>
              </Button>
              <Button variant="ghost" className="flex flex-col items-center text-gray-700 hover:text-purple-600">
                <MessageSquare className="w-6 h-6 mb-1" />
                <span className="text-xs">微信</span>
              </Button>
              <Button variant="ghost" className="flex flex-col items-center text-gray-700 hover:text-purple-600">
                <ShoppingBag className="w-6 h-6 mb-1" />
                <span className="text-xs">集市</span>
              </Button>
              <Button variant="ghost" className="flex flex-col items-center text-gray-700 hover:text-purple-600">
                <Music className="w-6 h-6 mb-1" />
                <span className="text-xs">抖音</span>
              </Button>
            </div>
          </div>

          {/* Contribution Section */}
          <div className="p-4 bg-white border-b shadow-sm flex items-center space-x-2">
            <Image src="/placeholder.svg?height=24&width=24" width={24} height={24} alt="Coin icon" />
            <span className="text-sm text-gray-700">今日你已贡献3条知识，获得1000 token!</span>
          </div>

          <div className="flex-1 p-4 space-y-6">
            {/* Recommended for You */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-900">为您推荐</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-purple-50 rounded-lg p-3 flex flex-col items-center text-center space-y-1">
                  <Image
                    src="/placeholder.svg?height=40&width=40"
                    width={40}
                    height={40}
                    alt="跑步打卡 icon"
                    className="mb-2"
                  />
                  <p className="text-sm font-medium text-gray-800">校园跑步打卡活动规则?</p>
                  <span className="text-xs text-gray-500">756 人提问</span>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 flex flex-col items-center text-center space-y-1">
                  <Image
                    src="/placeholder.svg?height=40&width=40"
                    width={40}
                    height={40}
                    alt="社团加入 icon"
                    className="mb-2"
                  />
                  <p className="text-sm font-medium text-gray-800">如何加入校园社团?</p>
                  <span className="text-xs text-gray-500">543 人提问</span>
                </div>
              </div>
            </div>

            {/* Wiki Today's Hot Summary */}
            <div className="space-y-3 bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">wiki 今日南开热点总结</h2>
                <Button variant="ghost" size="icon" className="text-gray-500">
                  <RefreshCcw className="w-5 h-5" />
                  <span className="sr-only">Refresh</span>
                </Button>
              </div>
              <ul className="list-decimal list-inside text-gray-700 text-sm space-y-2">
                <li>科研突破：化学学院在《自然》发表新型纳米材料研究，相关成果获央视报道[1]。</li>
                <li>
                  招生争议：知乎热帖讨论“强基计划面试公平性”，校方官微两小时内回应称“全程录像可复核”，舆情迅速降温[2]。
                </li>
                <li>[1]微博话题 #南开纳米新材料</li>
                <li>[2]知乎问题 “强基计划面试公平性”</li>
              </ul>
            </div>

            {/* Campus Hot List */}
            <div className="space-y-3 bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">校园热榜</h2>
                <Link href="#" className="text-sm text-purple-600 hover:underline">
                  查看更多
                </Link>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center space-x-2">
                  <span className="font-bold text-lg text-gray-700">1</span>
                  <div className="flex-1">
                    <p className="text-gray-800">期末考试时间调整通知：12 月 20 日起</p>
                    <div className="flex items-center space-x-2 text-gray-500 text-sm">
                      <span>2.8 万讨论</span>
                      <span className="text-red-500">热</span>
                    </div>
                  </div>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="font-bold text-lg text-gray-700">2</span>
                  <div className="flex-1">
                    <p className="text-gray-800">新图书馆开放时间延长至晚上 11 点</p>
                    <div className="flex items-center space-x-2 text-gray-500 text-sm">
                      <span>1.5 万讨论</span>
                      <span className="text-red-500">热</span>
                    </div>
                  </div>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="font-bold text-lg text-gray-700">3</span>
                  <div className="flex-1">
                    <p className="text-gray-800">校园跑步打卡活动正式启动</p>
                    <div className="flex items-center space-x-2 text-gray-500 text-sm">
                      <span>9,826 讨论</span>
                      <span className="text-red-500">热</span>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
