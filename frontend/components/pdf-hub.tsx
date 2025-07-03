"use client"

import type React from "react"

import { useState } from "react"
import {
  FileText,
  Upload,
  Download,
  Merge,
  Split,
  Lock,
  FilePenLineIcon as Signature,
  FileArchiveIcon as Compress,
  Eye,
  Plus,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const pdfTools = [
  {
    icon: Merge,
    title: "Merge PDFs",
    desc: "Combine multiple PDFs into one",
    color: "from-blue-500 to-cyan-500",
    time: "~30 sec",
  },
  {
    icon: Split,
    title: "Split PDF",
    desc: "Extract pages or split into multiple files",
    color: "from-green-500 to-emerald-500",
    time: "~20 sec",
  },
  {
    icon: Signature,
    title: "Sign Documents",
    desc: "Add digital signatures and annotations",
    color: "from-purple-500 to-pink-500",
    time: "~1 min",
  },
  {
    icon: FileText,
    title: "PDF to Word",
    desc: "Convert PDF to editable Word document",
    color: "from-orange-500 to-red-500",
    time: "~45 sec",
  },
  {
    icon: Compress,
    title: "Compress PDF",
    desc: "Reduce file size without losing quality",
    color: "from-indigo-500 to-purple-500",
    time: "~25 sec",
  },
  {
    icon: Lock,
    title: "Password Protect",
    desc: "Secure your PDFs with encryption",
    color: "from-red-500 to-pink-500",
    time: "~15 sec",
  },
]

export function PDFHub() {
  const [selectedTool, setSelectedTool] = useState(pdfTools[0])
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
      <div className="p-8 md:ml-72">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">PDF Hub 🗂️</h1>
              <p className="text-gray-400">All your PDF needs in one place</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Tool Selection */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white mb-4">Choose Your Tool</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pdfTools.map((tool, index) => (
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
                  <h3 className="text-white font-medium mb-1">{tool.title}</h3>
                  <p className="text-sm text-gray-400 mb-2">{tool.desc}</p>
                  <span className="text-xs text-violet-400">{tool.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel - Work Area */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">{selectedTool.title}</h2>
              <div className={`px-3 py-1 rounded-full text-xs bg-gradient-to-r ${selectedTool.color} text-white`}>
                {selectedTool.time}
              </div>
            </div>

            {/* Drag and Drop Zone */}
            <div
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
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
                  <p className="text-lg font-medium text-white mb-2">Drop your PDF files here</p>
                  <p className="text-gray-400 mb-4">or click to browse your files</p>
                  <Button className="bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Choose Files
                  </Button>
                </div>
              </div>
            </div>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
                <h3 className="text-white font-medium mb-3">Uploaded Files</h3>
                <div className="space-y-2">
                  {uploadedFiles.map((fileName, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                      <FileText className="w-4 h-4 text-violet-400" />
                      <span className="text-white text-sm flex-1">{fileName}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setUploadedFiles((prev) => prev.filter((_, i) => i !== index))}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button className="w-full mt-4 bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600">
                  Process Files ⚡
                </Button>
              </div>
            )}

            {/* Preview Area */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-5 h-5 text-cyan-400" />
                <h3 className="text-white font-medium">Live Preview</h3>
              </div>
              <div className="aspect-[4/5] bg-white/10 rounded-lg flex items-center justify-center">
                <p className="text-gray-400">Upload files to see preview</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Conversions */}
        <div className="mt-12 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <h3 className="text-white font-medium mb-4">Recent PDF Conversions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: "contract.pdf", action: "Merged", time: "2 min ago" },
              { name: "report.pdf", action: "Compressed", time: "5 min ago" },
              { name: "invoice.pdf", action: "Signed", time: "12 min ago" },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <FileText className="w-8 h-8 text-orange-400" />
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{item.name}</p>
                  <p className="text-gray-400 text-xs">
                    {item.action} • {item.time}
                  </p>
                </div>
                <Button size="sm" variant="ghost">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
