import { useState } from 'react'
import { Toaster } from 'sonner'
import { toast } from 'sonner'
import axios from 'axios'
import { FileText, Video, Loader2, HelpCircle } from 'lucide-react'

interface ProcessingStatus {
  step: string
  progress: number
  message: string
  isError?: boolean
}

function App() {
  const [bilibiliUrl, setBilibiliUrl] = useState('')
  const [accessKey, setAccessKey] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [status, setStatus] = useState<ProcessingStatus | null>(null)
  const [result, setResult] = useState<{
    markdown?: string
    videoUrl?: string
    title?: string
    tingwuResult?: any
  } | null>(null)
  const [showTingwu, setShowTingwu] = useState(false)
  const [videoFileUrl, setVideoFileUrl] = useState('')
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadResult, setDownloadResult] = useState<{
    videoUrl?: string
    audioUrl?: string
    message?: string
  } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!bilibiliUrl.trim()) {
      toast.error('请输入B站视频链接')
      return
    }
    
    if (!accessKey.trim()) {
      toast.error('请输入阿里云AccessKey')
      return
    }

    // Validate Bilibili URL format
    const bvidMatch = bilibiliUrl.match(/BV[0-9A-Za-z]+/)
    if (!bvidMatch) {
      toast.error('请输入有效的B站视频链接')
      return
    }

    setIsProcessing(true)
    setResult(null)
    setStatus({ step: 'parsing', progress: 10, message: '正在解析视频信息...' })

    try {
      console.log('Sending request with:', { bilibiliUrl, accessKey })
      const response = await axios.post('/api/process-video', {
        url: bilibiliUrl,
        accessKey: accessKey
      })

      console.log('Response:', response.data)
      if (response.data.success) {
        setResult(response.data.data)
        toast.success('处理完成！')
        setStatus({ step: 'complete', progress: 100, message: '处理完成！' })
      } else {
        throw new Error(response.data.error || '处理失败')
      }
    } catch (error: any) {
      console.error('Processing error:', error)
      console.error('Error response:', error.response?.data)
      const errorMessage = error.response?.data?.error || error.message || '处理过程中出现错误'
      const step = error.response?.data?.step || 'error'
      toast.error(errorMessage)
      setStatus({ step, progress: 0, message: errorMessage, isError: true })
      
      // Show Tingwu section if no subtitles found
      if (step === 'no-subtitles') {
        setShowTingwu(true)
      }
      
      setIsProcessing(false)
      return // Don't proceed further on error
    }
  }

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const showHelp = () => {
    alert('此密钥用于调用您阿里云账户下的通义服务（语音转文字和AI排版），所有费用由您的账户承担。')
  }

  const handleVideoDownload = async () => {
    if (!bilibiliUrl.trim()) {
      toast.error('请先输入B站视频链接')
      return
    }

    setIsDownloading(true)
    setDownloadResult(null)
    setStatus({ step: 'downloading', progress: 30, message: '正在获取视频下载链接...' })

    try {
      const response = await axios.post('/api/download-video', {
        bilibiliUrl: bilibiliUrl
      })

      if (response.data.success) {
        setDownloadResult(response.data.data)
        setVideoFileUrl(response.data.data.videoUrl)
        setStatus({ step: 'download-complete', progress: 100, message: '视频下载链接获取成功！' })
        toast.success('视频下载链接获取成功！')
      } else {
        throw new Error(response.data.error || '下载失败')
      }
    } catch (error: any) {
      console.error('Download error:', error)
      const errorMessage = error.response?.data?.error || error.message || '获取视频下载链接失败'
      toast.error(errorMessage)
      setStatus({ step: 'download-error', progress: 0, message: errorMessage, isError: true })
    } finally {
      setIsDownloading(false)
    }
  }

  const handleTingwuSubmit = async () => {
    console.log('Starting Tongyi Tingwu submission...')
    console.log('Video file URL:', videoFileUrl)
    console.log('Access key present:', !!accessKey.trim())
    
    if (!videoFileUrl.trim()) {
      toast.error('请输入视频文件URL')
      return
    }

    if (!accessKey.trim()) {
      toast.error('请输入阿里云AccessKey')
      return
    }

    setIsProcessing(true)
    setStatus({ step: 'tingwu-processing', progress: 20, message: '正在创建通义听悟任务...' })

    try {
      console.log('Sending request to /api/tingwu-process...')
      const response = await axios.post('/api/tingwu-process', {
        videoUrl: videoFileUrl,
        accessKey: accessKey
      })
      
      console.log('Received response:', response.data)

      if (response.data.success) {
        setResult({ tingwuResult: response.data.data })
        setStatus({ step: 'tingwu-complete', progress: 100, message: '通义听悟处理完成！' })
        toast.success('通义听悟处理完成！')
      } else {
        throw new Error(response.data.error || '处理失败')
      }
    } catch (error: any) {
      console.error('Tingwu processing error details:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      console.error('Error message:', error.message)
      
      const errorMessage = error.response?.data?.error || error.message || '通义听悟处理失败'
      toast.error(errorMessage)
      setStatus({ step: 'tingwu-error', progress: 0, message: errorMessage, isError: true })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Toaster position="top-right" />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">B站深度学习笔记助手</h1>
          <p className="text-gray-600">一键将B站视频转化为结构化学习笔记</p>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg text-left max-w-2xl mx-auto">
            <h3 className="font-semibold text-blue-800 mb-2">💡 使用提示：</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 请确保视频带有<b>"CC"字幕标识</b>，否则无法提取字幕</li>
              <li>• 教育类、官方账号、知识区视频通常有字幕</li>
              <li>• 如果视频无字幕，可先用通义听悟转写获取视频文件URL</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                B站视频链接
              </label>
              <input
                type="url"
                value={bilibiliUrl}
                onChange={(e) => setBilibiliUrl(e.target.value)}
                placeholder="https://www.bilibili.com/video/BV..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isProcessing}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                阿里云AccessKey
                <button
                  type="button"
                  onClick={showHelp}
                  className="ml-2 text-gray-400 hover:text-gray-600"
                >
                  <HelpCircle className="w-4 h-4 inline" />
                </button>
              </label>
              <input
                type="password"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                placeholder="请输入您的阿里云AccessKey"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isProcessing}
              />
              <p className="text-xs text-gray-500 mt-1">
                此密钥用于调用通义听悟和通义千问服务，费用由您的账户承担
              </p>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  处理中...
                </>
              ) : (
                '开始转换'
              )}
            </button>
          </form>
        </div>

        {showTingwu && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">通义听悟转写</h2>
            
            {/* Video Download Section */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-3">步骤1：获取视频下载链接</h3>
              <p className="text-sm text-blue-700 mb-3">
                点击按钮自动获取当前B站视频的下载链接，用于通义听悟转写
              </p>
              <button
                onClick={handleVideoDownload}
                disabled={isDownloading || !bilibiliUrl.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    获取中...
                  </>
                ) : (
                  '获取视频下载链接'
                )}
              </button>
              
              {downloadResult && (
                <div className="mt-3 p-3 bg-green-50 rounded-md">
                  <p className="text-sm text-green-800 mb-2">✅ {downloadResult.message}</p>
                  {downloadResult.videoUrl && (
                    <div className="text-xs text-green-700">
                      <p className="font-medium">视频URL：</p>
                      <p className="break-all bg-white p-2 rounded mt-1">{downloadResult.videoUrl}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tongyi Tingwu Processing Section */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  视频文件URL（需公开可访问）
                </label>
                <input
                  type="url"
                  value={videoFileUrl}
                  onChange={(e) => setVideoFileUrl(e.target.value)}
                  placeholder="https://example.com/video.mp4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  可以手动输入视频文件URL，或使用上方按钮自动获取
                </p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleTingwuSubmit}
                  disabled={isProcessing || !videoFileUrl.trim() || !accessKey.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      处理中...
                    </>
                  ) : (
                    '开始转写'
                  )}
                </button>
                <button 
                  onClick={() => setShowTingwu(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}

        {status && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">处理状态</h3>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              status.isError ? 'bg-red-600' : 'bg-blue-600'
            }`}
            style={{ width: `${status.progress}%` }}
          />
        </div>
            <p className={`text-sm ${status.isError ? 'text-red-600' : 'text-gray-600'}`}>{status.message}</p>
            {status.isError && status.step === 'no-subtitles' && (
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">💡 替代方案</h4>
                <div className="text-sm text-yellow-700 space-y-2">
                  <p>该视频没有内置字幕，您可以：</p>
                  <ol className="list-decimal list-inside space-y-1 ml-4">
                    <li>点击"获取视频下载链接"自动获取当前视频文件URL</li>
                    <li>或使用 <a href="https://snapany.com" target="_blank" className="text-blue-600 underline">SnapAny</a> 手动获取视频文件URL</li>
                    <li>在"通义听悟"区域填写视频URL和AccessKey</li>
                    <li>生成转写任务并等待完成</li>
                    <li>将转写结果复制到AI排版区域</li>
                  </ol>
                  <div className="mt-3 space-x-2">
                    <button 
                      onClick={() => setShowTingwu(true)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                    >
                      打开通义听悟工具
                    </button>
                    <button 
                      onClick={handleVideoDownload}
                      disabled={isDownloading || !bilibiliUrl.trim()}
                      className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 disabled:opacity-50"
                    >
                      获取视频下载链接
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {result && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">处理结果</h3>
            {result.title && (
              <div className="mb-4 p-3 bg-blue-50 rounded-md">
                <h4 className="font-medium text-blue-800">{result.title}</h4>
              </div>
            )}
            
            {result.markdown && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">学习笔记预览</h4>
                  <button
                    onClick={() => downloadFile(result.markdown!, `${result.title || '笔记'}.md`, 'text/markdown')}
                    className="flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    下载笔记
                  </button>
                </div>
                <div className="bg-gray-50 rounded-md p-3 max-h-64 overflow-y-auto">
                  <pre className="text-sm whitespace-pre-wrap">{result.markdown}</pre>
                </div>
              </div>
            )}

            {result.videoUrl && (
              <div className="flex items-center justify-between">
                <h4 className="font-medium">源视频</h4>
                <button
                  onClick={() => window.open(result.videoUrl, '_blank')}
                  className="flex items-center px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
                >
                  <Video className="w-4 h-4 mr-1" />
                  下载视频
                </button>
              </div>
            )}

            {result.tingwuResult && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-3">通义听悟转写结果</h4>
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-700">任务ID：</span>
                    <span className="text-xs text-green-600 font-mono">{result.tingwuResult.taskId}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-700">状态：</span>
                    <span className="text-sm text-green-600">{result.tingwuResult.status}</span>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-green-800">转写文本：</h5>
                    <button
                      onClick={() => downloadFile(result.tingwuResult.result.text, `${result.title || '转写结果'}.txt`, 'text/plain')}
                      className="flex items-center px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                    >
                      <FileText className="w-3 h-3 mr-1" />
                      下载
                    </button>
                  </div>
                  <div className="bg-white rounded-md p-3 max-h-32 overflow-y-auto">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">{result.tingwuResult.result.text}</pre>
                  </div>
                </div>

                {result.tingwuResult.result.segments && result.tingwuResult.result.segments.length > 0 && (
                  <div>
                    <h5 className="font-medium text-green-800 mb-2">转写片段：</h5>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {result.tingwuResult.result.segments.map((segment: any, index: number) => (
                        <div key={index} className="text-xs bg-white p-2 rounded border">
                          <span className="font-mono text-gray-600">[{segment.start}s - {segment.end}s]</span>
                          <span className="ml-2 text-gray-800">{segment.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App