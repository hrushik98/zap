"use client"

import { useState, useCallback } from "react"
import { Upload, FileText, Download, Scissors, Archive, FileIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useApiClient } from "@/lib/api"
import { useDropzone } from "react-dropzone"

interface ConversionResult {
  success: boolean
  message: string
  conversion_id: string
  download_url: string
  file_info?: {
    filename: string
    size: number
    format: string
  }
}

export function PDFHub() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isConverting, setIsConverting] = useState(false)
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeOperation, setActiveOperation] = useState<'merge' | 'split' | 'compress' | 'to-word' | null>(null)
  
  const apiClient = useApiClient()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const pdfFiles = acceptedFiles.filter(file => file.type === 'application/pdf')
    setSelectedFiles(pdfFiles)
    setError(null)
    setConversionResult(null)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: true
  })

  const handleOperation = async (operation: 'merge' | 'split' | 'compress' | 'to-word') => {
    if (selectedFiles.length === 0) {
      setError('Please select PDF files first')
      return
    }

    if (operation !== 'merge' && selectedFiles.length > 1) {
      setError(`${operation} operation only supports single file`)
      return
    }

    setIsConverting(true)
    setError(null)
    setActiveOperation(operation)

    try {
      let result: ConversionResult

      switch (operation) {
        case 'merge':
          if (selectedFiles.length < 2) {
            throw new Error('Merge operation requires at least 2 files')
          }
          result = await apiClient.mergePDFs(selectedFiles)
          break
        
        case 'to-word':
          result = await apiClient.pdfToWord(selectedFiles[0])
          break
        
        case 'split':
          // For now, split all pages (could add UI for specific pages later)
          result = await apiClient.splitPDF(selectedFiles[0])
          break
        
        case 'compress':
          // Using default quality of 80 (could add UI for quality selection later)
          result = await apiClient.compressPDF(selectedFiles[0], 80)
          break
        
        default:
          throw new Error('Unknown operation')
      }

      setConversionResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed')
    } finally {
      setIsConverting(false)
      setActiveOperation(null)
    }
  }

  const handleDownload = async () => {
    if (conversionResult?.download_url) {
      try {
        // The download URL is relative to the API base, so we need to construct the full URL
        const fullUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'}${conversionResult.download_url}`
        
        // Get the token and fetch with authentication
        const token = await apiClient.getToken()
        const response = await fetch(fullUrl, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
        
        if (!response.ok) throw new Error('Download failed')
        
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = conversionResult.file_info?.filename || 'converted-file.pdf'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } catch (err) {
        setError('Download failed')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-violet-900 p-8 md:ml-72">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">PDF Hub 📄</h1>
              <p className="text-purple-200">All your PDF needs in one place</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Tool Selection */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Choose Your Tool</h2>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Merge PDFs */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <FileIcon className="w-8 h-8 text-blue-400" />
                  <h3 className="text-xl font-semibold text-white">Merge PDFs</h3>
                </div>
                <p className="text-gray-300 text-sm mb-4">Combine multiple PDFs into one</p>
                <span className="text-blue-300 text-xs">~30 sec</span>
                <Button
                  onClick={() => handleOperation('merge')}
                  disabled={isConverting || selectedFiles.length < 2}
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                >
                  {isConverting && activeOperation === 'merge' ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Merge PDFs
                </Button>
              </div>

              {/* Split PDF */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <Scissors className="w-8 h-8 text-green-400" />
                  <h3 className="text-xl font-semibold text-white">Split PDF</h3>
                </div>
                <p className="text-gray-300 text-sm mb-4">Extract pages or split into multiple files</p>
                <span className="text-green-300 text-xs">~20 sec</span>
                <Button
                  onClick={() => handleOperation('split')}
                  disabled={isConverting || selectedFiles.length !== 1}
                  className="w-full mt-4 bg-green-600 hover:bg-green-700"
                >
                  {isConverting && activeOperation === 'split' ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Split PDF
                </Button>
              </div>

              {/* PDF to Word */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="w-8 h-8 text-orange-400" />
                  <h3 className="text-xl font-semibold text-white">PDF to Word</h3>
                </div>
                <p className="text-gray-300 text-sm mb-4">Convert PDF to editable Word document</p>
                <span className="text-orange-300 text-xs">~45 sec</span>
                <Button
                  onClick={() => handleOperation('to-word')}
                  disabled={isConverting || selectedFiles.length !== 1}
                  className="w-full mt-4 bg-orange-600 hover:bg-orange-700"
                >
                  {isConverting && activeOperation === 'to-word' ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Convert to Word
                </Button>
              </div>

              {/* Compress PDF */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <Archive className="w-8 h-8 text-red-400" />
                  <h3 className="text-xl font-semibold text-white">Compress PDF</h3>
                </div>
                <p className="text-gray-300 text-sm mb-4">Reduce file size without losing quality</p>
                <span className="text-red-300 text-xs">~25 sec</span>
                <Button
                  onClick={() => handleOperation('compress')}
                  disabled={isConverting || selectedFiles.length !== 1}
                  className="w-full mt-4 bg-red-600 hover:bg-red-700"
                >
                  {isConverting && activeOperation === 'compress' ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Compress PDF
                </Button>
              </div>
            </div>
          </div>

          {/* File Upload & Results */}
          <div className="space-y-6">
            {/* File Upload */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
              <h3 className="text-xl font-semibold text-white mb-4">Upload PDFs</h3>
              
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  isDragActive 
                    ? 'border-orange-400 bg-orange-400/10' 
                    : 'border-white/20 hover:border-orange-400/50 hover:bg-orange-400/5'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                <p className="text-white mb-2">Drop your PDF files here</p>
                <p className="text-gray-400 text-sm">or click to browse your files</p>
              </div>

              {/* Selected Files */}
              {selectedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-white font-medium">Selected Files:</h4>
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 bg-white/5 rounded-lg p-2">
                      <FileText className="w-4 h-4 text-orange-400" />
                      <span className="text-white text-sm flex-1">{file.name}</span>
                      <span className="text-gray-400 text-xs">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Results */}
            {conversionResult && (
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <h3 className="text-xl font-semibold text-white mb-4">✅ Conversion Complete</h3>
                <p className="text-gray-300 mb-4">{conversionResult.message}</p>
                
                {conversionResult.file_info && (
                  <div className="bg-white/5 rounded-lg p-4 mb-4">
                    <p className="text-white font-medium">{conversionResult.file_info.filename}</p>
                    <p className="text-gray-400 text-sm">
                      Size: {(conversionResult.file_info.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}
                
                <Button
                  onClick={handleDownload}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Result
                </Button>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {/* Live Preview placeholder */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <h3 className="text-white font-medium">Live Preview</h3>
              </div>
              
              {selectedFiles.length > 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                  <p className="text-gray-300">
                    {selectedFiles.length} PDF file{selectedFiles.length > 1 ? 's' : ''} ready for processing
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">Upload files to see preview</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
