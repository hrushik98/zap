"use client"

import type React from "react"

import { useState } from "react"
import {
  Video,
  Upload,
  Download,
  Scissors,
  Merge,
  RotateCw,
  Maximize,
  FileImage,
  Type,
  Droplets,
  Gauge,
  Eye,
  Plus,
  X,
  Play,
  Pause,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const videoTools = [
  {
    icon: Video,
    title: "Format Converter",
    desc: "Convert between MP4, WebM, AVI, MOV, MKV, FLV",
    color: "from-blue-500 to-cyan-500",
    time: "~2 min",
    formats: "6 formats",
  },
  {
    icon: Scissors,
    title: "Video Trimmer",
    desc: "Cut and trim video files with precision",
    color: "from-green-500 to-emerald-500",
    time: "~1 min",
    formats: "Timeline editor",
  },
  {
    icon: Merge,
    title: "Video Merger",
    desc: "Combine multiple video files into one",
    color: "from-purple-500 to-pink-500",
    time: "~3 min",
    formats: "Multi-file",
  },
  {
    icon: Maximize,
    title: "Video Resizer",
    desc: "Change video resolution and aspect ratio",
    color: "from-orange-500 to-red-500",
    time: "~90 sec",
    formats: "HD/4K ready",
  },
  {
    icon: RotateCw,
    title: "Video Rotator",
    desc: "Rotate video orientation (90°, 180°, 270°)",
    color: "from-indigo-500 to-purple-500",
    time: "~45 sec",
    formats: "Any angle",
  },
  {
    icon: Video,
    title: "Video Compressor",
    desc: "Reduce file size without losing quality",
    color: "from-red-500 to-pink-500",
    time: "~2 min",
    formats: "Smart compress",
  },
  {
    icon: Type,
    title: "Add Subtitles",
    desc: "Add subtitle files or burn-in captions",
    color: "from-teal-500 to-green-500",
    time: "~90 sec",
    formats: "SRT/VTT",
  },
  {
    icon: Droplets,
    title: "Add Watermark",
    desc: "Add text or image watermarks to videos",
    color: "from-violet-500 to-purple-500",
    time: "~2 min",
    formats: "Custom position",
  },
  {
    icon: Gauge,
    title: "Speed Adjuster",
    desc: "Change video playback speed (0.5x - 4x)",
    color: "from-yellow-500 to-orange-500",
    time: "~90 sec",
    formats: "Variable speed",
  },
  {
    icon: FileImage,
    title: "Extract Frames",
    desc: "Extract video frames as JPG/PNG images",
    color: "from-pink-500 to-red-500",
    time: "~60 sec",
    formats: "Batch export",
  },
  {
    icon: FileImage,
    title: "Video to GIF",
    desc: "Convert video segments to animated GIFs",
    color: "from-cyan-500 to-blue-500",
    time: "~75 sec",
    formats: "Optimized",
  },
]

export function VideoLab() {
  const [selectedTool, setSelectedTool] = useState(videoTools[0])
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
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Video Lab 🎬</h1>
              <p className="text-gray-400">Professional video conversion and editing</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Left Panel - Tool Selection */}
          <div className="space-y-6">
            <h2 className="text-lg md:text-xl font-semibold text-white mb-4">Choose Your Tool</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
              {videoTools.map((tool, index) => (
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
                  <p className="text-base md:text-lg font-medium text-white mb-2">Drop your video files here</p>
                  <p className="text-gray-400 mb-4 text-sm md:text-base">or click to browse your files</p>
                  <Button className="bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Choose Files
                  </Button>
                </div>
              </div>
            </div>

            {/* Tool-specific Options */}
            {selectedTool.title === "Format Converter" && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
                <h3 className="text-white font-medium mb-3 text-sm md:text-base">Output Format</h3>
                <div className="grid grid-cols-3 gap-2">
                  {["MP4", "WebM", "AVI", "MOV", "MKV", "FLV"].map((format) => (
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

            {selectedTool.title === "Video Resizer" && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
                <h3 className="text-white font-medium mb-3 text-sm md:text-base">Resolution</h3>
                <div className="grid grid-cols-2 gap-2">
                  {["720p (HD)", "1080p (FHD)", "1440p (2K)", "2160p (4K)", "Custom", "Keep Original"].map((res) => (
                    <button
                      key={res}
                      className="px-3 py-2 bg-white/10 hover:bg-violet-500/20 text-white text-xs md:text-sm rounded-lg transition-colors border border-white/10 hover:border-violet-500/30"
                    >
                      {res}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedTool.title === "Video Rotator" && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
                <h3 className="text-white font-medium mb-3 text-sm md:text-base">Rotation Angle</h3>
                <div className="grid grid-cols-2 gap-2">
                  {["90° Clockwise", "90° Counter-CW", "180° Flip", "270° Clockwise"].map((angle) => (
                    <button
                      key={angle}
                      className="px-3 py-2 bg-white/10 hover:bg-violet-500/20 text-white text-xs md:text-sm rounded-lg transition-colors border border-white/10 hover:border-violet-500/30"
                    >
                      {angle}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedTool.title === "Speed Adjuster" && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
                <h3 className="text-white font-medium mb-3 text-sm md:text-base">Playback Speed</h3>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0.25"
                    max="4"
                    step="0.25"
                    defaultValue="1"
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>0.25x</span>
                    <span>1x (Normal)</span>
                    <span>4x</span>
                  </div>
                </div>
              </div>
            )}

            {selectedTool.title === "Add Subtitles" && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
                <h3 className="text-white font-medium mb-3 text-sm md:text-base">Subtitle Options</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <button className="px-3 py-2 bg-white/10 hover:bg-violet-500/20 text-white text-xs md:text-sm rounded-lg transition-colors border border-white/10 hover:border-violet-500/30">
                      Upload SRT
                    </button>
                    <button className="px-3 py-2 bg-white/10 hover:bg-violet-500/20 text-white text-xs md:text-sm rounded-lg transition-colors border border-white/10 hover:border-violet-500/30">
                      Upload VTT
                    </button>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-300">
                    <input type="checkbox" className="rounded border-white/20 bg-white/10" />
                    Burn subtitles into video
                  </label>
                </div>
              </div>
            )}

            {selectedTool.title === "Add Watermark" && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
                <h3 className="text-white font-medium mb-3 text-sm md:text-base">Watermark Type</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <button className="px-3 py-2 bg-white/10 hover:bg-violet-500/20 text-white text-xs md:text-sm rounded-lg transition-colors border border-white/10 hover:border-violet-500/30">
                      Text Watermark
                    </button>
                    <button className="px-3 py-2 bg-white/10 hover:bg-violet-500/20 text-white text-xs md:text-sm rounded-lg transition-colors border border-white/10 hover:border-violet-500/30">
                      Image Watermark
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter watermark text..."
                    className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-gray-400 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-sm"
                  />
                </div>
              </div>
            )}

            {selectedTool.title === "Video to GIF" && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
                <h3 className="text-white font-medium mb-3 text-sm md:text-base">GIF Settings</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-400">Start Time (sec)</label>
                      <input
                        type="number"
                        placeholder="0"
                        className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-gray-400 rounded-lg focus:ring-2 focus:ring-violet-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">Duration (sec)</label>
                      <input
                        type="number"
                        placeholder="5"
                        className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-gray-400 rounded-lg focus:ring-2 focus:ring-violet-500 text-sm"
                      />
                    </div>
                  </div>
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
                      <Video className="w-4 h-4 text-violet-400 flex-shrink-0" />
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
                  Process Video Files ⚡
                </Button>
              </div>
            )}

            {/* Video Preview */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 md:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-5 h-5 text-cyan-400" />
                <h3 className="text-white font-medium text-sm md:text-base">Video Preview</h3>
              </div>
              <div className="aspect-video bg-white/10 rounded-lg flex items-center justify-center relative overflow-hidden">
                {uploadedFiles.length > 0 ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <Video className="w-16 h-16 text-violet-400 mx-auto mb-2" />
                      <p className="text-white text-sm">Video Preview</p>
                      <p className="text-gray-400 text-xs">Click play to preview</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm md:text-base">Upload video files to see preview</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Video Conversions */}
        <div className="mt-8 md:mt-12 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 md:p-6">
          <h3 className="text-white font-medium mb-4 text-sm md:text-base">Recent Video Conversions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "presentation.mp4", action: "Compressed", time: "5 min ago", format: "MP4" },
              { name: "tutorial.avi", action: "Converted to MP4", time: "12 min ago", format: "MP4" },
              { name: "demo.mov", action: "Added Subtitles", time: "20 min ago", format: "MOV" },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <Video className="w-8 h-8 text-violet-400 flex-shrink-0" />
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
