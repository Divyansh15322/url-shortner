import { useState, useEffect, useCallback } from 'react'
import { Link2, Trash2, Copy, Check, ExternalLink, TrendingUp, LinkIcon, MousePointerClick, Activity, Plus, X, Scissors } from 'lucide-react'
import { urls as urlsAPI } from '../api/client'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

function StatCard({ label, value, icon: Icon, color = 'violet' }) {
  const colorMap = {
    violet: 'text-violet-400 bg-violet-400/10',
    cyan: 'text-cyan-400 bg-cyan-400/10',
    green: 'text-green-400 bg-green-400/10',
  }
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted uppercase tracking-widest">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
          <Icon size={15} />
        </div>
      </div>
      <span className="font-display text-3xl font-bold text-white">{value ?? '—'}</span>
    </div>
  )
}

function URLRow({ url, onDelete, onCopy, copiedCode }) {
  const shortUrl = url.short_url || `http://localhost:8000/${url.short_code}`
  const domain = (() => {
    try { return new URL(url.original_url).hostname } catch { return url.original_url }
  })()

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-border hover:border-zinc-700 transition-colors group">
      <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center shrink-0">
        <img
          src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
          alt=""
          className="w-4 h-4 rounded"
          onError={(e) => { e.target.style.display = 'none' }}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <a
            href={shortUrl}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-sm text-violet-300 hover:text-violet-200 transition-colors flex items-center gap-1"
          >
            /{url.short_code}
            <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
          <span className="text-[10px] text-muted px-2 py-0.5 rounded-full bg-white/5">
            {url.clicks} {url.clicks === 1 ? 'click' : 'clicks'}
          </span>
        </div>
        <p className="text-xs text-muted truncate mt-0.5">{url.original_url}</p>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onCopy(url.short_code, shortUrl)}
          className={`p-2 rounded-lg transition-all ${
            copiedCode === url.short_code
              ? 'text-green-400 bg-green-400/10'
              : 'text-muted hover:text-white hover:bg-white/5'
          }`}
        >
          {copiedCode === url.short_code ? <Check size={14} /> : <Copy size={14} />}
        </button>
        <button
          onClick={() => onDelete(url.short_code)}
          className="p-2 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-all"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [userUrls, setUserUrls] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState(null)
  const [showNewLink, setShowNewLink] = useState(false)
  const [newUrl, setNewUrl] = useState('')
  const [customCode, setCustomCode] = useState('')
  const [creating, setCreating] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const [urlsRes, statsRes] = await Promise.all([urlsAPI.list(), urlsAPI.stats()])
      setUserUrls(urlsRes.data)
      setStats(statsRes.data)
    } catch {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleDelete = async (code) => {
    try {
      await urlsAPI.delete(code)
      setUserUrls((prev) => prev.filter((u) => u.short_code !== code))
      setStats((s) => s ? { ...s, total_urls: s.total_urls - 1 } : s)
      toast.success('Link deleted')
    } catch {
      toast.error('Could not delete')
    }
  }

  const handleCopy = (code, url) => {
    navigator.clipboard.writeText(url)
    setCopiedCode(code)
    toast.success('Copied!')
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handleCreate = async () => {
    if (!newUrl.trim()) return
    let url = newUrl.trim()
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url
    setCreating(true)
    try {
      const { data } = await urlsAPI.shorten({ original_url: url, custom_code: customCode || undefined })
      setUserUrls((prev) => [data, ...prev])
      setStats((s) => s ? { ...s, total_urls: s.total_urls + 1 } : s)
      setNewUrl('')
      setCustomCode('')
      setShowNewLink(false)
      toast.success('Link created!')
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to create link')
    } finally {
      setCreating(false)
    }
  }

  // Chart data: top 8 links by clicks
  const chartData = [...userUrls]
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 8)
    .map((u) => ({ name: '/' + u.short_code, clicks: u.clicks }))

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs">
          <p className="font-mono text-violet-300">{payload[0].payload.name}</p>
          <p className="text-white">{payload[0].value} clicks</p>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">
            Hey, {user?.username} 👋
          </h1>
          <p className="text-sm text-muted mt-0.5">Here's how your links are doing.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowNewLink(!showNewLink)}>
          {showNewLink ? <X size={16} /> : <Plus size={16} />}
          {showNewLink ? 'Cancel' : 'New link'}
        </button>
      </div>

      {/* New link form */}
      {showNewLink && (
        <div className="card p-5 mb-6 animate-fade-up">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Link2 size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input
                className="input-field pl-10"
                placeholder="https://long-url-to-shorten.com"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                autoFocus
              />
            </div>
            <input
              className="input-field w-40"
              placeholder="custom code"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
            />
            <button className="btn-primary shrink-0" onClick={handleCreate} disabled={creating}>
              {creating ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Scissors size={16} />
              )}
              Snip
            </button>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Total links" value={stats?.total_urls} icon={LinkIcon} color="violet" />
        <StatCard label="Total clicks" value={stats?.total_clicks} icon={MousePointerClick} color="cyan" />
        <StatCard label="Active" value={stats?.active_urls} icon={Activity} color="green" />
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="card p-5 mb-6">
          <h3 className="font-display font-semibold text-sm text-zinc-300 mb-4 flex items-center gap-2">
            <TrendingUp size={15} className="text-violet-400" />
            Top links by clicks
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} barSize={24}>
              <XAxis dataKey="name" tick={{ fill: '#52525E', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#52525E', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(139,92,246,0.06)' }} />
              <Bar dataKey="clicks" radius={[6, 6, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? '#8B5CF6' : '#3F3F46'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Links list */}
      <div>
        <h3 className="font-display font-semibold text-sm text-zinc-300 mb-3 flex items-center gap-2">
          <LinkIcon size={15} className="text-violet-400" />
          Your links
          <span className="ml-auto text-xs text-muted font-normal font-body">{userUrls.length} total</span>
        </h3>

        {userUrls.length === 0 ? (
          <div className="card p-12 flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center">
              <Scissors size={22} className="text-violet-400" />
            </div>
            <p className="text-zinc-300 font-medium">No links yet</p>
            <p className="text-sm text-muted">Create your first short link above.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {userUrls.map((url) => (
              <URLRow
                key={url.id}
                url={url}
                onDelete={handleDelete}
                onCopy={handleCopy}
                copiedCode={copiedCode}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
