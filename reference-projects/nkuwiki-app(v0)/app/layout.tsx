import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import BottomNavigation from "@/components/bottom-navigation"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Nankai App",
  description: "A social app for Nankai University",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.className)}>
        <div className="flex flex-col min-h-screen">
          <main className="flex-1 pb-16">{children}</main>
          <BottomNavigation />
        </div>
      </body>
    </html>
  )
}
