"use client"

import { SignIn } from "@clerk/nextjs"
import { Sparkles, Zap } from "lucide-react"

export function ClerkSignIn() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 md:w-64 md:h-64 bg-violet-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 md:w-96 md:h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-16 h-16 md:w-32 md:h-32 bg-pink-500/10 rounded-full blur-2xl animate-bounce" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Zenetia</h1>
              <p className="text-sm text-gray-400 flex items-center gap-1">
                Zap <Zap className="w-3 h-3" />
              </p>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Welcome Back!</h2>
          <p className="text-gray-400 text-sm">Sign in to access your conversion tools</p>
        </div>

        {/* Clerk Sign In Component */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
          <SignIn 
            routing="hash"
            signUpUrl="#sign-up"
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "bg-transparent shadow-none border-none",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: "bg-white/10 border-white/20 text-white hover:bg-white/20 transition-colors",
                socialButtonsBlockButtonText: "text-white",
                dividerLine: "bg-white/20",
                dividerText: "text-gray-300",
                formFieldLabel: "text-gray-300",
                formFieldInput: "bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:ring-violet-500 focus:border-violet-500",
                formButtonPrimary: "bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600 text-white font-semibold transition-all duration-200",
                footerActionLink: "text-violet-400 hover:text-violet-300",
                identityPreviewText: "text-white",
                identityPreviewEditButton: "text-violet-400 hover:text-violet-300",
              },
              layout: {
                socialButtonsPlacement: "top",
                showOptionalFields: false,
              },
            }}
          />
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-400 text-sm">© 2024 Zenetia. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
} 