"use client"

import type React from "react"
import { useState } from "react"
import {
  ImageIcon,
  Upload,
  Download,
  Crop,
  RotateCw,
  Maximize,
  Scissors,
  FileText,
  Sparkles,
  Droplets,
  Layers,
  ScanText,
  Eye,
  Plus,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const imageTools = [
  {
    icon: ImageIcon,
    title: "Format Converter",
    desc: "Convert between JPG, PNG, WebP, HEIC, BMP, TIFF",
    color: "from-pink-500 to-rose-500",
    time: "~15 sec",
    formats: "6 formats",
  },
  {
    icon: Maximize,
    title: "Image Resizer",
    desc: "Resize images with custom dimensions",
    color: "from-blue-500 to-cyan-500",
    time: "~10 sec",
    formats: "Any size",
  },
  {
    icon: Crop,
    title: "Image Cropper",
    desc: "Crop images with precise selection",
    color: "from-green-500 to-emerald-500",
    time: "~8 sec",
    formats: "Custom crop",
  },
  {
    icon: RotateCw,
    title: "Image Rotator",
    desc: "Rotate images (90°, 180°, 270°, custom)",
    color: "from-purple-500 to-pink-500",
    time: "~5 sec",
    formats: "Any angle",
  },
  {
    icon: Scissors,
    title: "Background Remover",
    desc: "AI-powered background removal",
    color: "from-orange-500 to-red-500",
    time: "~30 sec",
    formats: "AI powered",
  },
  {
    icon: ImageIcon,
    title: "Image Compressor",
    desc: "Reduce file size without losing quality",
    color: "from-indigo-500 to-purple-500",
    time: "~12 sec",
    formats: "Smart compress",
  },
  {
    icon: FileText,
    title: "Image to PDF",
    desc: "Convert images to PDF documents",
    color: "from-red-500 to-pink-500",
    time: "~20 sec",
    formats: "Multi-page",
  },
  {
    icon: FileText,
    title: "Image to Word",
    desc: "Convert images to Word documents",
    color: "from-teal-500 to-green-500",
    time: "~25 sec",
    formats: "DOCX format",
  },
  {
    icon: Sparkles,
    title: "AI Enhancement",
    desc: "AI-powered image quality enhancement",
    color: "from-violet-500 to-purple-500",
    time: "~45 sec",
    formats: "Super resolution",
  },
  {
    icon: Droplets,
    title: "Add Watermark",
    desc: "Add text or image watermarks",
    color: "from-yellow-500 to-orange-500",
    time: "~15 sec",
    formats: "Custom position",
  },
  {
    icon: Layers,
    title: "Batch Processing",
    desc: "Process multiple images simultaneously",
    color: "from-cyan-500 to-blue-500",
    time: "~varies",
    formats: "Multi-file",
  },
  {
    icon: ScanText,
    title: "OCR Text Extract",
    desc: "Extract text from images using OCR",
    color: "from-emerald-500 to-teal-500",
    time: "~20 sec",
    formats: "Text output",
  },
]

export function ImageWorkshop() {
  const [selectedTool, setSelectedTool] = useState(imageTools[0])
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])

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
      <div className="p-4 sm:p-6 md:p-8 md:ml-72">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Image Workshop 🖼️</h1>
              <p className="text-sm sm:text-base text-gray-400">Transform and optimize your images</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
          {/* Left Panel - Tool Selection */}
          <div className="space-y-4 md:space-y-6">
            <h2 className="text-lg md:text-xl font-semibold text-white mb-3 md:mb-4">Choose Your Tool</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 gap-3 md:gap-4">
              {imageTools.map((tool, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedTool(tool)}
                  className={`p-3 md:p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                    selectedTool.title === tool.title
                      ? "bg-white/10 border-violet-500/50 ring-2 ring-violet-500/30"
                      : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10"
                  }`}
                >
                  <div
                    className={`w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r ${tool.color} rounded-lg flex items-center justify-center mb-2 md:mb-3`}
                  >
                    <tool.icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                  <h3 className="text-white font-medium mb-1 text-sm md:text-base leading-tight">{tool.title}</h3>
                  <p className="text-xs md:text-sm text-gray-400 mb-2 line-clamp-2">{tool.desc}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-violet-400">{tool.time}</span>
                    <span className="text-xs text-gray-500">{tool.formats}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel - Work Area */}
          <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
              <h2 className="text-lg md:text-xl font-semibold text-white">{selectedTool.title}</h2>
              <div
                className={`px-2 md:px-3 py-1 rounded-full text-xs bg-gradient-to-r ${selectedTool.color} text-white whitespace-nowrap`}
              >
                {selectedTool.time}
              </div>
            </div>

            {/* Drag and Drop Zone */}
            <div
              className={`relative border-2 border-dashed rounded-2xl p-4 sm:p-6 md:p-8 text-center transition-all duration-300 ${
                dragActive ? "border-violet-500 bg-violet-500/10" : "border-white/20 hover:border-white/40"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="space-y-3 md:space-y-4">
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto bg-gradient-to-r ${selectedTool.color} rounded-2xl flex items-center justify-center`}
                >
                  <Upload className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                </div>
                <div>
                  <p className="text-sm sm:text-base md:text-lg font-medium text-white mb-2">
                    {selectedTool.title === "Batch Processing" ? "Drop multiple images here" : "Drop your images here"}
                  </p>
                  <p className="text-xs sm:text-sm md:text-base text-gray-400 mb-3 md:mb-4">
                    {selectedTool.title === "Batch Processing"
                      ? "or click to select multiple files"
                      : "or click to browse your files"}
                  </p>
                  <Button className="bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600 text-sm md:text-base px-4 md:px-6 py-2 md:py-3">
                    <Plus className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                    {selectedTool.title === "Batch Processing" ? "Choose Multiple Files" : "Choose Files"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Format Converter Options */}
            {selectedTool.title === "Format Converter" && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-3 md:p-4">
                <h3 className="text-white font-medium mb-2 md:mb-3 text-sm md:text-base">Output Format</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {["JPG", "PNG", "WebP", "HEIC", "BMP", "TIFF"].map((format) => (
                    <button
                      key={format}
                      className="px-2 md:px-3 py-2 bg-white/10 hover:bg-violet-500/20 text-white text-xs md:text-sm rounded-lg transition-colors border border-white/10 hover:border-violet-500/30"
                    >
                      {format}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Image Resizer Options */}
            {selectedTool.title === "Image Resizer" && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-3 md:p-4">
                <h3 className="text-white font-medium mb-2 md:mb-3 text-sm md:text-base">Resize Options</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {["25%", "50%", "75%", "150%", "200%", "Custom"].map((size) => (
                      <button
                        key={size}
                        className="px-2 md:px-3 py-2 bg-white/10 hover:bg-violet-500/20 text-white text-xs md:text-sm rounded-lg transition-colors border border-white/10 hover:border-violet-500/30"
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Width (px)</label>
                      <input
                        type="number"
                        placeholder="1920"
                        className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-gray-400 rounded-lg focus:ring-2 focus:ring-violet-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Height (px)</label>
                      <input
                        type="number"
                        placeholder="1080"
                        className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-gray-400 rounded-lg focus:ring-2 focus:ring-violet-500 text-sm"
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-xs sm:text-sm text-gray-300">
                    <input type="checkbox" className="rounded border-white/20 bg-white/10" defaultChecked />
                    Maintain aspect ratio
                  </label>
                </div>
              </div>
            )}

            {/* Image Rotator Options */}
            {selectedTool.title === "Image Rotator" && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-3 md:p-4">
                <h3 className="text-white font-medium mb-2 md:mb-3 text-sm md:text-base">Rotation Angle</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {["90° Clockwise", "90° Counter-CW", "180° Flip", "270° Clockwise"].map((angle) => (
                      <button
                        key={angle}
                        className="px-2 md:px-3 py-2 bg-white/10 hover:bg-violet-500/20 text-white text-xs md:text-sm rounded-lg transition-colors border border-white/10 hover:border-violet-500/30"
                      >
                        {angle}
                      </button>
                    ))}
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Custom Angle (degrees)</label>
                    <input
                      type="number"
                      placeholder="45"
                      min="-360"
                      max="360"
                      className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-gray-400 rounded-lg focus:ring-2 focus:ring-violet-500 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedTool.title === "Image Compressor" && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
                <h3 className="text-white font-medium mb-3 text-sm md:text-base">Compression Level</h3>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="10"
                    max="100"
                    defaultValue="80"
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>High Compression</span>
                    <span>Quality: 80%</span>
                    <span>Low Compression</span>
                  </div>
                </div>
              </div>
            )}

            {/* Add Watermark Options */}
            {selectedTool.title === "Add Watermark" && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-3 md:p-4">
                <h3 className="text-white font-medium mb-2 md:mb-3 text-sm md:text-base">Watermark Options</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button className="px-2 md:px-3 py-2 bg-white/10 hover:bg-violet-500/20 text-white text-xs md:text-sm rounded-lg transition-colors border border-white/10 hover:border-violet-500/30">
                      Text Watermark
                    </button>
                    <button className="px-2 md:px-3 py-2 bg-white/10 hover:bg-violet-500/20 text-white text-xs md:text-sm rounded-lg transition-colors border border-white/10 hover:border-violet-500/30">
                      Image Watermark
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter watermark text..."
                    className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-gray-400 rounded-lg focus:ring-2 focus:ring-violet-500 text-sm"
                  />
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {["Top Left", "Top Right", "Center", "Bottom Left", "Bottom Right", "Custom"].map((pos) => (
                      <button
                        key={pos}
                        className="px-2 py-1 bg-white/10 hover:bg-violet-500/20 text-white text-xs rounded-lg transition-colors border border-white/10 hover:border-violet-500/30"
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedTool.title === "AI Enhancement" && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
                <h3 className="text-white font-medium mb-3 text-sm md:text-base">Enhancement Options</h3>
                <div className="space-y-2">
                  {[
                    "Super Resolution (2x)",
                    "Super Resolution (4x)",
                    "Noise Reduction",
                    "Sharpening",
                    "Color Enhancement",
                  ].map((option) => (
                    <label key={option} className="flex items-center gap-2 text-sm text-gray-300">
                      <input type="checkbox" className="rounded border-white/20 bg-white/10" />
                      {option}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {selectedTool.title === "Batch Processing" && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
                <h3 className="text-white font-medium mb-3 text-sm md:text-base">Batch Operations</h3>
                <div className="space-y-3">
                  <select className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg focus:ring-2 focus:ring-violet-500 text-sm">
                    <option value="">Select operation...</option>
                    <option value="resize">Resize All</option>
                    <option value="convert">Format Convert</option>
                    <option value="compress">Compress All</option>
                    <option value="watermark">Add Watermark</option>
                    <option value="rotate">Rotate All</option>
                  </select>
                  <label className="flex items-center gap-2 text-sm text-gray-300">
                    <input type="checkbox" className="rounded border-white/20 bg-white/10" />
                    Apply same settings to all images
                  </label>
                </div>
              </div>
            )}

            {selectedTool.title === "OCR Text Extract" && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
                <h3 className="text-white font-medium mb-3 text-sm md:text-base">OCR Settings</h3>
                <div className="space-y-3">
                  <select className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg focus:ring-2 focus:ring-violet-500 text-sm">
                    <option value="auto">Auto-detect Language</option>
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="zh">Chinese</option>
                  </select>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="px-3 py-2 bg-white/10 hover:bg-violet-500/20 text-white text-xs md:text-sm rounded-lg transition-colors border border-white/10 hover:border-violet-500/30">
                      Extract to TXT
                    </button>
                    <button className="px-3 py-2 bg-white/10 hover:bg-violet-500/20 text-white text-xs md:text-sm rounded-lg transition-colors border border-white/10 hover:border-violet-500/30">
                      Extract to DOCX
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-3 md:p-4">
                <h3 className="text-white font-medium mb-2 md:mb-3 text-sm md:text-base">Uploaded Files</h3>
                <div className="space-y-2">
                  {uploadedFiles.map((fileName, index) => (
                    <div key={index} className="flex items-center gap-2 md:gap-3 p-2 bg-white/5 rounded-lg">
                      <ImageIcon className="w-4 h-4 text-violet-400 flex-shrink-0" />
                      <span className="text-white text-xs md:text-sm flex-1 truncate">{fileName}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setUploadedFiles((prev) => prev.filter((_, i) => i !== index))}
                        className="p-1 h-auto min-w-0"
                      >
                        <X className="w-3 h-3 md:w-4 md:h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button className="w-full mt-3 md:mt-4 bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600 text-sm md:text-base py-2 md:py-3">
                  Process Images ⚡
                </Button>
              </div>
            )}

            {/* Image Preview */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-3 md:p-4 lg:p-6">
              <div className="flex items-center gap-2 mb-3 md:mb-4">
                <Eye className="w-4 h-4 md:w-5 md:h-5 text-cyan-400" />
                <h3 className="text-white font-medium text-sm md:text-base">Image Preview</h3>
              </div>
              <div className="aspect-square bg-white/10 rounded-lg flex items-center justify-center relative overflow-hidden">
                {uploadedFiles.length > 0 ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <ImageIcon className="w-12 h-12 md:w-16 md:h-16 text-violet-400 mx-auto mb-2" />
                      <p className="text-white text-sm">Image Preview</p>
                      <p className="text-gray-400 text-xs">Original image will appear here</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 text-xs sm:text-sm md:text-base text-center px-4">
                    Upload images to see preview
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Image Conversions */}
        <div className="mt-6 md:mt-8 lg:mt-12 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-3 md:p-4 lg:p-6">
          <h3 className="text-white font-medium mb-3 md:mb-4 text-sm md:text-base">Recent Image Conversions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
            {[
              { name: "photo.jpg", action: "Resized", time: "2 min ago", format: "JPG" },
              { name: "screenshot.png", action: "Converted to WebP", time: "5 min ago", format: "WebP" },
              { name: "document.tiff", action: "OCR Extracted", time: "8 min ago", format: "TXT" },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-white/5 rounded-lg">
                <ImageIcon className="w-6 h-6 md:w-8 md:h-8 text-violet-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs md:text-sm font-medium truncate">{item.name}</p>
                  <p className="text-gray-400 text-xs">
                    {item.action} • {item.time}
                  </p>
                </div>
                <div className="flex items-center gap-1 md:gap-2">
                  <span className="text-xs text-violet-400 bg-violet-500/20 px-1.5 md:px-2 py-0.5 md:py-1 rounded">
                    {item.format}
                  </span>
                  <Button size="sm" variant="ghost" className="p-1 h-auto min-w-0">
                    <Download className="w-3 h-3 md:w-4 md:h-4" />
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
