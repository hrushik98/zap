"use client"

import type React from "react"

import { useState, useRef } from "react"
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
  Loader2,
  ImageIcon,
  Copy,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ApiClient } from "@/lib/api"

const pdfTools = [
  {
    icon: FileText,
    title: "Extract Text",
    desc: "Extract text content from PDF files",
    color: "from-blue-500 to-cyan-500",
    time: "~10 sec",
    type: "extract-text"
  },
  {
    icon: ImageIcon,
    title: "OCR Image",
    desc: "Extract text from images using OCR",
    color: "from-green-500 to-emerald-500", 
    time: "~15 sec",
    type: "ocr"
  },
  {
    icon: Lock,
    title: "Password Protect",
    desc: "Secure your PDFs with encryption",
    color: "from-red-500 to-pink-500",
    time: "~15 sec",
    type: "encrypt"
  },
  {
    icon: FileText,
    title: "DOCX to PDF",
    desc: "Convert Word documents to PDF",
    color: "from-orange-500 to-red-500",
    time: "~20 sec",
    type: "docx-to-pdf"
  },
  {
    icon: Merge,
    title: "Merge PDFs",
    desc: "Combine multiple PDFs into one",
    color: "from-purple-500 to-pink-500",
    time: "~30 sec",
    type: "merge"
  },
  {
    icon: Split,
    title: "Split PDF",
    desc: "Split PDF into individual pages",
    color: "from-indigo-500 to-purple-500",
    time: "~20 sec",
    type: "split"
  },
  {
    icon: Compress,
    title: "Compress PDF",
    desc: "Reduce file size without losing quality",
    color: "from-yellow-500 to-orange-500",
    time: "~25 sec",
    type: "compress"
  },
]

export function PDFHub() {
  const [selectedTool, setSelectedTool] = useState(pdfTools[0])
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [password, setPassword] = useState("")
  const [copiedText, setCopiedText] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    setUploadedFiles(files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setUploadedFiles(files)
    }
  }

  const processFiles = async () => {
    if (uploadedFiles.length === 0) return

    setProcessing(true)
    setResult(null)

    try {
      switch (selectedTool.type) {
        case "extract-text":
          if (uploadedFiles[0]) {
            const result = await ApiClient.extractTextFromPdf(uploadedFiles[0])
            setResult(result)
          }
          break

        case "ocr":
          if (uploadedFiles[0]) {
            const result = await ApiClient.ocrImage(uploadedFiles[0])
            setResult(result)
          }
          break

        case "encrypt":
          if (uploadedFiles[0] && password) {
            const response = await ApiClient.encryptPdf(uploadedFiles[0], password)
            await ApiClient.downloadFile(response, `encrypted_${uploadedFiles[0].name}`)
            setResult({ success: true, message: "PDF encrypted and downloaded successfully" })
          } else {
            alert("Please provide a password for encryption")
            return
          }
          break

        case "docx-to-pdf":
          if (uploadedFiles[0]) {
            const response = await ApiClient.convertDocxToPdf(uploadedFiles[0])
            await ApiClient.downloadFile(response, uploadedFiles[0].name.replace('.docx', '.pdf'))
            setResult({ success: true, message: "DOCX converted to PDF and downloaded successfully" })
          }
          break

        case "merge":
          if (uploadedFiles.length >= 2) {
            const response = await ApiClient.mergePdfs(uploadedFiles)
            await ApiClient.downloadFile(response, "merged_document.pdf")
            setResult({ success: true, message: "PDFs merged and downloaded successfully" })
          } else {
            alert("Please upload at least 2 PDF files to merge")
            return
          }
          break

        case "split":
          if (uploadedFiles[0]) {
            const result = await ApiClient.splitPdf(uploadedFiles[0])
            setResult(result)
          }
          break

        case "compress":
          if (uploadedFiles[0]) {
            const response = await ApiClient.compressPdf(uploadedFiles[0])
            await ApiClient.downloadFile(response, `compressed_${uploadedFiles[0].name}`)
            setResult({ success: true, message: "PDF compressed and downloaded successfully" })
          }
          break
      }
    } catch (error: any) {
      setResult({ success: false, error: error.message })
    } finally {
      setProcessing(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(true)
      setTimeout(() => setCopiedText(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
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
                  <p className="text-lg font-medium text-white mb-2">
                    Drop your {selectedTool.type === 'ocr' ? 'image' : selectedTool.type === 'docx-to-pdf' ? 'DOCX' : 'PDF'} files here
                  </p>
                  <p className="text-gray-400 mb-4">or click to browse your files</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    multiple={selectedTool.type === 'merge'}
                    accept={
                      selectedTool.type === 'ocr' ? 'image/*' :
                      selectedTool.type === 'docx-to-pdf' ? '.docx' :
                      '.pdf'
                    }
                    className="hidden"
                  />
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Choose Files
                  </Button>
                </div>
              </div>
            </div>

            {/* Password Input for Encryption */}
            {selectedTool.type === 'encrypt' && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
                <label className="text-white font-medium mb-2 block">Password for Encryption</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="bg-white/10 border-white/20 text-white placeholder-white/60"
                />
              </div>
            )}

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
                <h3 className="text-white font-medium mb-3">Uploaded Files</h3>
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                      <FileText className="w-4 h-4 text-violet-400" />
                      <span className="text-white text-sm flex-1">{file.name}</span>
                      <span className="text-gray-400 text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
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

                <Button 
                  onClick={processFiles}
                  disabled={processing}
                  className="w-full mt-4 bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600 disabled:opacity-50"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Process Files ⚡
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Results Area */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-5 h-5 text-cyan-400" />
                <h3 className="text-white font-medium">Results</h3>
              </div>
              <div className="min-h-[200px] bg-white/10 rounded-lg p-4">
                {result ? (
                  <div className="space-y-4">
                    {result.success ? (
                      <div className="text-green-400 font-medium">✅ Success!</div>
                    ) : (
                      <div className="text-red-400 font-medium">❌ Error!</div>
                    )}
                    
                    {result.message && (
                      <p className="text-white">{result.message}</p>
                    )}
                    
                    {result.error && (
                      <p className="text-red-400">{result.error}</p>
                    )}
                    
                    {result.full_text && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white font-medium">Extracted Text:</h4>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(result.full_text)}
                            className="text-gray-400 hover:text-white h-8 w-8 p-0"
                          >
                            {copiedText ? (
                              <Check className="w-4 h-4 text-green-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                        <div className="bg-black/20 rounded p-3 max-h-64 overflow-y-auto">
                          <pre className="text-gray-300 text-sm whitespace-pre-wrap">{result.full_text}</pre>
                        </div>
                      </div>
                    )}
                    
                    {result.extracted_text && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white font-medium">OCR Result:</h4>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(result.extracted_text)}
                            className="text-gray-400 hover:text-white h-8 w-8 p-0"
                          >
                            {copiedText ? (
                              <Check className="w-4 h-4 text-green-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                        <div className="bg-black/20 rounded p-3 max-h-64 overflow-y-auto">
                          <pre className="text-gray-300 text-sm whitespace-pre-wrap">{result.extracted_text}</pre>
                        </div>
                      </div>
                    )}
                    
                    {result.files && (
                      <div>
                        <h4 className="text-white font-medium mb-2">Split Result:</h4>
                        <p className="text-gray-300">{result.message}</p>
                        <p className="text-gray-400 text-sm">Files created: {result.files.join(', ')}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center mt-20">Process files to see results here</p>
                )}
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
