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