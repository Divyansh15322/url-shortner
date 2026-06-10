import { useState } from 'react'
import { Link2, Scissors, ArrowRight, Copy, Check, ExternalLink, Zap, Shield, BarChart2 } from 'lucide-react'
import { urls as urlsAPI } from '../api/client'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'

function FeaturePill({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-400">
      <Icon size={12} className="text-violet-400" />
      {label}
    </div>
  )
}

export default function Home() {
  const { user } = useAuth()
  const [inputUrl, setInputUrl] = useState('')
  const [customCode, setCustomCode] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleShorten = async () => {
    if (!inputUrl.trim()) return toast.error('Paste a URL first')
    let url = inputUrl.trim()
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url

    setLoading(true)
    try {
      const { data } = await urlsAPI.shorten({
        original_url: url,
        custom_code: customCode || undefined,
      })
      setResult(data)
      setInputUrl('')
      setCustomCode('')
      setShowCustom(false)
      toast.success('Link shortened!')
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(result.short_url)
    setCopied(true)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleShorten()
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative flex-1 flex flex-col items-center justify-center px-4 py-24">
        {/* Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300 font-mono mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse-slow" />
          Open source · Production ready
        </div>

        {/* Hero */}
        <h1 className="font-display text-5xl md:text-7xl font-bold text-center leading-[1.05] mb-4">
          <span className="text-white">Long links,</span>
          <br />
          <span className="bg-gradient-to-r from-violet-400 via-violet-300 to-cyan-400 bg-clip-text text-transparent">
            cut short.
          </span>
        </h1>

        <p className="text-zinc-400 text-center max-w-md mb-12 text-lg leading-relaxed">
          Snip turns any URL into a sharp, trackable link — with analytics, custom codes, and sub-10ms redirects.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          <FeaturePill icon={Zap} label="Redis-cached redirects" />
          <FeaturePill icon={BarChart2} label="Click analytics" />
          <FeaturePill icon={Shield} label="JWT authentication" />
        </div>

        {/* Shortener card */}
        <div className="w-full max-w-2xl card p-6 shadow-2xl shadow-black/50">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Link2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input
                className="input-field pl-10"
                placeholder="https://your-very-long-url.com/goes/here"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <button
              className="btn-primary shrink-0"
              onClick={handleShorten}
              disabled={loading}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Scissors size={16} />
              )}
              <span className="hidden sm:inline">Snip it</span>
            </button>
          </div>

          {/* Custom code toggle */}
          <div className="mt-3">
            <button
              className="text-xs text-muted hover:text-zinc-300 transition-colors flex items-center gap-1"
              onClick={() => setShowCustom(!showCustom)}
            >
              <ArrowRight size={10} className={`transition-transform ${showCustom ? 'rotate-90' : ''}`} />
              Custom code
            </button>
            {showCustom && (
              <div className="mt-2 flex items-center gap-2 animate-fade-up">
                <span className="text-xs text-muted font-mono whitespace-nowrap">snip.to/</span>
                <input
                  className="input-field py-2 text-xs"
                  placeholder="mylink"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  maxLength={20}
                />
              </div>
            )}
          </div>

          {/* Result */}
          {result && (
            <div className="mt-4 p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 animate-fade-up">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] text-muted uppercase tracking-widest mb-1">Your short link</p>
                  <a
                    href={result.short_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-violet-300 font-mono text-sm font-medium hover:text-violet-200 transition-colors flex items-center gap-1.5 group"
                  >
                    {result.short_url}
                    <ExternalLink size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                  <p className="text-[10px] text-muted mt-1 truncate">{result.original_url}</p>
                </div>
                <button
                  onClick={handleCopy}
                  className={`shrink-0 p-2.5 rounded-lg transition-all duration-200 ${
                    copied
                      ? 'bg-success/20 text-success'
                      : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white'
                  }`}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          )}

          {!user && (
            <p className="text-center text-xs text-muted mt-4">
              <a href="/register" className="text-violet-400 hover:underline">Sign up free</a> to save your links and view analytics
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
