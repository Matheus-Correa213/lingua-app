import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { getProfile, updateXP, incrementSessions } from '../lib/storage'
import { PHASES, THEMES, LANGUAGES } from '../lib/constants'

function XPBar({ xp, phase }) {
  const pct = Math.min(100, ((xp - phase.minXP) / (phase.maxXP - phase.minXP)) * 100)
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>
        <span>{phase.emoji} {phase.name} ({phase.key})</span>
        <span>{xp} / {phase.maxXP} XP</span>
      </div>
      <div style={{ height: 5, background: 'var(--border)', borderRadius: 999 }}>
        <div style={{ height: 5, width: `${pct}%`, background: phase.color, borderRadius: 999, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  )
}

function speak(text, lang) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  const langMap = { en: 'en-US', es: 'es-ES', fr: 'fr-FR', de: 'de-DE', it: 'it-IT' }
  utt.lang = langMap[lang] || 'en-US'
  utt.rate = 0.85
  window.speechSynthesis.speak(utt)
}

export default function App() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showTranslations, setShowTranslations] = useState(true)
  const [showCorrections, setShowCorrections] = useState(true)
  const [showVocab, setShowVocab] = useState(true)
  const [xpFlash, setXpFlash] = useState(null)
  const [sessionXP, setSessionXP] = useState(0)
  const [listening, setListening] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    const p = getProfile()
    if (!p) { router.push('/onboarding'); return }
    setProfile(p)
    incrementSessions()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const currentPhase = profile
    ? PHASES.find(p => profile.xp >= p.minXP && profile.xp < p.maxXP) || PHASES[PHASES.length - 1]
    : PHASES[0]

  const flashXP = (amount) => {
    setXpFlash(`+${amount} XP`)
    setTimeout(() => setXpFlash(null), 1800)
  }

  const sendMessage = async (text) => {
    if (!text.trim() || loading || !profile) return
    const userMsg = { role: 'user', content: text }
    const newHistory = [...messages, userMsg]
    setMessages(prev => [...prev, { role: 'user', text }])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory,
          profile,
        }),
      })
      const data = await res.json()

      const aiMsg = {
        role: 'assistant',
        text: data.reply,
        translation: data.translation,
        corrections: data.corrections || [],
        tip: data.tip,
        vocabulary: data.vocabulary || [],
        xp: data.xp || 10,
      }

      setMessages(prev => [...prev, aiMsg])
      const updatedProfile = updateXP(data.xp || 10)
      if (updatedProfile) setProfile(updatedProfile)
      setSessionXP(prev => prev + (data.xp || 10))
      flashXP(data.xp || 10)

      // Auto-speak the reply
      if (data.reply) speak(data.reply, profile.language)

    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: 'Sorry, something went wrong. Please try again!',
        translation: 'Ops, algo deu errado. Tente novamente!',
        corrections: [], tip: null, vocabulary: [], xp: 0,
      }])
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Seu navegador não suporta reconhecimento de voz. Tente o Chrome.')
      return
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const rec = new SR()
    const langMap = { en: 'en-US', es: 'es-ES', fr: 'fr-FR', de: 'de-DE', it: 'it-IT' }
    rec.lang = langMap[profile?.language] || 'en-US'
    rec.interimResults = false
    rec.onstart = () => setListening(true)
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript
      setInput(transcript)
      setListening(false)
    }
    rec.onerror = () => setListening(false)
    rec.onend = () => setListening(false)
    rec.start()
    recognitionRef.current = rec
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
    setListening(false)
  }

  const themeLabel = profile ? THEMES.find(t => t.id === profile.theme)?.label : ''
  const langLabel = profile ? LANGUAGES.find(l => l.id === profile.language) : null

  const STARTERS = [
    'Tell me about yourself',
    'What did you do today?',
    'What is your favorite book?',
    'Describe your work to me',
    'What are your goals?',
  ]

  if (!profile) return null

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)', overflow: 'hidden' }}>

      {/* Sidebar */}
      {showSidebar && (
        <div style={{
          width: 280, background: 'var(--surface)', borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', padding: 20, gap: 20, overflowY: 'auto',
          position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: 18 }}>🌐 Língua</span>
            <button onClick={() => setShowSidebar(false)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 20 }}>✕</button>
          </div>

          {/* Profile */}
          <div style={{ background: 'var(--surface2)', borderRadius: 12, padding: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{profile.name}</div>
            <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 12 }}>{langLabel?.flag} {langLabel?.native} • {themeLabel}</div>
            <XPBar xp={profile.xp} phase={currentPhase} />
          </div>

          {/* Phases */}
          <div>
            <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Trilha de progresso</div>
            {PHASES.map(p => {
              const unlocked = profile.xp >= p.minXP
              const active = p.id === currentPhase.id
              return (
                <div key={p.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 10, marginBottom: 6,
                  background: active ? 'var(--accent-soft)' : 'transparent',
                  border: `1px solid ${active ? 'var(--accent)' : 'transparent'}`,
                  opacity: unlocked ? 1 : 0.4,
                }}>
                  <span style={{ fontSize: 18 }}>{p.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: active ? 'var(--accent)' : 'var(--text)' }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{p.key} • {p.minXP}–{p.maxXP} XP</div>
                  </div>
                  {!unlocked && <span style={{ fontSize: 12 }}>🔒</span>}
                  {active && <span style={{ fontSize: 10, background: 'var(--accent)', color: 'white', padding: '2px 6px', borderRadius: 10, fontWeight: 700 }}>ATUAL</span>}
                </div>
              )
            })}
          </div>

          {/* Toggles */}
          <div>
            <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Opções</div>
            {[
              { label: '🇧🇷 Traduções', value: showTranslations, set: setShowTranslations },
              { label: '✏️ Correções', value: showCorrections, set: setShowCorrections },
              { label: '📖 Vocabulário', value: showVocab, set: setShowVocab },
            ].map(opt => (
              <div key={opt.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 14, color: 'var(--text)' }}>{opt.label}</span>
                <button
                  onClick={() => opt.set(v => !v)}
                  style={{
                    width: 40, height: 22, borderRadius: 11,
                    background: opt.value ? 'var(--accent)' : 'var(--border)',
                    border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
                  }}
                >
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%', background: 'white',
                    position: 'absolute', top: 3, left: opt.value ? 21 : 3, transition: 'left 0.2s',
                  }} />
                </button>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div style={{ background: 'var(--surface2)', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Estatísticas</div>
            {[
              { label: 'XP Total', value: profile.xp },
              { label: 'Sessões', value: profile.sessions || 1 },
              { label: 'Mensagens', value: profile.totalMessages || 0 },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '4px 0' }}>
                <span style={{ color: 'var(--muted)' }}>{s.label}</span>
                <span style={{ fontWeight: 700 }}>{s.value}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => { if (confirm('Resetar todo o progresso?')) { localStorage.clear(); router.push('/onboarding') } }}
            style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '8px', color: 'var(--muted)', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}
          >
            Reiniciar do zero
          </button>
        </div>
      )}

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top bar */}
        <div style={{
          borderBottom: '1px solid var(--border)', padding: '10px 16px',
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'var(--bg)', flexShrink: 0,
        }}>
          <button onClick={() => setShowSidebar(true)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 22, lineHeight: 1, padding: 0 }}>☰</button>
          <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>🌐 Língua</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <XPBar xp={profile.xp} phase={currentPhase} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {xpFlash && (
              <span style={{ color: 'var(--green)', fontWeight: 700, fontSize: 14 }} className="xp-pop">
                {xpFlash}
              </span>
            )}
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>+{sessionXP} hoje</span>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {messages.length === 0 && (
            <div style={{ maxWidth: 560, margin: '20px auto', width: '100%' }}>
              <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>👋</div>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Olá, {profile.name}!</h2>
                <p style={{ color: 'var(--muted)', fontSize: 15 }}>
                  Praticando {langLabel?.native} com tema de {themeLabel}.<br />
                  Escreva ou fale em {langLabel?.native} para começar.
                </p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {STARTERS.map(s => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    style={{
                      background: 'var(--surface)', border: '1px solid var(--border)',
                      borderRadius: 10, padding: '12px 14px', color: 'var(--muted)',
                      fontSize: 13, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                      lineHeight: 1.4,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--text)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)' }}
                  >
                    "{s}"
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ maxWidth: 640, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {messages.map((msg, i) => (
              <div key={i} className="fade-up">
                {msg.role === 'user' ? (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{
                      background: 'var(--accent)', color: 'white',
                      borderRadius: '18px 18px 4px 18px',
                      padding: '10px 16px', maxWidth: '78%', fontSize: 15, lineHeight: 1.5,
                    }}>
                      {msg.text}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {/* Reply bubble */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, maxWidth: '85%' }}>
                      <div style={{
                        background: 'var(--surface)', border: '1px solid var(--border)',
                        borderRadius: '4px 18px 18px 18px',
                        padding: '12px 16px', fontSize: 15, lineHeight: 1.6, flex: 1,
                      }}>
                        {msg.text}
                      </div>
                      <button
                        onClick={() => speak(msg.text, profile.language)}
                        title="Ouvir pronuncia"
                        style={{
                          background: 'var(--surface2)', border: '1px solid var(--border)',
                          borderRadius: '50%', width: 34, height: 34, cursor: 'pointer',
                          fontSize: 16, flexShrink: 0, marginTop: 4, display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        🔊
                      </button>
                    </div>

                    {/* Translation */}
                    {showTranslations && msg.translation && (
                      <div style={{
                        background: 'var(--surface2)', borderRadius: 10, padding: '8px 14px',
                        fontSize: 13, color: 'var(--muted)', maxWidth: '80%',
                        borderLeft: '2px solid var(--border)',
                      }}>
                        🇧🇷 {msg.translation}
                      </div>
                    )}

                    {/* Corrections */}
                    {showCorrections && msg.corrections?.length > 0 && (
                      <div style={{ maxWidth: '80%', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {msg.corrections.map((c, ci) => (
                          <div key={ci} style={{
                            background: '#1c1510', borderRadius: 10, padding: '10px 14px',
                            fontSize: 13, borderLeft: '2px solid var(--amber)',
                          }}>
                            <div style={{ color: 'var(--red)', textDecoration: 'line-through', marginBottom: 2 }}>{c.original}</div>
                            <div style={{ color: 'var(--green)', marginBottom: 4 }}>✓ {c.corrected}</div>
                            <div style={{ color: 'var(--muted)' }}>{c.explanation}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Vocabulary */}
                    {showVocab && msg.vocabulary?.length > 0 && (
                      <div style={{ maxWidth: '80%' }}>
                        <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>📖 Vocabulário</div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {msg.vocabulary.map((v, vi) => (
                            <div key={vi} style={{
                              background: 'var(--surface2)', border: '1px solid var(--border)',
                              borderRadius: 8, padding: '6px 10px', fontSize: 13,
                            }}>
                              <span style={{ fontWeight: 600 }}>{v.word}</span>
                              <span style={{ color: 'var(--muted)' }}> — {v.meaning}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tip */}
                    {msg.tip && (
                      <div style={{ fontSize: 13, color: 'var(--muted)', maxWidth: '80%', padding: '4px 10px' }}>
                        💡 {msg.tip}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', gap: 6, padding: '14px 18px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px 18px 18px 18px', width: 'fit-content' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)',
                    animation: `pulse-dot 1.2s ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input area */}
        <div style={{
          borderTop: '1px solid var(--border)', padding: '12px 16px',
          background: 'var(--bg)', display: 'flex', gap: 10, alignItems: 'flex-end',
          maxWidth: 672, width: '100%', margin: '0 auto',
        }}>
          {/* Voice button */}
          <button
            onClick={listening ? stopListening : startListening}
            title={listening ? 'Parar gravação' : 'Falar'}
            style={{
              background: listening ? 'rgba(248,113,113,0.15)' : 'var(--surface)',
              border: `1px solid ${listening ? 'var(--red)' : 'var(--border)'}`,
              borderRadius: 10, padding: '10px', cursor: 'pointer',
              fontSize: 18, flexShrink: 0, lineHeight: 1,
              animation: listening ? 'pulse-dot 1s infinite' : 'none',
            }}
          >
            {listening ? '⏹️' : '🎙️'}
          </button>

          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage(input)
              }
            }}
            placeholder={`Write in ${langLabel?.name || 'English'}... (Enter to send)`}
            rows={1}
            style={{
              flex: 1, background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 12, padding: '10px 14px', color: 'var(--text)',
              fontSize: 15, fontFamily: 'inherit', resize: 'none', outline: 'none', lineHeight: 1.5,
            }}
            onInput={e => {
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />

          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            style={{
              background: input.trim() && !loading ? 'var(--accent)' : 'var(--border)',
              border: 'none', borderRadius: 10, padding: '10px 16px',
              color: input.trim() && !loading ? 'white' : 'var(--muted)',
              cursor: input.trim() && !loading ? 'pointer' : 'default',
              fontSize: 18, fontFamily: 'inherit', flexShrink: 0, lineHeight: 1,
              transition: 'background 0.2s',
            }}
          >
            →
          </button>
        </div>
      </div>
    </div>
  )
}
