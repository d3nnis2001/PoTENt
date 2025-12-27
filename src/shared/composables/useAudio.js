// src/shared/composables/useAudio.js - Mit Asset Imports
import { ref, computed } from 'vue'

// Audio-Dateien als Module importieren
import gameStartAudio from '@/assets/games/hacke-dicht/audio/Wer wird Millionär Soundtracks [19] - Sicherheitsstufe 2.mp3'
import questions1to5Audio from '@/assets/games/hacke-dicht/audio/Wer wird Millionär Soundtracks [2] - 50-500 €.mp3'
import questions6to10Audio from '@/assets/games/hacke-dicht/audio/Wer wird Millionär Soundtracks [5] - 1.000-16.000 €.mp3'
import questions11to15Audio from '@/assets/games/hacke-dicht/audio/Wer wird Millionr Soundtracks 8  32000500000.mp3'
import correctAnswerAudio from '@/assets/games/hacke-dicht/audio/Wer wird Millionär Soundtracks [7] - 1.000-16.000 € [Antwort Richtig].mp3'
import fiftyFiftyJokerAudio from '@/assets/games/hacke-dicht/audio/Wer wird Millionär Soundtracks [14] - 50_50 Joker.mp3'
import introSoundAudio from '@/assets/games/hacke-dicht/audio/Wer wird Millionär Soundtracks [1] - Intro-Sound.mp3'
import selectionSoundAudio from '@/assets/games/hacke-dicht/audio/Wer wird Millionär Soundtracks [21] - Sound nach Auswahlrunde.mp3'

