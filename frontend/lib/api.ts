const API_BASE_URL = 'http://localhost:8000'

export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
}

export interface TesseractError {
  error: string
  message: string
  installation_instructions: string[]
  download_url: string
}

export interface HealthCheckResponse {
  pdf_services: string
  tesseract_ocr: {
    available: boolean
    installed: boolean
    path: string | null
    status: string
    installation_instructions?: string[]
    download_url?: string
  }
}

export interface AudioHealthCheckResponse {
  audio_services: string
  supported_formats: string[]
  features: string[]
}

export interface AudioInfoResponse {
  success: boolean
  filename: string
  audio_info: {
    duration_ms: number
    duration_seconds: number
    channels: number
    frame_rate: number
    sample_width: number
    format: string
    bitrate: string
    file_size: number
  }
}

export interface AudioFormatsResponse {
  supported_formats: string[]
  input_formats: string[]
  output_formats: string[]
}

export class ApiClient {
  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const contentType = response.headers.get('Content-Type')
      
      // Handle structured error responses (like OCR errors)
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await response.json()
          // If it's a Tesseract error, throw a structured error
          if (errorData.detail && typeof errorData.detail === 'object' && errorData.detail.error) {
            const tesseractError = new Error(errorData.detail.message)
            ;(tesseractError as any).tesseractDetails = errorData.detail
            throw tesseractError
          }
          throw new Error(errorData.detail || `API Error ${response.status}`)
        } catch (e) {
          if (e instanceof Error && (e as any).tesseractDetails) {
            throw e
          }
          throw new Error(`API Error ${response.status}`)
        }
      }
      
      const error = await response.text()
      throw new Error(`API Error ${response.status}: ${error}`)
    }
    
    // Check if response is JSON
    const contentType = response.headers.get('Content-Type')
    if (contentType && contentType.includes('application/json')) {
      return response.json()
    }
    
    // For file downloads, return the response itself
    return response as unknown as T
  }

  static async checkHealth(): Promise<HealthCheckResponse> {
    const response = await fetch(`${API_BASE_URL}/api/pdf/health`, {
      method: 'GET',
    })

    return this.handleResponse(response)
  }

  // Audio API Methods
  static async checkAudioHealth(): Promise<AudioHealthCheckResponse> {
    const response = await fetch(`${API_BASE_URL}/api/audio/health`, {
      method: 'GET',
    })

    return this.handleResponse(response)
  }

  static async getAudioFormats(): Promise<AudioFormatsResponse> {
    const response = await fetch(`${API_BASE_URL}/api/audio/formats`, {
      method: 'GET',
    })

    return this.handleResponse(response)
  }

  static async getAudioInfo(file: File): Promise<AudioInfoResponse> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_BASE_URL}/api/audio/info`, {
      method: 'POST',
      body: formData,
    })

    return this.handleResponse(response)
  }

  static async trimAudio(file: File, startTime: number, endTime: number): Promise<Response> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('start_time', startTime.toString())
    formData.append('end_time', endTime.toString())

    const response = await fetch(`${API_BASE_URL}/api/audio/trim`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`API Error ${response.status}: ${error}`)
    }

    return response
  }

  static async convertAudio(file: File, outputFormat: string): Promise<Response> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('output_format', outputFormat)

    const response = await fetch(`${API_BASE_URL}/api/audio/convert`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`API Error ${response.status}: ${error}`)
    }

    return response
  }

  static async adjustVolume(file: File, volumeChange: number): Promise<Response> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('volume_change', volumeChange.toString())

    const response = await fetch(`${API_BASE_URL}/api/audio/volume`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`API Error ${response.status}: ${error}`)
    }

    return response
  }

  static async mergeAudio(files: File[]): Promise<Response> {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files', file)
    })

    const response = await fetch(`${API_BASE_URL}/api/audio/merge`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`API Error ${response.status}: ${error}`)
    }

    return response
  }

  static async addAudioEffects(file: File, fadeIn: number, fadeOut: number): Promise<Response> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('fade_in', fadeIn.toString())
    formData.append('fade_out', fadeOut.toString())

    const response = await fetch(`${API_BASE_URL}/api/audio/effects`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`API Error ${response.status}: ${error}`)
    }

    return response
  }

  // Audio Merger specific methods
  static async generateDemoAudioFiles(): Promise<{
    success: boolean
    sine_melody: {
      file_id: string
      filename: string
      details: any
    }
    square_tones: {
      file_id: string
      filename: string
      details: any
    }
    message: string
  }> {
    const response = await fetch(`${API_BASE_URL}/api/audio/generate/demo-files`, {
      method: 'POST',
    })

    return this.handleResponse(response)
  }

  static async downloadGeneratedAudio(fileId: string): Promise<Response> {
    const response = await fetch(`${API_BASE_URL}/api/audio/download/${fileId}`, {
      method: 'GET',
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`API Error ${response.status}: ${error}`)
    }

    return response
  }

  static async overlayAudio(files: File[]): Promise<Response> {
    if (files.length !== 2) {
      throw new Error('Exactly 2 audio files required for overlay')
    }

    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files', file)
    })

    const response = await fetch(`${API_BASE_URL}/api/audio/overlay`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`API Error ${response.status}: ${error}`)
    }

    return response
  }

  static async mergeGeneratedDemo(): Promise<Response> {
    const response = await fetch(`${API_BASE_URL}/api/audio/merge-generated`, {
      method: 'POST',
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`API Error ${response.status}: ${error}`)
    }

    return response
  }

  static async extractTextFromPdf(file: File): Promise<{
    success: boolean
    filename: string
    total_pages: number
    text_by_page: string[]
    full_text: string
  }> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_BASE_URL}/api/pdf/extract-text`, {
      method: 'POST',
      body: formData,
    })

    return this.handleResponse(response)
  }

  static async ocrImage(file: File): Promise<{
    success: boolean
    filename: string
    extracted_text: string
    text_length: number
    has_content: boolean
  }> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_BASE_URL}/api/pdf/ocr-image`, {
      method: 'POST',
      body: formData,
    })

    return this.handleResponse(response)
  }

  static async encryptPdf(file: File, password: string): Promise<Response> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('password', password)

    const response = await fetch(`${API_BASE_URL}/api/pdf/encrypt`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`API Error ${response.status}: ${error}`)
    }

    return response
  }

  static async convertDocxToPdf(file: File): Promise<Response> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_BASE_URL}/api/pdf/docx-to-pdf`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`API Error ${response.status}: ${error}`)
    }

    return response
  }

  static async extractTextFromDocx(file: File): Promise<{
    success: boolean
    filename: string
    total_paragraphs: number
    paragraphs: string[]
    full_text: string
  }> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_BASE_URL}/api/pdf/extract-text-docx`, {
      method: 'POST',
      body: formData,
    })

    return this.handleResponse(response)
  }

  static async mergePdfs(files: File[]): Promise<Response> {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files', file)
    })

    const response = await fetch(`${API_BASE_URL}/api/pdf/merge`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`API Error ${response.status}: ${error}`)
    }

    return response
  }

  static async splitPdf(file: File): Promise<{
    success: boolean
    total_files: number
    files: string[]
    message: string
  }> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('split_type', 'pages')

    const response = await fetch(`${API_BASE_URL}/api/pdf/split`, {
      method: 'POST',
      body: formData,
    })

    return this.handleResponse(response)
  }

  static async compressPdf(file: File): Promise<Response> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_BASE_URL}/api/pdf/compress`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`API Error ${response.status}: ${error}`)
    }

    return response
  }

  static async unlockPdf(file: File, password: string): Promise<Response> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('password', password)

    const response = await fetch(`${API_BASE_URL}/api/pdf/unlock`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`API Error ${response.status}: ${error}`)
    }

    return response
  }

  static async watermarkPdf(templateFile: File, watermarkFile: File): Promise<Response> {
    const formData = new FormData()
    formData.append('template_file', templateFile)
    formData.append('watermark_file', watermarkFile)

    const response = await fetch(`${API_BASE_URL}/api/pdf/watermark`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`API Error ${response.status}: ${error}`)
    }

    return response
  }

  static async downloadFile(response: Response, filename?: string): Promise<void> {
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename || 'download'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  static isTesseractError(error: Error): boolean {
    return !!(error as any).tesseractDetails
  }

  static getTesseractErrorDetails(error: Error): TesseractError | null {
    return (error as any).tesseractDetails || null
  }
} 