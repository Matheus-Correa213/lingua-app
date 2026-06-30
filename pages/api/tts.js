// Text-to-speech using Web Speech API (free, no API key needed)
// This file documents the TTS approach used in the frontend
// The actual TTS happens client-side via window.speechSynthesis

export default function handler(req, res) {
  res.status(200).json({ 
    message: 'TTS handled client-side via Web Speech API',
    supported: true 
  })
}