export function useAudio() {
  const isAudioEnabled = ref(true)
  const currentAudio = ref(null)
  const isPlaying = ref(false)

  // Audio-Dateien Mapping mit importierten Assets
  const audioFiles = {
    gameStart: gameStartAudio,
    questions1to5: questions1to5Audio,
    questions6to10: questions6to10Audio,
    questions11to15: questions11to15Audio,
    correctAnswer: correctAnswerAudio,
    fiftyFiftyJoker: fiftyFiftyJokerAudio,
    introSound: introSoundAudio,
    selectionSound: selectionSoundAudio
  }

  // Audio laden und abspielen
  const playAudio = async (audioKey, options = {}) => {
    if (!isAudioEnabled.value) {
      console.log(`Audio deaktiviert - ${audioKey} übersprungen`)
      return
    }

    if (!audioFiles[audioKey]) {
      console.error(`Audio-Datei nicht gefunden: ${audioKey}`)
      console.log('Verfügbare Audio-Keys:', Object.keys(audioFiles))
      return
    }

    try {
      // Vorheriges Audio stoppen
      if (currentAudio.value) {
        currentAudio.value.pause()
        currentAudio.value.currentTime = 0
      }

      const audioSrc = audioFiles[audioKey]
      console.log(`Lade Audio: ${audioKey}`)
      console.log(`Audio-Source:`, audioSrc)
      
      const audio = new Audio(audioSrc)
      
      // Audio Einstellungen
      audio.volume = options.volume || 0.7
      audio.loop = options.loop || false
      audio.preload = 'auto'
      
      currentAudio.value = audio
      isPlaying.value = true

      // Event Listener
      audio.addEventListener('loadstart', () => {
        console.log(`✅ Audio wird geladen: ${audioKey}`)
      })

      audio.addEventListener('canplay', () => {
        console.log(`✅ Audio bereit: ${audioKey}`)
      })

      audio.addEventListener('ended', () => {
        console.log(`✅ Audio beendet: ${audioKey}`)
        isPlaying.value = false
        if (options.onEnded) options.onEnded()
      })

      audio.addEventListener('error', (e) => {
        console.error(`❌ Audio-Fehler für ${audioKey}:`, {
          error: e,
          src: audioSrc,
          networkState: audio.networkState,
          readyState: audio.readyState
        })
        isPlaying.value = false
        
        // Detaillierte Fehlermeldung
        if (audio.error) {
          switch (audio.error.code) {
            case audio.error.MEDIA_ERR_ABORTED:
              console.warn(`Audio abgebrochen: ${audioKey}`)
              break
            case audio.error.MEDIA_ERR_NETWORK:
              console.warn(`Netzwerkfehler beim Laden von: ${audioKey}`)
              break
            case audio.error.MEDIA_ERR_DECODE:
              console.warn(`Dekodierungsfehler: ${audioKey}`)
              break
            case audio.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
              console.warn(`Audio-Format nicht unterstützt: ${audioKey}`)
              break
            default:
              console.warn(`Unbekannter Audio-Fehler: ${audioKey}`)
          }
        }
      })

      // Audio abspielen mit User-Interaction Fallback
      try {
        await audio.play()
        console.log(`🎵 Audio gestartet: ${audioKey} (Lautstärke: ${audio.volume}, Loop: ${audio.loop})`)
      } catch (playError) {
        if (playError.name === 'NotAllowedError') {
          console.warn('🚫 Audio-Wiedergabe wurde vom Browser blockiert. Erste Benutzerinteraktion erforderlich.')
          // Audio für spätere Wiedergabe vorbereiten
          const playOnUserInteraction = () => {
            audio.play().then(() => {
              console.log(`🎵 Audio gestartet nach Benutzerinteraktion: ${audioKey}`)
              document.removeEventListener('click', playOnUserInteraction)
              document.removeEventListener('keydown', playOnUserInteraction)
            }).catch(err => console.error('Delayed audio play failed:', err))
          }
          
          document.addEventListener('click', playOnUserInteraction, { once: true })
          document.addEventListener('keydown', playOnUserInteraction, { once: true })
        } else {
          throw playError
        }
      }

    } catch (error) {
      console.error(`❌ Fehler beim Abspielen von ${audioKey}:`, error)
      isPlaying.value = false
    }
  }

  // Audio stoppen
  const stopAudio = () => {
    if (currentAudio.value) {
      currentAudio.value.pause()
      currentAudio.value.currentTime = 0
      isPlaying.value = false
      console.log('🛑 Audio gestoppt')
    }
  }

  // Audio pausieren/fortsetzen
  const toggleAudio = () => {
    if (currentAudio.value) {
      if (isPlaying.value) {
        currentAudio.value.pause()
        isPlaying.value = false
        console.log('⏸️ Audio pausiert')
      } else {
        currentAudio.value.play().then(() => {
          isPlaying.value = true
          console.log('▶️ Audio fortgesetzt')
        }).catch(err => {
          console.error('Resume audio failed:', err)
        })
      }
    }
  }

  // Audio aktivieren/deaktivieren
  const toggleAudioEnabled = () => {
    isAudioEnabled.value = !isAudioEnabled.value
    console.log(`🔊 Audio ${isAudioEnabled.value ? 'aktiviert' : 'deaktiviert'}`)
    
    if (!isAudioEnabled.value) {
      stopAudio()
    }
    
    // In localStorage speichern
    localStorage.setItem('audioEnabled', isAudioEnabled.value.toString())
  }

  // Spezifische Audio-Funktionen
  const playQuestionAudio = (questionNumber) => {
    console.log(`🎵 Spiele Fragen-Audio für Frage ${questionNumber}`)
    
    if (questionNumber <= 5) {
      playAudio('questions1to5', { loop: true, volume: 0.5 })
    } else if (questionNumber <= 10) {
      playAudio('questions6to10', { loop: true, volume: 0.5 })
    } else {
      playAudio('questions11to15', { loop: true, volume: 0.5 })
    }
  }

  const playCorrectAnswerAudio = () => {
    console.log('🎵 Spiele Richtige-Antwort-Audio')
    playAudio('correctAnswer', { volume: 0.8 })
  }

  const playJokerAudio = (jokerType) => {
    console.log(`🎵 Spiele Joker-Audio: ${jokerType}`)
    
    if (jokerType === 'fiftyFifty') {
      playAudio('fiftyFiftyJoker', { volume: 0.8 })
    }
    // Hier können weitere Joker-Sounds hinzugefügt werden
  }

  const playGameStartAudio = () => {
    console.log('🎵 Spiele Spielstart-Audio')
    playAudio('gameStart', { volume: 0.7 })
  }

  // Audio-Test Funktion für Debugging
  const testAudio = (audioKey) => {
    console.log(`🧪 Teste Audio: ${audioKey}`)
    playAudio(audioKey, { volume: 0.5 })
  }

  // Initialisierung
  const initAudio = () => {
    console.log('🎵 Audio-System initialisiert')
    
    // Audio-Einstellung aus localStorage laden
    const saved = localStorage.getItem('audioEnabled')
    if (saved !== null) {
      isAudioEnabled.value = saved === 'true'
    }
    
    // Debug: Zeige alle verfügbaren Audio-Dateien
    console.log('📁 Verfügbare Audio-Dateien:', Object.keys(audioFiles))
    
    // Teste ob alle Audio-Dateien korrekt importiert wurden
    Object.entries(audioFiles).forEach(([key, src]) => {
      console.log(`📄 ${key}: ${src}`)
    })
  }

  return {
    // State
    isAudioEnabled,
    isPlaying,
    currentAudio,
    audioFiles, // Für Debug-Zwecke
    
    // Methoden
    playAudio,
    stopAudio,
    toggleAudio,
    toggleAudioEnabled,
    playQuestionAudio,
    playCorrectAnswerAudio,
    playJokerAudio,
    playGameStartAudio,
    testAudio,
    initAudio
  }
}