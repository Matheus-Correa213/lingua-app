import { useState } from 'react'
import { useRouter } from 'next/router'
import { LANGUAGES, THEMES, LEVEL_TEST, calculateLevel, getXPForLevel } from '../lib/constants'
import { createProfile } from '../lib/storage'

const STEPS = ['name', 'language', 'theme', 'test', 'result']

export default function Onboarding() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [language, setLanguage] = useState(null)
  const [theme, setTheme] = useState(null)
  const [testIndex, setTestIndex] = useState(0)
  const [answers, setAnswers] = useState([])
  const [selected, setSelected] = useState(null)
  const [levelResult, setLevelResult] = useState(null)

  const current = STEPS[step]

  const next = () => setStep(s => s + 1)

  const answerQuestion = (optionIndex) => {
    setSelected(optionIndex)
    setTimeout(() => {
      const q = LEVEL_TEST[testIndex]
      const isCorrect = optionIndex === q.correct
      const newAnswers = [...answers, isCorrect]
      setAnswers(newAnswers)
      setSelected(null)

      if (testIndex + 1 < LEVEL_TEST.length) {
        setTestIndex(i => i + 1)
      } else {
        const level = calculateLevel(newAnswers)
        setLevelResult(level)
        next()
      }
    }, 700)
  }

  const finish = () => {
    const xp = getXPForLevel(levelResult)
    createProfile({ name, language: language.id, theme: theme.id, levelKey: levelResult, xp })
    router.push('/app')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      
      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 48 }}>
        {STEPS.slice(0, -1).map((s, i) => (
          <div key={s} style={{
            width: i === step ? 24 : 8, height: 8, borderRadius: 999,
            background: i <= step ? 'var(--accent)' : 'var(--border)',
            transition: 'all 0.3s ease',
          }} />
        ))}
      </div>

      <div style={{ width: '100%', maxWidth: 480 }} className="fade-up">

        {/* STEP: Name */}
        {current === 'name' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>👋</div>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Bem-vindo ao Língua</h1>
            <p style={{ color: 'var(--muted)', marginBottom: 40 }}>Seu coach de idiomas com IA. Vamos começar.</p>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && name.trim() && next()}
              placeholder="Qual é o seu nome?"
              style={{
                width: '100%', background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 12, padding: '14px 18px', color: 'var(--text)', fontSize: 16,
                outline: 'none', marginBottom: 16, fontFamily: 'inherit',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <button
              onClick={next}
              disabled={!name.trim()}
              style={{
                width: '100%', background: name.trim() ? 'var(--accent)' : 'var(--border)',
                color: name.trim() ? 'white' : 'var(--muted)', border: 'none',
                borderRadius: 12, padding: '14px', fontSize: 16, fontWeight: 600,
                cursor: name.trim() ? 'pointer' : 'default', fontFamily: 'inherit',
                transition: 'background 0.2s',
              }}
            >
              Continuar →
            </button>
          </div>
        )}

        {/* STEP: Language */}
        {current === 'language' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>
              Olá, {name}! Qual idioma?
            </h2>
            <p style={{ color: 'var(--muted)', textAlign: 'center', marginBottom: 32 }}>
              Escolha o idioma que quer aprender
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {LANGUAGES.map(lang => (
                <button
                  key={lang.id}
                  onClick={() => { setLanguage(lang); setTimeout(next, 200) }}
                  style={{
                    background: language?.id === lang.id ? 'var(--accent-soft)' : 'var(--surface)',
                    border: `1px solid ${language?.id === lang.id ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 12, padding: '16px 20px',
                    display: 'flex', alignItems: 'center', gap: 16,
                    cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (language?.id !== lang.id) e.currentTarget.style.borderColor = '#374151' }}
                  onMouseLeave={e => { if (language?.id !== lang.id) e.currentTarget.style.borderColor = 'var(--border)' }}
                >
                  <span style={{ fontSize: 28 }}>{lang.flag}</span>
                  <div>
                    <div style={{ color: 'var(--text)', fontWeight: 600, fontSize: 16 }}>{lang.native}</div>
                    <div style={{ color: 'var(--muted)', fontSize: 13 }}>{lang.name}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP: Theme */}
        {current === 'theme' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>
              Qual é o seu mundo?
            </h2>
            <p style={{ color: 'var(--muted)', textAlign: 'center', marginBottom: 32 }}>
              As aulas vão usar vocabulário deste tema
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {THEMES.map(t => (
                <button
                  key={t.id}
                  onClick={() => { setTheme(t); setTimeout(next, 200) }}
                  style={{
                    background: theme?.id === t.id ? 'var(--accent-soft)' : 'var(--surface)',
                    border: `1px solid ${theme?.id === t.id ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 12, padding: '16px 14px',
                    cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ fontSize: 26, marginBottom: 8 }}>{t.icon}</div>
                  <div style={{ color: 'var(--text)', fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{t.label}</div>
                  <div style={{ color: 'var(--muted)', fontSize: 12, lineHeight: 1.4 }}>{t.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP: Level Test */}
        {current === 'test' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 700 }}>Teste de nível</h2>
                <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>Questão {testIndex + 1} de {LEVEL_TEST.length}</p>
              </div>
              <div style={{
                background: 'var(--accent-soft)', color: 'var(--accent)',
                borderRadius: 20, padding: '4px 12px', fontSize: 13, fontWeight: 600,
              }}>
                {Math.round(((testIndex) / LEVEL_TEST.length) * 100)}%
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ height: 4, background: 'var(--border)', borderRadius: 999, marginBottom: 32 }}>
              <div style={{
                height: 4, background: 'var(--accent)', borderRadius: 999,
                width: `${(testIndex / LEVEL_TEST.length) * 100}%`,
                transition: 'width 0.3s ease',
              }} />
            </div>

            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 16, padding: '20px 24px', marginBottom: 24,
              fontSize: 18, fontWeight: 500, lineHeight: 1.5,
            }}>
              {LEVEL_TEST[testIndex].question}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {LEVEL_TEST[testIndex].options.map((opt, i) => {
                const isSelected = selected === i
                const isCorrect = i === LEVEL_TEST[testIndex].correct
                let borderColor = 'var(--border)'
                let bg = 'var(--surface)'
                let textColor = 'var(--text)'

                if (selected !== null) {
                  if (isSelected && isCorrect) { borderColor = 'var(--green)'; bg = 'rgba(52,211,153,0.1)' }
                  else if (isSelected && !isCorrect) { borderColor = 'var(--red)'; bg = 'rgba(248,113,113,0.1)' }
                  else if (isCorrect) { borderColor = 'var(--green)'; bg = 'rgba(52,211,153,0.05)' }
                }

                return (
                  <button
                    key={i}
                    onClick={() => selected === null && answerQuestion(i)}
                    style={{
                      background: bg, border: `1px solid ${borderColor}`,
                      borderRadius: 12, padding: '14px 18px',
                      color: textColor, cursor: selected === null ? 'pointer' : 'default',
                      textAlign: 'left', fontSize: 15, fontFamily: 'inherit',
                      transition: 'all 0.2s', lineHeight: 1.4,
                    }}
                    onMouseEnter={e => { if (selected === null) e.currentTarget.style.borderColor = 'var(--accent)' }}
                    onMouseLeave={e => { if (selected === null) e.currentTarget.style.borderColor = 'var(--border)' }}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* STEP: Result */}
        {current === 'result' && levelResult && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>
              {levelResult === 'A1' ? '🌱' : levelResult === 'A2' ? '🏙️' : levelResult === 'B1' ? '💬' : levelResult === 'B2' ? '📚' : '🌟'}
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
              Seu nível: {levelResult}
            </h2>
            <p style={{ color: 'var(--muted)', marginBottom: 40, fontSize: 16, lineHeight: 1.6 }}>
              {levelResult === 'A1' && 'Ótimo começo! Vamos construir sua base do zero.'}
              {levelResult === 'A2' && 'Você já conhece o básico. Hora de expandir!'}
              {levelResult === 'B1' && 'Nível intermediário. Você já se vira bem!'}
              {levelResult === 'B2' && 'Nível avançado. Vamos refinar sua fluência.'}
              {levelResult === 'C1' && 'Quase fluente! Vamos trabalhar as nuances.'}
            </p>
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 16, padding: '20px', marginBottom: 32, textAlign: 'left',
            }}>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Seu perfil</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Nome', value: name },
                  { label: 'Idioma', value: LANGUAGES.find(l => l.id === language?.id)?.native },
                  { label: 'Tema', value: THEMES.find(t => t.id === theme?.id)?.label },
                  { label: 'Nível inicial', value: levelResult },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15 }}>
                    <span style={{ color: 'var(--muted)' }}>{item.label}</span>
                    <span style={{ fontWeight: 600 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={finish}
              style={{
                width: '100%', background: 'var(--accent)', color: 'white',
                border: 'none', borderRadius: 12, padding: '16px', fontSize: 17,
                fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Começar a aprender →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
