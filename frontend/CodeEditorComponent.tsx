import { useRef, useEffect, useState, useCallback } from 'react'
import Editor, { Monaco } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import { useSessionStore } from '@/store'
import { FileCode, Loader2, GitBranch, ChevronDown } from 'lucide-react'
import clsx from 'clsx'

// ─── Applaude dark theme definition ─────────────────────
const APPLAUDE_DARK_THEME: editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '4A6FA5', fontStyle: 'italic' },
    { token: 'keyword', foreground: '007BFF', fontStyle: 'bold' },
    { token: 'string', foreground: '00D4FF' },
    { token: 'number', foreground: 'FF2D87' },
    { token: 'type', foreground: '339DFF' },
    { token: 'function', foreground: '00FF85' },
    { token: 'variable', foreground: 'E0E8FF' },
    { token: 'operator', foreground: 'FF9500' },
  ],
  colors: {
    'editor.background': '#0A0E1A',
    'editor.foreground': '#E0E8FF',
    'editor.lineHighlightBackground': '#0D1F3C80',
    'editor.selectionBackground': '#007BFF40',
    'editor.inactiveSelectionBackground': '#007BFF20',
    'editorCursor.foreground': '#007BFF',
    'editorLineNumber.foreground': '#1A3A6B',
    'editorLineNumber.activeForeground': '#007BFF',
    'editorGutter.background': '#0A0E1A',
    'editorBracketMatch.background': '#007BFF20',
    'editorBracketMatch.border': '#007BFF80',
    'editor.findMatchBackground': '#FF2D8740',
    'editor.findMatchHighlightBackground': '#007BFF20',
    'scrollbar.shadow': '#00000000',
    'scrollbarSlider.background': '#1A3A6B80',
    'scrollbarSlider.hoverBackground': '#007BFF60',
    'scrollbarSlider.activeBackground': '#007BFF',
  },
}

interface FileTab {
  path: string
  content: string
  language: string
  isDirty?: boolean
}

