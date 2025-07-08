"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
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
  Trash2,
  Search,
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

// Add interface for recent conversion
interface RecentConversion {
  id: string
  name: string
  action: string
  time: string
  timestamp: number
  type: string
  data?: {
    extractedText?: string
    files?: string[]
    message?: string
    fileData?: string // base64 encoded file data
    fileName?: string // original filename for download
    mimeType?: string // MIME type for proper download
  }
}

export function PDFHub() {
  const [selectedTool, setSelectedTool] = useState(pdfTools[0])
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [password, setPassword] = useState("")
  const [copiedText, setCopiedText] = useState(false)
  const [recentConversions, setRecentConversions] = useState<RecentConversion[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Clear results when switching tools
  useEffect(() => {
    setResult(null)
    setUploadedFiles([])
    setPassword("")
    setCopiedText(false)
  }, [selectedTool.type])

  // Load recent conversions from localStorage on component mount
  useEffect(() => {
    const loadRecentConversions = () => {
      try {
        const stored = localStorage.getItem('recentPdfConversions')
        if (stored) {
          const conversions = JSON.parse(stored)
          // Migrate old data structure to new structure
          const migratedConversions = conversions.map((conv: any) => ({
            ...conv,
            type: conv.type || 'unknown', // Add default type for old entries
            data: conv.data || undefined
          }))
          setRecentConversions(migratedConversions)
        }
      } catch (error) {
        console.error('Error loading recent conversions:', error)
      }
    }
    loadRecentConversions()
  }, [])

  // Save recent conversion to localStorage
  const saveRecentConversion = (fileName: string, action: string, type: string, data?: any) => {
    try {
      const newConversion: RecentConversion = {
        id: Date.now().toString(),
        name: fileName,
        action: action,
        time: formatTimeAgo(new Date()),
        timestamp: Date.now(),
        type: type,
        data: data
      }

      const stored = localStorage.getItem('recentPdfConversions')
      let conversions: RecentConversion[] = stored ? JSON.parse(stored) : []
      
      // Add new conversion to the beginning and keep only the last 10
      conversions.unshift(newConversion)
      conversions = conversions.slice(0, 10)
      
      localStorage.setItem('recentPdfConversions', JSON.stringify(conversions))
      setRecentConversions(conversions)
    } catch (error) {
      console.error('Error saving recent conversion:', error)
    }
  }

  // Clear all recent conversions
  const clearAllConversions = () => {
    try {
      localStorage.removeItem('recentPdfConversions')
      setRecentConversions([])
    } catch (error) {
      console.error('Error clearing recent conversions:', error)
    }
  }

  // Preview file function
  const handleRecentConversionPreview = async (conversion: RecentConversion) => {
    if (conversion.data?.fileData && conversion.data?.fileName) {
      try {
        // Convert base64 to blob
        const byteCharacters = atob(conversion.data.fileData)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { 
          type: conversion.data.mimeType || 'application/pdf' 
        })
        
        // Create blob URL and open in new tab
        const url = window.URL.createObjectURL(blob)
        const newWindow = window.open(url, '_blank')
        
        // Clean up the URL after a delay to prevent memory leaks
        if (newWindow) {
          newWindow.onload = () => {
            setTimeout(() => {
              window.URL.revokeObjectURL(url)
            }, 1000)
          }
        } else {
          // If popup was blocked, clean up immediately and show message
          window.URL.revokeObjectURL(url)
          alert('Preview blocked by popup blocker. Please allow popups for this site or use the download button.')
        }
      } catch (error) {
        console.error('Error previewing file:', error)
        alert('Error previewing file. The file data may be corrupted.')
      }
    } else {
      alert('File data is not available for preview. Please reprocess the file to enable preview.')
    }
  }



  // Unified download function for all entries
  const handleRecentConversionDownload = async (conversion: RecentConversion) => {
    if (conversion.data?.fileData && conversion.data?.fileName) {
      try {
        // Convert base64 to blob
        const byteCharacters = atob(conversion.data.fileData)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { 
          type: conversion.data.mimeType || 'application/pdf' 
        })
        
        // Create download link
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = conversion.data.fileName
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } catch (error) {
        console.error('Error downloading file:', error)
        alert('Error downloading file. The file data may be corrupted.')
      }
    } else {
      // Fallback for legacy entries without stored file data
      alert(`This file was processed previously. The original file data is not available for download.\n\nTo re-download this file, please process it again using the PDF tools above.`)
    }
  }

  // Handle recent conversion actions (legacy)
  const handleRecentConversionAction = async (conversion: RecentConversion) => {
    switch (conversion.type) {
      case 'extract-text':
      case 'ocr':
        // Redirect to unified download function
        await handleRecentConversionDownload(conversion)
        break
      case 'split':
        if (conversion.data?.files) {
          alert(`Split operation completed. Files created: ${conversion.data.files.join(', ')}\n\nNote: You can download the original PDF file using the download button.`)
        } else {
          alert('Split operation was completed successfully.')
        }
        break
      case 'encrypt':
      case 'compress':
      case 'merge':
      case 'docx-to-pdf':
        // Redirect to unified download function
        await handleRecentConversionDownload(conversion)
        break
      case 'unknown':
        // Handle legacy entries without type information
        alert(`This file was processed previously. Check your downloads folder if it was a downloaded file.`)
        break
      default:
        alert(`Unknown conversion type: ${conversion.type}`)
        break
    }
  }



  // Helper function to convert blob to base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const base64String = reader.result as string
        // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
        const base64Data = base64String.split(',')[1]
        resolve(base64Data)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  // Format time ago helper function
  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return `${diffInSeconds} sec ago`
    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} hr ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  }

  // Update time displays every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setRecentConversions(prev => 
        prev.map(conv => ({
          ...conv,
          time: formatTimeAgo(new Date(conv.timestamp))
        }))
      )
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

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
    
    if (selectedTool.type === 'merge') {
      // For merge tool, add new files to existing ones (upload separately)
      setUploadedFiles(prev => {
        const newFiles = files.filter(newFile => 
          !prev.some(existingFile => 
            existingFile.name === newFile.name && existingFile.size === newFile.size
          )
        )
        return [...prev, ...newFiles]
      })
    } else {
      // For other tools, replace existing files
      setUploadedFiles(files)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      
      if (selectedTool.type === 'merge') {
        // For merge tool, add new files to existing ones (upload separately)
        setUploadedFiles(prev => {
          const newFiles = files.filter(newFile => 
            !prev.some(existingFile => 
              existingFile.name === newFile.name && existingFile.size === newFile.size
            )
          )
          return [...prev, ...newFiles]
        })
      } else {
        // For other tools, replace existing files
        setUploadedFiles(files)
      }
    }
    
    // Reset the input value so the same file can be selected again if needed
    if (e.target) {
      e.target.value = ''
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
            if (result.success !== false) {
              // Store the original PDF file for download
              const fileReader = new FileReader()
              fileReader.onload = async () => {
                const base64Data = (fileReader.result as string).split(',')[1]
                saveRecentConversion(
                  uploadedFiles[0].name, 
                  "Text Extracted", 
                  "extract-text",
                  { 
                    extractedText: result.full_text,
                    fileData: base64Data,
                    fileName: uploadedFiles[0].name,
                    mimeType: 'application/pdf'
                  }
                )
              }
              fileReader.readAsDataURL(uploadedFiles[0])
            }
          }
          break

        case "ocr":
          if (uploadedFiles[0]) {
            try {
              const result = await ApiClient.ocrImage(uploadedFiles[0])
              setResult(result)
              if (result.success !== false) {
                // Store the original image file for download
                const fileReader = new FileReader()
                fileReader.onload = async () => {
                  const base64Data = (fileReader.result as string).split(',')[1]
                  saveRecentConversion(
                    uploadedFiles[0].name, 
                    "OCR Processed", 
                    "ocr",
                    { 
                      extractedText: result.extracted_text,
                      fileData: base64Data,
                      fileName: uploadedFiles[0].name,
                      mimeType: uploadedFiles[0].type
                    }
                  )
                }
                fileReader.readAsDataURL(uploadedFiles[0])
              }
            } catch (ocrError: any) {
              // Check if it's a Tesseract-specific error
              if (ApiClient.isTesseractError(ocrError)) {
                const tesseractDetails = ApiClient.getTesseractErrorDetails(ocrError)
                if (tesseractDetails) {
                  setResult({ 
                    success: false, 
                    error: "Tesseract OCR Not Installed",
                    tesseractError: true,
                    details: {
                      message: tesseractDetails.message,
                      instructions: tesseractDetails.installation_instructions,
                      downloadUrl: tesseractDetails.download_url
                    }
                  })
                } else {
                  setResult({ success: false, error: ocrError.message, tesseractError: true })
                }
              } else {
                setResult({ success: false, error: ocrError.message })
              }
              return // Don't let this error bubble up to the main catch block
            }
          }
          break

        case "encrypt":
          if (uploadedFiles[0] && password) {
            const response = await ApiClient.encryptPdf(uploadedFiles[0], password)
            const fileName = `encrypted_${uploadedFiles[0].name}`
            
            // Clone response BEFORE consuming it
            const downloadResponse = response.clone()
            
            // Convert response to base64 for localStorage
            const blob = await response.blob()
            const base64Data = await blobToBase64(blob)
            
            // Download the file immediately using the cloned response
            await ApiClient.downloadFile(downloadResponse, fileName)
            
            setResult({ success: true, message: "PDF encrypted and downloaded successfully" })
            saveRecentConversion(
              uploadedFiles[0].name, 
              "Encrypted", 
              "encrypt",
              {
                fileData: base64Data,
                fileName: fileName,
                mimeType: 'application/pdf'
              }
            )
          } else {
            alert("Please provide a password for encryption")
            return
          }
          break

        case "docx-to-pdf":
          if (uploadedFiles[0]) {
            const response = await ApiClient.convertDocxToPdf(uploadedFiles[0])
            const fileName = uploadedFiles[0].name.replace('.docx', '.pdf')
            
            // Clone response BEFORE consuming it
            const downloadResponse = response.clone()
            
            // Convert response to base64 for localStorage
            const blob = await response.blob()
            const base64Data = await blobToBase64(blob)
            
            // Download the file immediately using the cloned response
            await ApiClient.downloadFile(downloadResponse, fileName)
            
            setResult({ success: true, message: "DOCX converted to PDF and downloaded successfully" })
            saveRecentConversion(
              uploadedFiles[0].name, 
              "Converted to PDF", 
              "docx-to-pdf",
              {
                fileData: base64Data,
                fileName: fileName,
                mimeType: 'application/pdf'
              }
            )
          }
          break

        case "merge":
          if (uploadedFiles.length >= 2) {
            const response = await ApiClient.mergePdfs(uploadedFiles)
            const fileName = `merged_${uploadedFiles.length}_files.pdf`
            
            // Clone response BEFORE consuming it
            const downloadResponse = response.clone()
            
            // Convert response to base64 for localStorage
            const blob = await response.blob()
            const base64Data = await blobToBase64(blob)
            
            // Download the file immediately using the cloned response
            await ApiClient.downloadFile(downloadResponse, fileName)
            
            setResult({ 
              success: true, 
              message: `Successfully merged ${uploadedFiles.length} PDF files and downloaded as "${fileName}"`,
              mergeInfo: {
                totalFiles: uploadedFiles.length,
                fileNames: uploadedFiles.map(f => f.name)
              }
            })
            saveRecentConversion(
              fileName, 
              `Merged ${uploadedFiles.length} files`, 
              "merge",
              {
                fileData: base64Data,
                fileName: fileName,
                mimeType: 'application/pdf'
              }
            )
          } else {
            setResult({ 
              success: false, 
              error: `Cannot merge: Only ${uploadedFiles.length} file${uploadedFiles.length !== 1 ? 's' : ''} uploaded. Please upload at least 2 PDF files.` 
            })
            return
          }
          break

        case "split":
          if (uploadedFiles[0]) {
            const result = await ApiClient.splitPdf(uploadedFiles[0])
            setResult(result)
            if (result.success !== false) {
              // Store the original PDF file for download
              const fileReader = new FileReader()
              fileReader.onload = async () => {
                const base64Data = (fileReader.result as string).split(',')[1]
                saveRecentConversion(
                  uploadedFiles[0].name, 
                  "Split", 
                  "split",
                  { 
                    files: result.files, 
                    message: result.message,
                    fileData: base64Data,
                    fileName: uploadedFiles[0].name,
                    mimeType: 'application/pdf'
                  }
                )
              }
              fileReader.readAsDataURL(uploadedFiles[0])
            }
          }
          break

        case "compress":
          if (uploadedFiles[0]) {
            const response = await ApiClient.compressPdf(uploadedFiles[0])
            const fileName = `compressed_${uploadedFiles[0].name}`
            
            // Clone response BEFORE consuming it
            const downloadResponse = response.clone()
            
            // Convert response to base64 for localStorage
            const blob = await response.blob()
            const base64Data = await blobToBase64(blob)
            
            // Download the file immediately using the cloned response
            await ApiClient.downloadFile(downloadResponse, fileName)
            
            setResult({ success: true, message: "PDF compressed and downloaded successfully" })
            saveRecentConversion(
              uploadedFiles[0].name, 
              "Compressed", 
              "compress",
              {
                fileData: base64Data,
                fileName: fileName,
                mimeType: 'application/pdf'
              }
            )
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
                    {selectedTool.type === 'merge' ? 'Drop PDF files here one by one to merge' : 
                     `Drop your ${selectedTool.type === 'ocr' ? 'image' : selectedTool.type === 'docx-to-pdf' ? 'DOCX' : 'PDF'} files here`}
                  </p>
                  <p className="text-gray-400 mb-4">or click to browse your files</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    multiple={false}
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
                    {selectedTool.type === 'merge' ? 'Add PDF File' : 'Choose Files'}
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
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-medium">Uploaded Files</h3>
                  {selectedTool.type === 'merge' && (
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      uploadedFiles.length >= 2 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {uploadedFiles.length >= 2 ? '✓ Ready to merge' : `Need ${2 - uploadedFiles.length} more file${2 - uploadedFiles.length > 1 ? 's' : ''}`}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                      {selectedTool.type === 'merge' && (
                        <span className="text-cyan-400 font-mono text-xs w-6">{index + 1}.</span>
                      )}
                      <FileText className="w-4 h-4 text-violet-400" />
                      <span className="text-white text-sm flex-1">{file.name}</span>
                      <span className="text-gray-400 text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setUploadedFiles((prev) => prev.filter((_, i) => i !== index))}
                        title="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Add More Files button for merge mode */}
                {selectedTool.type === 'merge' && (
                  <div className="flex gap-2 mt-3">
                    <Button 
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      size="sm"
                      className="flex-1 border-violet-500/50 text-violet-400 hover:bg-violet-500/10"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add More PDF Files
                    </Button>
                    <Button 
                      onClick={() => setUploadedFiles([])}
                      variant="outline"
                      size="sm"
                      className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                      title="Clear all files"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                {/* Validation message for merge */}
                {selectedTool.type === 'merge' && uploadedFiles.length < 2 && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mt-4">
                    <p className="text-red-300 text-sm">
                      ⚠️ Please upload at least 2 PDF files to merge them together
                    </p>
                  </div>
                )}

                <Button 
                  onClick={processFiles}
                  disabled={processing || (selectedTool.type === 'merge' && uploadedFiles.length < 2)}
                  className="w-full mt-4 bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600 disabled:opacity-50"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : selectedTool.type === 'merge' && uploadedFiles.length < 2 ? (
                    <>
                      Upload More Files ({uploadedFiles.length}/2)
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
                <h3 className="text-white font-medium">Results - {selectedTool.title}</h3>
                <div className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-full ml-2">
                  {selectedTool.type}
                </div>
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
                    
                    {result.error && !result.tesseractError && (
                      <p className="text-red-400">{result.error}</p>
                    )}
                    
                    {/* Special handling for Tesseract OCR errors */}
                    {result.tesseractError && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">!</span>
                          </div>
                          <h4 className="text-red-400 font-medium">OCR Service Not Available</h4>
                        </div>
                        
                        <p className="text-red-300">{result.error}</p>
                        
                        {result.details && (
                          <div className="space-y-3">
                            <p className="text-white">{result.details.message}</p>
                            
                            <div className="bg-black/20 rounded p-3">
                              <h5 className="text-white font-medium mb-2">Installation Instructions:</h5>
                              <ol className="text-gray-300 text-sm space-y-1">
                                {result.details.instructions.map((instruction: string, index: number) => (
                                  <li key={index} className="flex gap-2">
                                    <span className="text-cyan-400 font-mono">{index + 1}.</span>
                                    <span>{instruction}</span>
                                  </li>
                                ))}
                              </ol>
                            </div>
                            
                            {result.details.downloadUrl && (
                              <div className="flex items-center gap-3">
                                <Button
                                  size="sm"
                                  onClick={() => window.open(result.details.downloadUrl, '_blank')}
                                  className="bg-cyan-500 hover:bg-cyan-600 text-white"
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Download Tesseract OCR
                                </Button>
                                <span className="text-gray-400 text-sm">Opens official download page</span>
                              </div>
                            )}
                            
                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-3">
                              <p className="text-yellow-300 text-sm">
                                💡 <strong>Quick Setup:</strong> Run <code className="bg-black/30 px-2 py-1 rounded">python backend/setup_tesseract.py</code> in your project directory for automated installation.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
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
                    
                    {result.mergeInfo && (
                      <div>
                        <h4 className="text-white font-medium mb-2">Merge Details:</h4>
                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                          <p className="text-green-300 text-sm mb-2">
                            📎 Successfully merged {result.mergeInfo.totalFiles} PDF files
                          </p>
                          <div className="space-y-1">
                            <p className="text-gray-300 text-xs font-medium">Files merged (in order):</p>
                            {result.mergeInfo.fileNames.map((fileName: string, index: number) => (
                              <div key={index} className="flex items-center gap-2 text-xs">
                                <span className="text-cyan-400 font-mono">{index + 1}.</span>
                                <span className="text-gray-300">{fileName}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center mt-16">
                    <div className="w-12 h-12 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <selectedTool.icon className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-400 text-lg font-medium mb-1">Ready for {selectedTool.title}</p>
                    <p className="text-gray-500 text-sm">
                      {selectedTool.type === 'merge' 
                        ? 'Upload PDF files one by one, then process to merge them' 
                        : 'Upload files and process to see results here'
                      }
                    </p>
                    <p className="text-gray-600 text-xs mt-2">Results will clear when switching tools</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Conversions */}
        <div className="mt-12 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-medium">Recent PDF Conversions</h3>
            {recentConversions.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={clearAllConversions}
                className="text-gray-400 hover:text-red-400 hover:bg-red-400/10 h-8 px-3"
                title="Clear all conversions"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentConversions.length > 0 ? (
              recentConversions.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <FileText className="w-8 h-8 text-orange-400" />
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{item.name}</p>
                    <p className="text-gray-400 text-xs">
                      {item.action} • {item.time}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {/* Preview button - shows for entries with file data */}
                    {item.data?.fileData && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleRecentConversionPreview(item)}
                        title="Preview file"
                        className="h-8 w-8 p-0 text-gray-400 hover:text-blue-400"
                      >
                        <Search className="w-4 h-4" />
                      </Button>
                    )}
                    
                    {/* Download button - unified functionality for all entries */}
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleRecentConversionDownload(item)}
                      title="Download file"
                      className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    
                    {/* Info button for split operations */}
                    {item.type === 'split' && item.data?.files && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleRecentConversionAction(item)}
                        title="View split info"
                        className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-400">No recent conversions yet</p>
                <p className="text-gray-500 text-sm">Process some files to see them here</p>
              </div>
            )}
          </div>
        </div>


      </div>
    </div>
  )
}
