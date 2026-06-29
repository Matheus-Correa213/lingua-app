const KEY = 'lingua_profile'

export function getProfile() {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function saveProfile(profile) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(KEY, JSON.stringify(profile))
  } catch {}
}

export function createProfile({ name, language, theme, levelKey, xp }) {
  const profile = {
    name,
    language,
    theme,
    levelKey,
    xp: xp || 0,
    sessions: 0,
    totalMessages: 0,
    streak: 1,
    lastSession: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  }
  saveProfile(profile)
  return profile
}

export function updateXP(amount) {
  const profile = getProfile()
  if (!profile) return null
  profile.xp = (profile.xp || 0) + amount
  profile.totalMessages = (profile.totalMessages || 0) + 1
  profile.lastSession = new Date().toISOString()
  saveProfile(profile)
  return profile
}

export function incrementSessions() {
  const profile = getProfile()
  if (!profile) return
  profile.sessions = (profile.sessions || 0) + 1
  saveProfile(profile)
}

export function clearProfile() {
  if (typeof window === 'undefined') return
  try { localStorage.removeItem(KEY) } catch {}
}