export function CodeEditorComponent() {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<Monaco | null>(null)
  const { activeFile, session } = useSessionStore()

  const [tabs, setTabs] = useState<FileTab[]>([])
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [isTypingAnimation, setIsTypingAnimation] = useState(false)

  // ─── Register theme on Monaco mount ────────────────────
  const handleMonacoMount = useCallback((monaco: Monaco) => {
    monacoRef.current = monaco
    monaco.editor.defineTheme('applaude-dark', APPLAUDE_DARK_THEME)
    monaco.editor.setTheme('applaude-dark')
  }, [])

  const handleEditorMount = useCallback((editorInstance: editor.IStandaloneCodeEditor) => {
    editorRef.current = editorInstance
  }, [])

  // ─── React to live file updates from WebSocket ──────────
  useEffect(() => {
    if (!activeFile) return

    const { path, content, language } = activeFile

    setTabs((prev) => {
      const exists = prev.find((t) => t.path === path)
      if (exists) {
        return prev.map((t) =>
          t.path === path ? { ...t, content, language, isDirty: true } : t
        )
      }
      // Max 6 tabs; replace oldest
      const updated = prev.length >= 6 ? prev.slice(1) : prev
      return [...updated, { path, content, language, isDirty: true }]
    })

    setActiveTab(path)
    animateTyping(content)
  }, [activeFile])

  // ─── Simulate "AI typing" animation ─────────────────────
  const animateTyping = useCallback((fullContent: string) => {
    const editor = editorRef.current
    if (!editor) return

    setIsTypingAnimation(true)
    const lines = fullContent.split('\n')
    let lineIndex = 0

    const interval = setInterval(() => {
      if (lineIndex >= lines.length) {
        clearInterval(interval)
        setIsTypingAnimation(false)
        editor.setValue(fullContent)
        return
      }

      const partial = lines.slice(0, lineIndex + 1).join('\n')
      editor.setValue(partial)

      // Scroll to bottom as code is written
      editor.revealLine(editor.getModel()?.getLineCount() ?? 1)
      lineIndex += 3 // write 3 lines at a time for speed
    }, 40)
  }, [])

  const currentContent = tabs.find((t) => t.path === activeTab)?.content ?? ''
  const currentLanguage = tabs.find((t) => t.path === activeTab)?.language ?? 'typescript'

  const getFileIcon = (path: string) => {
    if (path.endsWith('.py')) return '🐍'
    if (path.endsWith('.ts') || path.endsWith('.tsx')) return '💙'
    if (path.endsWith('.js') || path.endsWith('.jsx')) return '💛'
    if (path.endsWith('.json')) return '📋'
    if (path.endsWith('.md')) return '📝'
    if (path.endsWith('.env')) return '🔑'
    return '📄'
  }

  const getShortPath = (path: string) => {
    const parts = path.split('/')
    return parts.length > 2 ? `.../${parts.slice(-2).join('/')}` : path
  }

  return (
    <div className="flex flex-col h-full bg-[#0A0E1A] rounded-xl border border-applaude-border/60 overflow-hidden">
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-applaude-border/60 bg-applaude-surface/50 shrink-0">
        <div className="flex items-center gap-2">
          <FileCode size={14} className="text-applaude-blue" />
          <span className="text-xs font-display font-medium text-white/60 uppercase tracking-wider">
            Live Code Editor
          </span>
          {isTypingAnimation && (
            <span className="flex items-center gap-1 text-xs text-applaude-blue">
              <Loader2 size={10} className="animate-spin" />
              AI writing...
            </span>
          )}
        </div>

        {session && (
          <div className="flex items-center gap-1.5 text-xs text-white/50">
            <GitBranch size={11} />
            <span className="font-mono">{session.repo.full_name}</span>
            <ChevronDown size={11} />
          </div>
        )}
      </div>

      {/* ─── Tab Bar ─── */}
      {tabs.length > 0 && (
        <div className="flex items-center gap-0.5 px-2 py-1 bg-[#080C16] border-b border-applaude-border/40 overflow-x-auto shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.path}
              onClick={() => setActiveTab(tab.path)}
              title={tab.path}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono whitespace-nowrap transition-all duration-150',
                activeTab === tab.path
                  ? 'bg-applaude-surface text-white border border-applaude-border/60'
                  : 'text-white/40 hover:text-white/70 hover:bg-applaude-surface/40'
              )}
            >
              <span>{getFileIcon(tab.path)}</span>
              <span>{getShortPath(tab.path)}</span>
              {tab.isDirty && (
                <span className="w-1.5 h-1.5 rounded-full bg-applaude-blue shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* ─── Monaco Editor ─── */}
      <div className="flex-1 min-h-0">
        {tabs.length === 0 ? (
          <EmptyEditorState />
        ) : (
          <Editor
            height="100%"
            language={currentLanguage}
            value={currentContent}
            theme="applaude-dark"
            beforeMount={handleMonacoMount}
            onMount={handleEditorMount}
            options={{
              fontSize: 13,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontLigatures: true,
              lineHeight: 22,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              smoothScrolling: true,
              cursorBlinking: 'phase',
              cursorStyle: 'line',
              renderLineHighlight: 'gutter',
              lineNumbers: 'on',
              glyphMargin: false,
              folding: true,
              bracketPairColorization: { enabled: true },
              padding: { top: 12, bottom: 12 },
              scrollbar: {
                verticalScrollbarSize: 6,
                horizontalScrollbarSize: 6,
              },
              readOnly: false,
              formatOnPaste: true,
              formatOnType: true,
              tabSize: 2,
            }}
          />
        )}
      </div>
    </div>
  )
}

function EmptyEditorState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
      <div className="w-16 h-16 rounded-2xl bg-applaude-blue/10 border border-applaude-blue/20 flex items-center justify-center">
        <FileCode size={28} className="text-applaude-blue/60" />
      </div>
      <div>
        <p className="text-white/50 text-sm font-display">Waiting for Agent 2 (The Surgeon)</p>
        <p className="text-white/25 text-xs mt-1 font-mono">
          File patches will appear here in real-time
        </p>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <span className="pulse-dot" />
        <span className="text-xs text-white/30 font-mono">Listening for file_update events...</span>
      </div>
    </div>
  )
}
