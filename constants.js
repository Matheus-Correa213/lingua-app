export const LANGUAGES = [
  { id: 'en', name: 'English', flag: '🇺🇸', native: 'Inglês' },
  { id: 'es', name: 'Spanish', flag: '🇪🇸', native: 'Espanhol' },
  { id: 'fr', name: 'French', flag: '🇫🇷', native: 'Francês' },
  { id: 'de', name: 'German', flag: '🇩🇪', native: 'Alemão' },
  { id: 'it', name: 'Italian', flag: '🇮🇹', native: 'Italiano' },
]

export const THEMES = [
  { id: 'theology', label: 'Teologia & Fé', icon: '✝️', desc: 'Vocabulário bíblico, sermões, leitura acadêmica religiosa' },
  { id: 'travel', label: 'Viagens', icon: '✈️', desc: 'Aeroportos, hotéis, restaurantes, turismo' },
  { id: 'business', label: 'Negócios', icon: '💼', desc: 'Reuniões, e-mails profissionais, negociações' },
  { id: 'academic', label: 'Acadêmico', icon: '📚', desc: 'Artigos, livros, pesquisa, escrita formal' },
  { id: 'tech', label: 'Tecnologia', icon: '💻', desc: 'TI, startups, produto digital, programação' },
  { id: 'daily', label: 'Cotidiano', icon: '☕', desc: 'Conversas do dia a dia, compras, família' },
  { id: 'health', label: 'Saúde', icon: '🏥', desc: 'Consultas médicas, bem-estar, esportes' },
  { id: 'culture', label: 'Cultura & Arte', icon: '🎭', desc: 'Cinema, música, literatura, história' },
]

export const PHASES = [
  { id: 1, key: 'A1', name: 'Iniciante', emoji: '🌱', minXP: 0, maxXP: 300, color: '#34d399', desc: 'Apresentações, saudações e frases básicas' },
  { id: 2, key: 'A2', name: 'Básico', emoji: '🏙️', minXP: 300, maxXP: 700, color: '#60a5fa', desc: 'Situações do cotidiano, perguntas simples' },
  { id: 3, key: 'B1', name: 'Intermediário', emoji: '💬', minXP: 700, maxXP: 1300, color: '#a78bfa', desc: 'Expressar opiniões, narrar eventos' },
  { id: 4, key: 'B2', name: 'Avançado', emoji: '📚', minXP: 1300, maxXP: 2200, color: '#fbbf24', desc: 'Textos complexos, debates, nuances' },
  { id: 5, key: 'C1', name: 'Fluente', emoji: '🌟', minXP: 2200, maxXP: 3500, color: '#f472b6', desc: 'Fluência natural em qualquer contexto' },
]

export const LEVEL_TEST = [
  {
    id: 1,
    question: 'What is your name?',
    options: ['My name is João.', 'I have João.', 'João is name.', 'Name I João.'],
    correct: 0,
    level: 'A1',
  },
  {
    id: 2,
    question: 'Choose the correct sentence:',
    options: [
      'She go to school every day.',
      'She goes to school every day.',
      'She going to school every day.',
      'She goed to school every day.',
    ],
    correct: 1,
    level: 'A2',
  },
  {
    id: 3,
    question: 'Complete: "If I ___ more time, I would study more."',
    options: ['have', 'had', 'has', 'having'],
    correct: 1,
    level: 'B1',
  },
  {
    id: 4,
    question: 'What does "ubiquitous" mean?',
    options: ['Rare and unusual', 'Found everywhere', 'Very expensive', 'Difficult to understand'],
    correct: 1,
    level: 'B2',
  },
  {
    id: 5,
    question: 'Choose the most natural sentence:',
    options: [
      'The report, which had been submitted last week, was thorough.',
      'The report which last week had been submitted was thorough.',
      'Last week the report that was submitted it was thorough.',
      'The report was submitted last week and it was thorough thing.',
    ],
    correct: 0,
    level: 'B2',
  },
  {
    id: 6,
    question: '"The bill passed despite widespread opposition." — What does "despite" indicate?',
    options: ['Cause', 'Contrast', 'Addition', 'Result'],
    correct: 1,
    level: 'C1',
  },
]

export function calculateLevel(answers) {
  const correct = answers.filter(Boolean).length
  if (correct <= 1) return 'A1'
  if (correct === 2) return 'A2'
  if (correct === 3) return 'B1'
  if (correct === 4) return 'B1'
  if (correct === 5) return 'B2'
  return 'C1'
}

export function getPhaseByKey(key) {
  return PHASES.find(p => p.key === key) || PHASES[0]
}

export function getXPForLevel(levelKey) {
  const phase = getPhaseByKey(levelKey)
  return phase ? phase.minXP : 0
}
