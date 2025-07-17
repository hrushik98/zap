"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
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
  Clock,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ApiClient } from "@/lib/api"

const audioTools = [
  {
    icon: FileAudio,
    title: "Format Converter",
    desc: "Convert between MP3, WAV, FLAC, AAC, OGG, M4A",
    color: "from-green-500 to-emerald-500",
    time: "~30 sec",
    formats: "6 formats",
    type: "convert"
  },
  {
    icon: Scissors,
    title: "Audio Trimmer",
    desc: "Cut and trim audio files with precision",
    color: "from-blue-500 to-cyan-500",
    time: "~20 sec",
    formats: "Timeline editor",
    type: "trim"
  },
  {
    icon: Merge,
    title: "Audio Merger",
    desc: "Combine multiple audio files into one",
    color: "from-purple-500 to-pink-500",
    time: "~45 sec",
    formats: "Multi-file",
    type: "merge"
  },
  {
    icon: Volume2,
    title: "Volume Adjuster",
    desc: "Boost or reduce audio volume levels",
    color: "from-orange-500 to-red-500",
    time: "~15 sec",
    formats: "Amplify",
    type: "volume"
  },
  {
    icon: Zap,
    title: "Audio Effects",
    desc: "Add fade in/out, noise reduction effects",
    color: "from-indigo-500 to-purple-500",
    time: "~35 sec",
    formats: "Pro effects",
    type: "effects"
  },
  {
    icon: FileAudio,
    title: "Audio Compressor",
    desc: "Reduce file size without losing quality",
    color: "from-red-500 to-pink-500",
    time: "~25 sec",
    formats: "Smart compress",
    type: "compress"
  },
  {
    icon: Youtube,
    title: "YouTube to Audio",
    desc: "Extract audio from YouTube videos",
    color: "from-red-600 to-orange-500",
    time: "~60 sec",
    formats: "URL input",
    type: "youtube"
  },
  {
    icon: FileAudio,
    title: "Video to Audio",
    desc: "Extract audio tracks from video files",
    color: "from-teal-500 to-green-500",
    time: "~40 sec",
    formats: "Extract",
    type: "extract"
  },
  {
    icon: Tag,
    title: "Metadata Editor",
    desc: "Edit audio tags, title, artist, album info",
    color: "from-violet-500 to-purple-500",
    time: "~10 sec",
    formats: "ID3 tags",
    type: "metadata"
  },
]

// Add interface for recent audio conversion
interface RecentAudioConversion {
  id: string
  name: string
  action: string
  time: string
  timestamp: number
  type: string
  format: string
  data?: {
    fileData?: string // base64 encoded file data
    fileName?: string // processed filename for download
    mimeType?: string // MIME type for proper download
  }
}

