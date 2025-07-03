"use client"

import { useState } from "react"
import { Sidebar } from "./components/sidebar"
import { Homepage } from "./components/homepage"
import { PDFHub } from "./components/pdf-hub"
import { AudioStudio } from "./components/audio-studio"
import { VideoLab } from "./components/video-lab"
import { ImageWorkshop } from "./components/image-workshop"
import { Login } from "./components/login"

// Add this Profile component after the ImageWorkshop import
function Profile() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-8 md:ml-72">
      <div className="text-center py-20">
        <div className="text-6xl mb-4">👤</div>
        <h1 className="text-4xl font-bold text-white mb-4">Profile</h1>
        <p className="text-gray-400">Manage your account and preferences</p>
      </div>
    </div>
  )
}

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Homepage />
      case "pdf":
        return <PDFHub />
      case "audio":
        return <AudioStudio />
      case "video":
        return <VideoLab />
      case "image":
        return <ImageWorkshop />
      case "profile":
        return <Profile />
      default:
        return <Homepage />
    }
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      {renderContent()}
    </div>
  )
}
