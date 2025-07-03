"use client"

import { useState } from "react"
import {
  Search,
  TrendingUp,
  Clock,
  Download,
  FileText,
  Music,
  Video,
  ImageIcon,
  Zap,
  ArrowRight,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const quickAccessTools = [
  {
    icon: FileText,
    title: "PDF to Word",
    desc: "Convert instantly",
    color: "from-red-500 to-orange-500",
  },
  {
    icon: Music,
    title: "YouTube to MP3",
    desc: "Extract audio",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Video,
    title: "Video Compressor",
    desc: "Reduce file size",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: ImageIcon,
    title: "JPG to PNG",
    desc: "Change format",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Zap,
    title: "Smart Convert",
    desc: "Auto-detect format",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: FileText,
    title: "Merge PDFs",
    desc: "Combine files",
    color: "from-indigo-500 to-purple-500",
  },
]

const recentFiles = [
  { name: "presentation.pdf", type: "PDF to Word", time: "2 min ago", size: "2.3 MB" },
  { name: "song.mp3", type: "Audio Trim", time: "5 min ago", size: "4.1 MB" },
  { name: "video.mp4", type: "Video Compress", time: "12 min ago", size: "45.2 MB" },
  { name: "image.jpg", type: "JPG to PNG", time: "1 hour ago", size: "1.8 MB" },
]

export function Homepage() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 md:w-64 md:h-64 bg-violet-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 md:w-96 md:h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-16 h-16 md:w-32 md:h-32 bg-pink-500/10 rounded-full blur-2xl animate-bounce" />
      </div>

      <div className="relative z-10 p-4 md:p-8 md:ml-72">
        {/* Hero Section */}
        <div className="text-center mb-8 md:mb-12 pt-16 md:pt-0">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-violet-400 animate-spin" />
            <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold bg-gradient-to-r from-violet-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Convert Anything
            </h1>
            <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-cyan-400 animate-spin" />
          </div>
          <p className="text-lg md:text-xl text-gray-300 mb-6 md:mb-8">Anywhere, Anytime ⚡</p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative px-2 sm:px-4">
            <Search className="absolute left-6 sm:left-8 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="What needs converting today? 🤔"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 sm:pl-12 pr-4 py-3 md:py-4 text-base md:text-lg bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-gray-400 rounded-2xl focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>

        {/* Quick Access Grid */}
        <div className="mb-8 md:mb-12">
          <div className="flex items-center gap-2 mb-4 md:mb-6 px-1 sm:px-2">
            <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-violet-400" />
            <h2 className="text-xl md:text-2xl font-bold text-white">Quick Access</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-violet-500/50 to-transparent" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {quickAccessTools.map((tool, index) => (
              <div
                key={index}
                className="group relative p-4 md:p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <div
                  className={`w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r ${tool.color} rounded-xl flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform`}
                >
                  <tool.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <h3 className="text-base md:text-lg font-semibold text-white mb-2">{tool.title}</h3>
                <p className="text-sm md:text-base text-gray-400 mb-3">{tool.desc}</p>
                <div className="flex items-center justify-between">
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>

                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-cyan-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="max-w-lg">
          {/* Recent Files */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-3 md:p-4">
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <Clock className="w-4 h-4 text-cyan-400" />
              <h3 className="text-base md:text-lg font-semibold text-white">Recent Conversions</h3>
            </div>

            <div className="space-y-2 md:space-y-3">
              {recentFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex flex-col xs:flex-row items-start xs:items-center gap-2 xs:gap-3 p-2 md:p-2 rounded-xl hover:bg-white/5 transition-colors group"
                >
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-3 h-3 md:w-4 md:h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0 w-full xs:w-auto">
                    <p className="text-xs md:text-sm text-white font-medium truncate">{file.name}</p>
                    <p className="text-xs text-gray-400">
                      {file.type} • {file.size}
                    </p>
                  </div>
                  <div className="flex justify-between items-center w-full xs:w-auto xs:text-right xs:flex-col flex-shrink-0">
                    <p className="text-xs text-gray-400">{file.time}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="opacity-100 xs:opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