export function AudioStudio() {
  const [selectedTool, setSelectedTool] = useState(audioTools[0])
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [startTime, setStartTime] = useState<number>(0)
  const [endTime, setEndTime] = useState<number>(10)
  const [audioInfo, setAudioInfo] = useState<any>(null)
  const [volumeChange, setVolumeChange] = useState<number>(0)
  const [outputFormat, setOutputFormat] = useState<string>('mp3')
  const [fadeIn, setFadeIn] = useState<number>(0)
  const [fadeOut, setFadeOut] = useState<number>(0)
  const [generatedFiles, setGeneratedFiles] = useState<any>(null)
  const [recentConversions, setRecentConversions] = useState<RecentAudioConversion[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Clear results when switching tools
  useEffect(() => {
    setUploadedFiles([])
    setAudioInfo(null)
    setGeneratedFiles(null)
  }, [selectedTool.type])

  // Load recent conversions from localStorage on component mount
  useEffect(() => {
    const loadRecentConversions = () => {
      try {
        const stored = localStorage.getItem('recentAudioConversions')
        if (stored) {
          const conversions = JSON.parse(stored)
          setRecentConversions(conversions)
        }
      } catch (error) {
        console.error('Error loading recent audio conversions:', error)
      }
    }
    loadRecentConversions()
  }, [])

  // Save recent conversion to localStorage
  const saveRecentConversion = (fileName: string, action: string, type: string, format: string, data?: any) => {
    try {
      const newConversion: RecentAudioConversion = {
        id: Date.now().toString(),
        name: fileName,
        action: action,
        time: formatTimeAgo(new Date()),
        timestamp: Date.now(),
        type: type,
        format: format,
        data: data
      }

      const stored = localStorage.getItem('recentAudioConversions')
      let conversions: RecentAudioConversion[] = stored ? JSON.parse(stored) : []
      
      // Add new conversion to the beginning and keep only the last 10
      conversions.unshift(newConversion)
      conversions = conversions.slice(0, 10)
      
      localStorage.setItem('recentAudioConversions', JSON.stringify(conversions))
      setRecentConversions(conversions)
    } catch (error) {
      console.error('Error saving recent audio conversion:', error)
    }
  }

  // Clear all recent conversions
  const clearAllConversions = () => {
    try {
      localStorage.removeItem('recentAudioConversions')
      setRecentConversions([])
    } catch (error) {
      console.error('Error clearing recent audio conversions:', error)
    }
  }

  // Helper function to convert blob to base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const base64String = reader.result as string
        // Remove the data URL prefix (e.g., "data:audio/mpeg;base64,")
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

  // Download function for recent conversions
  const handleRecentConversionDownload = async (conversion: RecentAudioConversion) => {
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
          type: conversion.data.mimeType || 'audio/mpeg' 
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
        console.error('Error downloading audio file:', error)
        alert('Error downloading file. The file data may be corrupted.')
      }
    } else {
      alert(`This file was processed previously. The original file data is not available for download.\n\nTo re-download this file, please process it again using the audio tools above.`)
    }
  }

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
    const audioFiles = files.filter(file => 
      file.type.startsWith('audio/') || 
      /\.(mp3|wav|flac|aac|ogg|m4a|mp4|wma|aiff|au|3gp)$/i.test(file.name)
    )
    
    if (audioFiles.length > 0) {
      setUploadedFiles((prev) => [...prev, ...audioFiles])
      
      // Get info for the first file if it's an audio trimmer
      if (selectedTool.title === "Audio Trimmer" && audioFiles.length > 0) {
        getAudioFileInfo(audioFiles[0])
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const audioFiles = files.filter(file => 
      file.type.startsWith('audio/') || 
      /\.(mp3|wav|flac|aac|ogg|m4a|mp4|wma|aiff|au|3gp)$/i.test(file.name)
    )
    
    if (audioFiles.length > 0) {
      setUploadedFiles((prev) => [...prev, ...audioFiles])
      
      // Get info for the first file if it's an audio trimmer
      if (selectedTool.title === "Audio Trimmer" && audioFiles.length > 0) {
        getAudioFileInfo(audioFiles[0])
      }
    }
  }

  const getAudioFileInfo = async (file: File) => {
    try {
      const info = await ApiClient.getAudioInfo(file)
      setAudioInfo(info.audio_info)
      setEndTime(Math.min(10, info.audio_info.duration_seconds))
    } catch (error) {
      console.error('Error getting audio info:', error)
    }
  }

  const generateDemoFiles = async () => {
    setIsProcessing(true)
    try {
      const result = await ApiClient.generateDemoAudioFiles()
      setGeneratedFiles(result)
      alert(`✅ Generated demo files!\nSine Melody: ${result.sine_melody.details.notes.join(', ')}\nSquare Tones: ${result.square_tones.details.notes.join(', ')}`)
    } catch (error) {
      console.error('Error generating demo files:', error)
      alert('Error generating demo files: ' + error)
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadGeneratedFile = async (fileId: string, filename: string) => {
    try {
      const response = await ApiClient.downloadGeneratedAudio(fileId)
      await ApiClient.downloadFile(response, filename)
    } catch (error) {
      console.error('Error downloading file:', error)
      alert('Error downloading file: ' + error)
    }
  }

  const mergeDemoFiles = async () => {
    setIsProcessing(true)
    try {
      const response = await ApiClient.mergeGeneratedDemo()
      const demoFileName = 'merged_demo_audio.mp3'
      
      // Clone response for tracking
      const downloadResponse = response.clone()
      
      // Convert response to base64 for localStorage
      const blob = await response.blob()
      const base64 = await blobToBase64(blob)
      
      // Download the file
      await ApiClient.downloadFile(downloadResponse, demoFileName)
      
      // Save to recent conversions
      saveRecentConversion(
        "Demo Files", 
        "Demo Merged", 
        "merge", 
        "MP3",
        {
          fileData: base64,
          fileName: demoFileName,
          mimeType: 'audio/mpeg'
        }
      )
      
      alert('✅ Demo files merged successfully!')
    } catch (error) {
      console.error('Error merging demo files:', error)
      alert('Error merging demo files: ' + error)
    } finally {
      setIsProcessing(false)
    }
  }

  const processAudioFiles = async () => {
    if (uploadedFiles.length === 0 && selectedTool.title !== "Audio Merger") return

    setIsProcessing(true)
    
    try {
      const firstFile = uploadedFiles[0]
      
      switch (selectedTool.title) {
        case "Audio Trimmer":
          if (startTime >= endTime) {
            alert("Start time must be less than end time")
            return
          }
          
          const trimResponse = await ApiClient.trimAudio(firstFile, startTime, endTime)
          const trimFileName = `trimmed_${firstFile.name.split('.')[0]}.mp3`
          
          // Clone response for tracking
          const trimDownloadResponse = trimResponse.clone()
          
          // Convert response to base64 for localStorage
          const trimBlob = await trimResponse.blob()
          const trimBase64 = await blobToBase64(trimBlob)
          
          // Download the file
          await ApiClient.downloadFile(trimDownloadResponse, trimFileName)
          
          // Save to recent conversions
          saveRecentConversion(
            firstFile.name, 
            "Trimmed", 
            "trim", 
            "MP3",
            {
              fileData: trimBase64,
              fileName: trimFileName,
              mimeType: 'audio/mpeg'
            }
          )
          break
          
        case "Format Converter":
          const convertResponse = await ApiClient.convertAudio(firstFile, outputFormat)
          const convertFileName = `converted_${firstFile.name.split('.')[0]}.${outputFormat}`
          
          // Clone response for tracking
          const convertDownloadResponse = convertResponse.clone()
          
          // Convert response to base64 for localStorage
          const convertBlob = await convertResponse.blob()
          const convertBase64 = await blobToBase64(convertBlob)
          
          // Download the file
          await ApiClient.downloadFile(convertDownloadResponse, convertFileName)
          
          // Save to recent conversions
          saveRecentConversion(
            firstFile.name, 
            `Converted to ${outputFormat.toUpperCase()}`, 
            "convert", 
            outputFormat.toUpperCase(),
            {
              fileData: convertBase64,
              fileName: convertFileName,
              mimeType: `audio/${outputFormat}`
            }
          )
          break
          
        case "Volume Adjuster":
          const volumeResponse = await ApiClient.adjustVolume(firstFile, volumeChange)
          const volumeFileName = `volume_adjusted_${firstFile.name.split('.')[0]}.mp3`
          
          // Clone response for tracking
          const volumeDownloadResponse = volumeResponse.clone()
          
          // Convert response to base64 for localStorage
          const volumeBlob = await volumeResponse.blob()
          const volumeBase64 = await blobToBase64(volumeBlob)
          
          // Download the file
          await ApiClient.downloadFile(volumeDownloadResponse, volumeFileName)
          
          // Save to recent conversions
          saveRecentConversion(
            firstFile.name, 
            `Volume ${volumeChange > 0 ? 'Boosted' : 'Reduced'}`, 
            "volume", 
            "MP3",
            {
              fileData: volumeBase64,
              fileName: volumeFileName,
              mimeType: 'audio/mpeg'
            }
          )
          break

        case "Audio Effects":
          const effectsResponse = await ApiClient.addAudioEffects(firstFile, fadeIn, fadeOut)
          const effectsFileName = `effects_${firstFile.name.split('.')[0]}.mp3`
          
          // Clone response for tracking
          const effectsDownloadResponse = effectsResponse.clone()
          
          // Convert response to base64 for localStorage
          const effectsBlob = await effectsResponse.blob()
          const effectsBase64 = await blobToBase64(effectsBlob)
          
          // Download the file
          await ApiClient.downloadFile(effectsDownloadResponse, effectsFileName)
          
          // Save to recent conversions
          saveRecentConversion(
            firstFile.name, 
            "Effects Added", 
            "effects", 
            "MP3",
            {
              fileData: effectsBase64,
              fileName: effectsFileName,
              mimeType: 'audio/mpeg'
            }
          )
          break

        case "Audio Merger":
          if (uploadedFiles.length === 2) {
            // Overlay uploaded files
            const overlayResponse = await ApiClient.overlayAudio(uploadedFiles)
            const overlayFileName = 'overlayed_audio.mp3'
            
            // Clone response for tracking
            const overlayDownloadResponse = overlayResponse.clone()
            
            // Convert response to base64 for localStorage
            const overlayBlob = await overlayResponse.blob()
            const overlayBase64 = await blobToBase64(overlayBlob)
            
            // Download the file
            await ApiClient.downloadFile(overlayDownloadResponse, overlayFileName)
            
            // Save to recent conversions
            saveRecentConversion(
              `${uploadedFiles.length} files`, 
              "Overlayed", 
              "merge", 
              "MP3",
              {
                fileData: overlayBase64,
                fileName: overlayFileName,
                mimeType: 'audio/mpeg'
              }
            )
          } else if (uploadedFiles.length > 2) {
            // Concatenate multiple files
            const mergeResponse = await ApiClient.mergeAudio(uploadedFiles)
            const mergeFileName = 'merged_audio.mp3'
            
            // Clone response for tracking
            const mergeDownloadResponse = mergeResponse.clone()
            
            // Convert response to base64 for localStorage
            const mergeBlob = await mergeResponse.blob()
            const mergeBase64 = await blobToBase64(mergeBlob)
            
            // Download the file
            await ApiClient.downloadFile(mergeDownloadResponse, mergeFileName)
            
            // Save to recent conversions
            saveRecentConversion(
              `${uploadedFiles.length} files`, 
              "Merged", 
              "merge", 
              "MP3",
              {
                fileData: mergeBase64,
                fileName: mergeFileName,
                mimeType: 'audio/mpeg'
              }
            )
          } else {
            alert("Please upload at least 2 audio files for merging")
            return
          }
          break
          
        default:
          alert("This tool is not yet implemented")
      }
    } catch (error) {
      console.error('Error processing audio:', error)
      alert('Error processing audio: ' + error)
    } finally {
      setIsProcessing(false)
    }
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
                    <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="audio/*,.mp3,.wav,.flac,.aac,.ogg,.m4a,.mp4,.wma,.aiff,.au,.3gp"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <Button 
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Choose Files
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Tool-specific Options */}
            {selectedTool.title === "Audio Trimmer" && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
                <h3 className="text-white font-medium mb-3 text-sm md:text-base">Trim Settings</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-gray-300 text-xs md:text-sm mb-1 block">Start Time (seconds)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={startTime}
                        onChange={(e) => setStartTime(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-gray-400 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-xs md:text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-gray-300 text-xs md:text-sm mb-1 block">End Time (seconds)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={endTime}
                        max={audioInfo?.duration_seconds || undefined}
                        onChange={(e) => setEndTime(parseFloat(e.target.value) || 10)}
                        className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-gray-400 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-xs md:text-sm"
                      />
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs">Set the start and end times for your audio trim</p>
                  {audioInfo && (
                    <div className="flex items-center gap-2 text-xs text-violet-400">
                      <Clock className="w-3 h-3" />
                      <span>Audio Duration: {audioInfo.duration_seconds.toFixed(1)}s</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedTool.title === "Format Converter" && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
                <h3 className="text-white font-medium mb-3 text-sm md:text-base">Output Format</h3>
                <div className="grid grid-cols-3 gap-2">
                  {["mp3", "wav", "flac", "aac", "ogg", "m4a"].map((format) => (
                    <button
                      key={format}
                      onClick={() => setOutputFormat(format)}
                      className={`px-3 py-2 text-xs md:text-sm rounded-lg transition-colors border ${
                        outputFormat === format
                          ? 'bg-violet-500/20 text-violet-400 border-violet-500/30'
                          : 'bg-white/10 hover:bg-violet-500/20 text-white border-white/10 hover:border-violet-500/30'
                      }`}
                    >
                      {format.toUpperCase()}
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
                    min="-60"
                    max="60"
                    value={volumeChange}
                    onChange={(e) => setVolumeChange(parseInt(e.target.value))}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>-60dB</span>
                    <span className="text-violet-400">{volumeChange}dB</span>
                    <span>+60dB</span>
                  </div>
                </div>
              </div>
            )}

            {selectedTool.title === "Audio Effects" && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
                <h3 className="text-white font-medium mb-3 text-sm md:text-base">Fade Effects</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-gray-300 text-xs md:text-sm mb-1 block">Fade In (seconds)</label>
                      <input
                        type="number"
                        min="0"
                        max="30"
                        step="0.1"
                        value={fadeIn}
                        onChange={(e) => setFadeIn(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-gray-400 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-xs md:text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-gray-300 text-xs md:text-sm mb-1 block">Fade Out (seconds)</label>
                      <input
                        type="number"
                        min="0"
                        max="30"
                        step="0.1"
                        value={fadeOut}
                        onChange={(e) => setFadeOut(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-gray-400 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-xs md:text-sm"
                      />
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs">Add smooth fade-in and fade-out effects to your audio</p>
                </div>
              </div>
            )}

            {selectedTool.title === "Audio Merger" && (
              <div className="space-y-4">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
                  <h3 className="text-white font-medium mb-3 text-sm md:text-base">🎵 Demo Audio Generation</h3>
                  <p className="text-gray-400 text-xs md:text-sm mb-3">
                    Generate demo audio files for testing merger functionality
                  </p>
                  <div className="space-y-2">
                    <Button 
                      onClick={generateDemoFiles}
                      disabled={isProcessing}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    >
                      {isProcessing ? 'Generating...' : '🎶 Generate Demo Files'}
                    </Button>
                    
                    {generatedFiles && (
                      <div className="mt-3 space-y-2">
                        <div className="text-xs text-green-400 font-medium">✅ Demo files generated!</div>
                        <div className="grid grid-cols-1 gap-2">
                          <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                            <span className="text-white text-xs">🎵 Sine Melody (5s)</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => downloadGeneratedFile(generatedFiles.sine_melody.file_id, generatedFiles.sine_melody.filename)}
                              className="text-xs"
                            >
                              📥 Download
                            </Button>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                            <span className="text-white text-xs">⚡ Square Tones (2s)</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => downloadGeneratedFile(generatedFiles.square_tones.file_id, generatedFiles.square_tones.filename)}
                              className="text-xs"
                            >
                              📥 Download
                            </Button>
                          </div>
                        </div>
                        <Button 
                          onClick={mergeDemoFiles}
                          disabled={isProcessing}
                          className="w-full mt-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        >
                          {isProcessing ? 'Merging...' : '🎯 Merge Demo Files'}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
                  <h3 className="text-white font-medium mb-3 text-sm md:text-base">📁 File Upload Options</h3>
                  <p className="text-gray-400 text-xs md:text-sm mb-3">
                    Upload your own audio files to merge:
                  </p>
                  <div className="space-y-2 text-xs text-gray-300">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-violet-400 rounded-full"></span>
                      <span>Upload exactly 2 files = Overlay (mix simultaneously)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                      <span>Upload 3+ files = Concatenate (join end-to-end)</span>
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
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                      <Music className="w-4 h-4 text-violet-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-white text-xs md:text-sm block truncate">{file.name}</span>
                        <span className="text-gray-400 text-xs">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                      </div>
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

                <Button 
                  onClick={processAudioFiles}
                  disabled={isProcessing || uploadedFiles.length === 0}
                  className="w-full mt-4 bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600 disabled:opacity-50"
                >
                  {isProcessing ? `Processing...` : `Process Audio Files ⚡`}
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-medium text-sm md:text-base">Recent Audio Conversions</h3>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentConversions.length > 0 ? (
              recentConversions.map((conversion) => (
                <div
                  key={conversion.id}
                  className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
                >
                  <Music className="w-8 h-8 text-violet-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs md:text-sm font-medium truncate">{conversion.name}</p>
                    <p className="text-gray-400 text-xs">
                      {conversion.action} • {conversion.time}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-violet-400 bg-violet-500/20 px-2 py-1 rounded">{conversion.format}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRecentConversionDownload(conversion)}
                      className="p-1 h-auto text-gray-400 hover:text-white"
                      title="Download file"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <Music className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-400">No recent audio conversions yet</p>
                <p className="text-gray-500 text-sm">Process some audio files to see them here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
