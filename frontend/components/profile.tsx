"use client"

import { useUser, useAuth } from "@clerk/nextjs"
import { User, Mail, Calendar, LogOut, Shield, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Profile() {
  const { user } = useUser()
  const { signOut } = useAuth()

  const handleSignOut = () => {
    signOut()
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-violet-900 p-8 md:ml-72">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <User className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-400">Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-violet-900 p-8 md:ml-72">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-2xl flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Profile</h1>
              <p className="text-purple-200">Manage your account and preferences</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {user.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={user.fullName || "Profile"}
                    className="w-24 h-24 rounded-2xl border-2 border-purple-400"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                    <User className="w-12 h-12 text-white" />
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {user.fullName || "User"}
                </h2>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-300">
                    <Mail className="w-5 h-5 text-purple-400" />
                    <span>{user.primaryEmailAddress?.emailAddress}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-gray-300">
                    <Calendar className="w-5 h-5 text-purple-400" />
                    <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-gray-300">
                    <Shield className="w-5 h-5 text-purple-400" />
                    <span>Account Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Account Actions
            </h3>
            
            <div className="space-y-3">
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="w-full justify-start bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Usage Stats */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Usage Statistics</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <div className="text-2xl font-bold text-violet-400">0</div>
                <div className="text-sm text-gray-400">PDFs Processed</div>
              </div>
              
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <div className="text-2xl font-bold text-cyan-400">0</div>
                <div className="text-sm text-gray-400">Audio Files</div>
              </div>
              
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <div className="text-2xl font-bold text-green-400">0</div>
                <div className="text-sm text-gray-400">Images Edited</div>
              </div>
              
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <div className="text-2xl font-bold text-orange-400">0</div>
                <div className="text-sm text-gray-400">Videos Processed</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 