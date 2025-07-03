"use client"

import { useState } from "react"
import { useAuth, useUser, SignInButton, UserButton } from "@clerk/nextjs"
import { Sidebar } from "./components/sidebar"
import { Homepage } from "./components/homepage"
import { PDFHub } from "./components/pdf-hub"
import { AudioStudio } from "./components/audio-studio"
import { VideoLab } from "./components/video-lab"
import { ImageWorkshop } from "./components/image-workshop"
import { Profile } from "./components/profile"
import { ClerkSignIn } from "./components/clerk-signin"

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const { isSignedIn, isLoaded } = useAuth()

  // Loading state while Clerk initializes
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }

  // Show sign-in component if user is not authenticated
  if (!isSignedIn) {
    return <ClerkSignIn />
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
