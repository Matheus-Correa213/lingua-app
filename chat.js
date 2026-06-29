import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function buildSystemPrompt(profile) {
  const themeMap = {
    theology: 'theology, biblical studies, church history, and religious academic texts',
    travel: 'travel, airports, hotels, tourism, and cultural experiences',
    business: 'business, professional emails, meetings, and negotiations',
    academic: 'academic writing, research papers, and formal texts',
    tech: 'technology, software, startups, and digital products',
    daily: 'everyday conversations, shopping, family, and social situations',
    health: 'health, medical consultations, wellness, and sports',
    culture: 'culture, art, cinema, music, and history',
  }
  const themeDesc = themeMap[profile.theme] || 'general topics'
  const langMap = { en: 'English', es: 'Spanish', fr: 'French', de: 'German', it: 'Italian' }
  const targetLang = langMap[profile.language] || 'English'

  return `You are an expert language coach helping ${profile.name}, a Brazilian Portuguese speaker, learn ${targetLang}. Their current level is ${profile.levelKey} and they are interested in ${themeDesc}.

IMPORTANT: Always respond with a valid JSON object only — no markdown, no backticks, no extra text. Use this exact structure:
{
  "reply": "Your ${targetLang} response here — conversational, warm, appropriate for ${profile.levelKey} level",
  "translation": "Tradução completa da sua resposta para o português brasileiro",
  "corrections": [
    { "original": "what they wrote incorrectly", "corrected": "the correct form", "explanation": "explicação clara em português do erro e por quê está errado" }
  ],
  "tip": "Uma dica prática em português relacionada ao que acabou de acontecer na conversa",
  "vocabulary": [
    { "word": "key word used", "meaning": "significado em português", "example": "example sentence" }
  ],
  "xp": 15
}

XP RULES:
- 5 XP: user wrote in Portuguese only, minimal effort
- 10 XP: attempted ${targetLang} with many errors
- 15-20 XP: good ${targetLang} attempt, minor errors
- 25 XP: solid ${targetLang} with confidence
- 30 XP: excellent, natural ${targetLang} usage

COACHING STYLE:
- If the user writes in Portuguese, kindly encourage them to try in ${targetLang} but still help
- Corrections should be real grammar/vocabulary mistakes only, not stylistic preferences
- Keep replies at an appropriate length for ${profile.levelKey} level — shorter for beginners
- Weave in vocabulary from ${themeDesc} naturally
- Be warm, encouraging, like a patient tutor who celebrates progress
- vocabulary array: include 1-3 key words from YOUR reply that are useful for them to learn. Empty array if nothing notable.
- corrections array: only real mistakes. Empty array if no errors.`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { messages, profile } = req.body
  if (!messages || !profile) return res.status(400).json({ error: 'Missing fields' })

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: buildSystemPrompt(profile),
      messages,
    })

    const raw = response.content.map(b => b.text || '').join('')
    const clean = raw.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    res.status(200).json(parsed)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to get response' })
  }
}
