"use client"

import { useState } from "react"
import { Menu, X, Sparkles, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

const sidebarItems = [
  { label: "My Dashboard", id: "dashboard", emoji: "📊" },
  { label: "PDF Hub", id: "pdf", emoji: "🗂️" },
  { label: "Audio Studio", id: "audio", emoji: "🎵" },
  { label: "Video Lab", id: "video", emoji: "🎬" },
  { label: "Image Workshop", id: "image", emoji: "🖼️" },
]

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden bg-black/20 backdrop-blur-sm border border-white/10"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-72 bg-gradient-to-b from-slate-900/95 to-purple-900/95 backdrop-blur-xl border-r border-white/10 z-40 transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Zenetia</h1>
              <p className="text-sm text-gray-400 flex items-center gap-1">
                Zap <Zap className="w-3 h-3" />
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id)
                setIsOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeTab === item.id
                  ? "bg-gradient-to-r from-violet-500/20 to-cyan-500/20 border border-violet-500/30 text-white"
                  : "hover:bg-white/5 text-gray-300 hover:text-white"
              }`}
            >
              <span className="text-xl">{item.emoji}</span>
              <span className="font-medium">{item.label}</span>
              {activeTab === item.id && (
                <div className="ml-auto w-2 h-2 bg-gradient-to-r from-violet-400 to-cyan-400 rounded-full animate-pulse" />
              )}
            </button>
          ))}
        </nav>

        {/* Profile Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <button
            onClick={() => {
              onTabChange("profile")
              setIsOpen(false)
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              activeTab === "profile"
                ? "bg-gradient-to-r from-violet-500/20 to-cyan-500/20 border border-violet-500/30 text-white"
                : "hover:bg-white/5 text-gray-300 hover:text-white"
            }`}
          >
            <span className="text-xl">👤</span>
            <span className="font-medium">Profile</span>
            {activeTab === "profile" && (
              <div className="ml-auto w-2 h-2 bg-gradient-to-r from-violet-400 to-cyan-400 rounded-full animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}
