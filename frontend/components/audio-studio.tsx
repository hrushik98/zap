"use client"

import type React from "react"

import { useState } from "react"
import {
  Music,
  Upload,
  Download,
  Volume2,
  Scissors,
  Merge,
  FileAudio,
  Youtube,
  Tag,
  Zap,
  Eye,
  Plus,
  X,
  Play,
  Pause,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const audioTools = [
  {
    icon: FileAudio,
    title: "Format Converter",
    desc: "Convert between MP3, WAV, FLAC, AAC, OGG, M4A",
    color: "from-green-500 to-emerald-500",
    time: "~30 sec",
    formats: "6 formats",
  },
  {
    icon: Scissors,
    title: "Audio Trimmer",
    desc: "Cut and trim audio files with precision",
    color: "from-blue-500 to-cyan-500",
    time: "~20 sec",
    formats: "Timeline editor",
  },
  {
    icon: Merge,
    title: "Audio Merger",
    desc: "Combine multiple audio files into one",
    color: "from-purple-500 to-pink-500",
    time: "~45 sec",
    formats: "Multi-file",
  },
  {
    icon: Volume2,
    title: "Volume Adjuster",
    desc: "Boost or reduce audio volume levels",
    color: "from-orange-500 to-red-500",
    time: "~15 sec",
    formats: "Amplify",
  },
  {
    icon: Zap,
    title: "Audio Effects",
    desc: "Add fade in/out, noise reduction effects",
    color: "from-indigo-500 to-purple-500",
    time: "~35 sec",
    formats: "Pro effects",
  },
  {
    icon: FileAudio,
    title: "Audio Compressor",
    desc: "Reduce file size without losing quality",
    color: "from-red-500 to-pink-500",
    time: "~25 sec",
    formats: "Smart compress",
  },
  {
    icon: Youtube,
    title: "YouTube to Audio",
    desc: "Extract audio from YouTube videos",
    color: "from-red-600 to-orange-500",
    time: "~60 sec",
    formats: "URL input",
  },
  {
    icon: FileAudio,
    title: "Video to Audio",
    desc: "Extract audio tracks from video files",
    color: "from-teal-500 to-green-500",
    time: "~40 sec",
    formats: "Extract",
  },
  {
    icon: Tag,
    title: "Metadata Editor",
    desc: "Edit audio tags, title, artist, album info",
    color: "from-violet-500 to-purple-500",
    time: "~10 sec",
    formats: "ID3 tags",
  },
]

export function AudioStudio() {
  const [selectedTool, setSelectedTool] = useState(audioTools[0])
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [isPlaying, setIsPlaying] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    const fileNames = files.map((file) => file.name)
    setUploadedFiles((prev) => [...prev, ...fileNames])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="p-4 md:p-8 md:ml-72">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Audio Studio 🎵</h1>
              <p className="text-gray-400">Professional audio conversion and editing</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Left Panel - Tool Selection */}
          <div className="space-y-6">
            <h2 className="text-lg md:text-xl font-semibold text-white mb-4">Choose Your Tool</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
              {audioTools.map((tool, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedTool(tool)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                    selectedTool.title === tool.title
                      ? "bg-white/10 border-violet-500/50 ring-2 ring-violet-500/30"
                      : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10"
                  }`}
                >
                  <div
                    className={`w-10 h-10 bg-gradient-to-r ${tool.color} rounded-lg flex items-center justify-center mb-3`}
                  >
                    <tool.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-white font-medium mb-1 text-sm md:text-base">{tool.title}</h3>
                  <p className="text-xs md:text-sm text-gray-400 mb-2">{tool.desc}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-violet-400">{tool.time}</span>
                    <span className="text-xs text-gray-500">{tool.formats}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel - Work Area */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-semibold text-white">{selectedTool.title}</h2>
              <div className={`px-3 py-1 rounded-full text-xs bg-gradient-to-r ${selectedTool.color} text-white`}>
                {selectedTool.time}
              </div>
            </div>

            {/* Drag and Drop Zone */}
            <div
              className={`relative border-2 border-dashed rounded-2xl p-6 md:p-8 text-center transition-all duration-300 ${
                dragActive ? "border-violet-500 bg-violet-500/10" : "border-white/20 hover:border-white/40"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="space-y-4">
                <div
                  className={`w-16 h-16 mx-auto bg-gradient-to-r ${selectedTool.color} rounded-2xl flex items-center justify-center`}
                >
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-base md:text-lg font-medium text-white mb-2">
                    {selectedTool.title === "YouTube to Audio" ? "Paste YouTube URL" : "Drop your audio files here"}
                  </p>
                  <p className="text-gray-400 mb-4 text-sm md:text-base">
                    {selectedTool.title === "YouTube to Audio"
                      ? "or paste a YouTube link below"
                      : "or click to browse your files"}
                  </p>
                  {selectedTool.title === "YouTube to Audio" ? (
                    <div className="max-w-md mx-auto">
                      <input
                        type="url"
                        placeholder="https://youtube.com/watch?v=..."
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-gray-400 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-sm md:text-base"
                      />
                    </div>
                  ) : (
                    <Button className="bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600">
                      <Plus className="w-4 h-4 mr-2" />
                      Choose Files
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Tool-specific Options */}
            {selectedTool.title === "Format Converter" && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
                <h3 className="text-white font-medium mb-3 text-sm md:text-base">Output Format</h3>
                <div className="grid grid-cols-3 gap-2">
                  {["MP3", "WAV", "FLAC", "AAC", "OGG", "M4A"].map((format) => (
                    <button
                      key={format}
                      className="px-3 py-2 bg-white/10 hover:bg-violet-500/20 text-white text-xs md:text-sm rounded-lg transition-colors border border-white/10 hover:border-violet-500/30"
                    >
                      {format}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedTool.title === "Volume Adjuster" && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
                <h3 className="text-white font-medium mb-3 text-sm md:text-base">Volume Level</h3>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="200"
                    defaultValue="100"
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>0%</span>
                    <span>100%</span>
                    <span>200%</span>
                  </div>
                </div>
              </div>
            )}

            {selectedTool.title === "Audio Effects" && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
                <h3 className="text-white font-medium mb-3 text-sm md:text-base">Effects</h3>
                <div className="space-y-2">
                  {["Fade In", "Fade Out", "Noise Reduction", "Echo", "Reverb"].map((effect) => (
                    <label key={effect} className="flex items-center gap-2 text-sm text-gray-300">
                      <input type="checkbox" className="rounded border-white/20 bg-white/10" />
                      {effect}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
                <h3 className="text-white font-medium mb-3 text-sm md:text-base">Uploaded Files</h3>
                <div className="space-y-2">
                  {uploadedFiles.map((fileName, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                      <Music className="w-4 h-4 text-violet-400 flex-shrink-0" />
                      <span className="text-white text-xs md:text-sm flex-1 truncate">{fileName}</span>
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                      >
                        {isPlaying ? (
                          <Pause className="w-4 h-4 text-violet-400" />
                        ) : (
                          <Play className="w-4 h-4 text-violet-400" />
                        )}
                      </button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setUploadedFiles((prev) => prev.filter((_, i) => i !== index))}
                        className="p-1 h-auto"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button className="w-full mt-4 bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600">
                  Process Audio Files ⚡
                </Button>
              </div>
            )}

            {/* Audio Waveform Preview */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 md:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-5 h-5 text-cyan-400" />
                <h3 className="text-white font-medium text-sm md:text-base">Audio Preview</h3>
              </div>
              <div className="aspect-[4/1] bg-white/10 rounded-lg flex items-center justify-center relative overflow-hidden">
                {uploadedFiles.length > 0 ? (
                  <div className="w-full h-full flex items-center justify-center">
                    {/* Simulated waveform */}
                    <div className="flex items-center gap-1 h-full w-full px-4">
                      {Array.from({ length: 50 }).map((_, i) => (
                        <div
                          key={i}
                          className="bg-gradient-to-t from-violet-500 to-cyan-400 rounded-full flex-1 opacity-70"
                          style={{
                            height: `${Math.random() * 80 + 20}%`,
                            animation: isPlaying ? `pulse ${Math.random() * 2 + 1}s infinite` : "none",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm md:text-base">Upload audio files to see waveform</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Audio Conversions */}
        <div className="mt-8 md:mt-12 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 md:p-6">
          <h3 className="text-white font-medium mb-4 text-sm md:text-base">Recent Audio Conversions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "podcast.mp3", action: "Trimmed", time: "3 min ago", format: "MP3" },
              { name: "song.wav", action: "Converted to FLAC", time: "8 min ago", format: "FLAC" },
              { name: "interview.m4a", action: "Volume Boosted", time: "15 min ago", format: "M4A" },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <Music className="w-8 h-8 text-violet-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs md:text-sm font-medium truncate">{item.name}</p>
                  <p className="text-gray-400 text-xs">
                    {item.action} • {item.time}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-violet-400 bg-violet-500/20 px-2 py-1 rounded">{item.format}</span>
                  <Button size="sm" variant="ghost" className="p-1 h-auto">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
