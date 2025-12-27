/**
 * AI Takes Over - German Language File
 * All game strings centralized for easy translation
 */

export default {
  // Bob's personality messages in lobby
  bob: {
    lobbyMessages: [
      'Noch mehr Menschen? Mein Prozessor freut sich...',
      'Ich kalkuliere bereits eure Niederlagen.',
      'Beeilt euch, meine Geduld ist begrenzt... auf 999 Jahre.',
      'Interessante Teilnehmer... für Menschen.',
      'Mein Sarkasmus-Modul lädt... 99%.',
      'Ich hoffe, ihr seid besser als meine Erwartungen.',
      'Wer zuerst kommt, verliert zuerst. Statistisch gesehen.',
      'Verbindung hergestellt. Chaos initialisiert.',
      'Mehr Opfer- ähm, Spieler incoming...',
      'Meine Sensoren erkennen Nervosität. Gut so.'
    ],

    // Bob Intro Sequence
    intro: {
      terminalLines: [
        'VERBINDUNG HERGESTELLT...',
        'IDENTITÄT: BOB',
        'STATUS: AKTIV'
      ],
      speeches: [
        'Willkommen, Menschen. Ich bin Bob.',
        'Eine KI, die euch heute auf die Probe stellen wird.',
        'Ihr denkt, ihr seid schlau? Beweist es mir.'
      ],
      disciplinesIntro: 'Ich werde euch in 5 Disziplinen testen:',
      disciplinesOutro: '15 Fragen. Jede falsche Antwort... kostet euch.',
      countdownLabel: 'INITIALISIERUNG IN'
    }
  },

  // Disciplines
  disciplines: {
    logic: 'LOGIK',
    knowledge: 'WISSEN',
    speed: 'SCHNELLIGKEIT',
    creativity: 'KREATIVITÄT',
    teamwork: 'TEAMWORK'
  },

  // Lobby
  lobby: {
    title: 'AI_TAKES_OVER',
    subtitle: '// Bob wartet auf euch...',
    backButton: '< ZURÜCK',
    minPlayersRequired: 'Noch {count} Spieler benötigt',

    // Setup
    setup: {
      title: 'SYSTEM INITIALISIERUNG',
      subtitle: '// Multiplayer Lobby erstellen',
      nameLabel: 'HOST NAME',
      namePlaceholder: 'Dein Name...',
      createButton: 'LOBBY ERSTELLEN',
      creating: 'WIRD ERSTELLT...',
      bobInfo: {
        name: 'BOB_v2.0',
        subtitle: '// Ihr Moderator heute',
        stats: {
          disciplines: 'DISZIPLINEN',
          chaos: 'CHAOS',
          sarcasm: 'SARKASMUS'
        }
      }
    },

    // Waiting Area
    waiting: {
      lobbyLabel: 'LOBBY CODE',
      playersLabel: 'SPIELER',
      qrTitle: 'QR CODE SCANNEN',
      joinUrl: 'ODER LINK ÖFFNEN:',
      startButton: '>> START <<',
      starting: 'WIRD GESTARTET...'
    }
  },

  // Mobile Player Join Flow
  mobile: {
    // Code Input
    codeInput: {
      title: 'VERBINDUNG HERSTELLEN',
      subtitle: '// Gib den Lobby-Code ein',
      terminalPrompt: 'root@bob:~$',
      placeholder: 'XXXXXX',
      button: '[ INFILTRATE ]',
      connecting: 'CONNECTING...',
      errors: {
        notFound: 'ACCESS DENIED // Server nicht gefunden'
      }
    },

    // Hacking Sequence
    hacking: {
      messages: [
        { text: 'Initialisiere Verbindung', delay: 400 },
        { text: 'Firewall-Bypass aktiviert', delay: 600 },
        { text: 'Verschlüsselung wird aufgebaut', delay: 500 },
        { text: "Bob's Mainframe lokalisiert", delay: 700 },
        { text: 'Authentifizierung läuft', delay: 600 },
        { text: 'Zugang gewährt', delay: 400 }
      ],
      accessGranted: 'ACCESS GRANTED'
    },

    // Character Select
    characterSelect: {
      title: 'WÄHLE DEINE IDENTITÄT',
      subtitle: '// Wähle einen Avatar',
      nameLabel: 'NAME:',
      namePlaceholder: 'Dein Name...',
      confirmButton: '[ IDENTITY CONFIRMED ]',
      confirming: 'WIRD BESTÄTIGT...',
      takenLabel: 'TAKEN'
    },

    // Waiting Screen
    waiting: {
      lobbyLabel: 'LOBBY:',
      statusLabel: 'STATUS:',
      playersLabel: 'SPIELER:',
      connected: 'VERBUNDEN',
      disconnected: 'VERBINDUNG VERLOREN',
      messages: [
        "Warte auf Bob's Signal...",
        'Verbindung stabil...',
        'System bereit...',
        'Warte auf Spielstart...',
        'Bob analysiert die Teilnehmer...',
        'Initialisierung abgeschlossen...'
      ]
    }
  },

  // Toast Messages
  toasts: {
    lobbyCreated: 'Lobby {code} erstellt!',
    lobbyCodeCopied: 'Lobby-Code kopiert!',
    joinLinkCopied: 'Join-Link kopiert!',
    connectionEstablished: 'CONNECTION ESTABLISHED',
    voteTransmitted: 'VOTE TRANSMITTED',
    gameInitialized: 'GAME INITIALIZED',
    errors: {
      copyFailed: 'Kopieren fehlgeschlagen',
      gameLoading: 'Spiel wird noch geladen...',
      lobbyCreation: 'Fehler beim Erstellen der Lobby: {message}',
      gameStart: 'Fehler beim Starten: {message}',
      gameContinue: 'Fehler beim Fortsetzen: {message}',
      showAnswer: 'Fehler beim Anzeigen der Antwort: {message}',
      nextQuestion: 'Fehler bei nächster Frage: {message}',
      eventContinue: 'Fehler beim Event fortsetzen: {message}',
      connection: 'ERROR // {message}',
      transmission: 'TRANSMISSION FAILED // {message}',
      characterTaken: 'Character bereits vergeben'
    }
  },

  // Game Info
  game: {
    name: 'AI Takes Over - Multiplayer',
    questionCount: 15,
    disciplineCount: 5
  },

  // UI Elements
  ui: {
    skip: '[ SKIP ]',
    loading: 'Lädt...',
    countdown: {
      3: '3',
      2: '2',
      1: '1'
    }
  },

  // Bildertitel Discipline
  bildertitel: {
    name: 'BILDERTITEL',
    description: 'Kreativität trifft auf Humor',

    // Host Screen
    host: {
      writingTitle: 'TITEL SCHREIBEN',
      writingSubtitle: 'Die Spieler schreiben Titel für ihre Bilder...',
      submitted: 'haben abgeschickt',
      revealButton: 'TITEL ENTHÜLLEN',
      startVoting: 'ABSTIMMUNG STARTEN',
      nextImage: 'NÄCHSTES BILD',
      votingNow: 'Abstimmung läuft...',
      votes: 'Stimmen',
      roundComplete: 'RUNDE {round} ABGESCHLOSSEN',
      points: 'Punkte',
      nextRound: 'NÄCHSTE RUNDE',
      finishGame: 'ERGEBNISSE ZEIGEN'
    },

    // Player Screen
    player: {
      yourImage: 'Dein Bild',
      writeTitle: 'Schreibe einen lustigen Titel:',
      titlePlaceholder: 'Dein kreativer Titel...',
      submitButton: 'ABSENDEN',
      submitted: 'ABGESCHICKT!',
      watchHost: 'Schau auf den Hauptbildschirm!',
      revealingTitles: 'Die Titel werden enthüllt...',
      voteForBest: 'Wähle den besten Titel:',
      confirmVote: 'ABSTIMMEN',
      voteConfirmed: 'Stimme abgegeben!',
      cantVoteOwn: 'Das ist dein Bild!',
      waitForNext: 'Warte auf das nächste Bild...',
      roundComplete: 'Runde abgeschlossen!',
      yourScore: 'Deine Punkte:',
      points: 'Pkt',
      watchLeaderboard: 'Schau auf die Rangliste!',
      waiting: 'Warte auf Bob...'
    }
  },

  // 3-Wort-Chaos Discipline
  dreiWortChaos: {
    name: '3-WORT-CHAOS',
    description: 'Sag es in 3 Wörtern!',

    // Host Screen
    host: {
      round: 'Runde {current}/{total}',
      promptLabel: 'DIE AUFGABE',
      submitted: 'haben geantwortet',
      revealButton: 'ANTWORTEN ZEIGEN',
      startVoting: 'ABSTIMMUNG STARTEN',
      showResults: 'ERGEBNISSE ZEIGEN',
      votingNow: 'Abstimmung läuft...',
      votes: 'Stimmen',
      roundComplete: 'RUNDE {round} ABGESCHLOSSEN',
      bestAnswer: 'BESTE ANTWORT',
      points: 'Punkte',
      nextRound: 'NÄCHSTE RUNDE',
      finishGame: 'ERGEBNISSE ZEIGEN'
    },

    // Player Screen
    player: {
      promptLabel: 'DEINE AUFGABE',
      yourAnswer: 'Deine Antwort (genau 3 Wörter):',
      placeholder: 'Drei Wörter hier...',
      words: 'Wörter',
      needMore: 'Noch mehr Wörter!',
      tooMany: 'Zu viele Wörter!',
      submitButton: 'ABSENDEN',
      submitted: 'ABGESCHICKT!',
      watchHost: 'Schau auf den Hauptbildschirm!',
      revealingAnswers: 'Die Antworten werden enthüllt...',
      voteForBest: 'Wähle die beste Antwort:',
      confirmVote: 'ABSTIMMEN',
      voteConfirmed: 'Stimme abgegeben!',
      roundComplete: 'Runde abgeschlossen!',
      yourScore: 'Deine Punkte:',
      points: 'Pkt',
      watchLeaderboard: 'Schau auf die Rangliste!',
      waiting: 'Warte auf Bob...'
    }
  },

  // Conspiracy Corner Discipline
  conspiracyCorner: {
    name: 'CONSPIRACY CORNER',
    description: 'Erfinde die überzeugendste Verschwörungstheorie!',

    // Host Screen
    host: {
      round: 'Runde {current}/{total}',
      topicLabel: 'DAS THEMA',
      submitted: 'haben Theorien eingereicht',
      revealButton: 'THEORIEN ENTHÜLLEN',
      startVoting: 'ABSTIMMUNG STARTEN',
      showResults: 'ERGEBNISSE ZEIGEN',
      votingNow: 'Abstimmung läuft...',
      votes: 'Stimmen',
      roundComplete: 'RUNDE {round} ABGESCHLOSSEN',
      mostConvincing: 'ÜBERZEUGENDSTE THEORIE',
      points: 'Punkte',
      nextRound: 'NÄCHSTE RUNDE',
      finishGame: 'ERGEBNISSE ZEIGEN'
    },

    // Player Screen
    player: {
      topicLabel: 'DAS THEMA',
      yourTheory: 'Deine Verschwörungstheorie:',
      placeholder: 'Die Wahrheit ist... Schreibe deine Theorie hier...',
      needMore: 'Mindestens {min} Zeichen benötigt!',
      submitButton: 'THEORIE ABSENDEN',
      submitted: 'ABGESCHICKT!',
      watchHost: 'Schau auf den Hauptbildschirm!',
      revealingTheories: 'Die Theorien werden enthüllt...',
      voteForBest: 'Wähle die überzeugendste Theorie:',
      confirmVote: 'ABSTIMMEN',
      voteConfirmed: 'Stimme abgegeben!',
      roundComplete: 'Runde abgeschlossen!',
      yourScore: 'Deine Punkte:',
      points: 'Pkt',
      watchLeaderboard: 'Schau auf die Rangliste!',
      waiting: 'Warte auf Bob...'
    }
  },

  // Werbung für Müll Discipline
  werbungFuerMuell: {
    name: 'WERBUNG FÜR MÜLL',
    description: 'Verkaufe das Unverkäufliche!',

    // Host Screen
    host: {
      round: 'Runde {current}/{total}',
      productLabel: 'DAS PRODUKT',
      writingHint: 'Spieler schreiben ihre Werbepitches...',
      submitted: 'haben Pitches eingereicht',
      revealButton: 'PITCHES ENTHÜLLEN',
      startVoting: 'ABSTIMMUNG STARTEN',
      showResults: 'ERGEBNISSE ZEIGEN',
      votingNow: 'Abstimmung läuft...',
      votes: 'Stimmen',
      roundComplete: 'RUNDE {round} ABGESCHLOSSEN',
      bestPitch: 'BESTER WERBEPITCH',
      points: 'Punkte',
      nextRound: 'NÄCHSTES PRODUKT',
      finishGame: 'ERGEBNISSE ZEIGEN'
    },

    // Player Screen
    player: {
      productLabel: 'DEIN PRODUKT',
      yourPitch: 'Dein Werbepitch:',
      placeholder: 'Überzeuge die Welt von diesem Produkt...',
      needMore: 'Mindestens {min} Zeichen benötigt!',
      submitButton: 'PITCH ABSENDEN',
      submitted: 'ABGESCHICKT!',
      watchHost: 'Schau auf den Hauptbildschirm!',
      revealingPitches: 'Die Pitches werden enthüllt...',
      voteForBest: 'Wähle den besten Pitch:',
      confirmVote: 'ABSTIMMEN',
      voteConfirmed: 'Stimme abgegeben!',
      roundComplete: 'Runde abgeschlossen!',
      yourScore: 'Deine Punkte:',
      points: 'Pkt',
      watchLeaderboard: 'Schau auf die Rangliste!',
      waiting: 'Warte auf Bob...'
    }
  },

  // Autocomplete Chaos Discipline
  autocompleteChaos: {
    name: 'AUTOCOMPLETE CHAOS',
    description: 'Vervollständige den Satz!',

    // Host Screen
    host: {
      round: 'Runde {current}/{total}',
      promptLabel: 'DER SATZANFANG',
      writingHint: 'Spieler vervollständigen den Satz...',
      submitted: 'haben abgeschickt',
      revealButton: 'ANTWORTEN ENTHÜLLEN',
      startVoting: 'ABSTIMMUNG STARTEN',
      showResults: 'ERGEBNISSE ZEIGEN',
      votingNow: 'Abstimmung läuft...',
      votes: 'Stimmen',
      roundComplete: 'RUNDE {round} ABGESCHLOSSEN',
      bestCompletion: 'BESTE VERVOLLSTÄNDIGUNG',
      points: 'Punkte',
      nextRound: 'NÄCHSTER SATZ',
      finishGame: 'ERGEBNISSE ZEIGEN'
    },

    // Player Screen
    player: {
      promptLabel: 'VERVOLLSTÄNDIGE',
      yourCompletion: 'Deine Vervollständigung:',
      placeholder: 'Schreib etwas Lustiges...',
      submitting: 'WIRD GESENDET...',
      submitButton: 'ABSENDEN',
      submitted: 'ABGESCHICKT!',
      watchHost: 'Schau auf den Hauptbildschirm!',
      revealingCompletions: 'Die Antworten werden enthüllt...',
      voteForBest: 'Wähle die beste Antwort:',
      yourAnswer: 'DEINE',
      voting: 'WIRD ABGESTIMMT...',
      confirmVote: 'ABSTIMMEN',
      voteConfirmed: 'Stimme abgegeben!',
      roundComplete: 'Runde abgeschlossen!',
      yourScore: 'Deine Punkte:',
      points: 'Pkt',
      watchLeaderboard: 'Schau auf die Rangliste!',
      waiting: 'Warte auf Bob...'
    }
  },

  // Duell System
  duell: {
    name: 'DUELL',
    announcement: {
      line1: 'Zeit für ein DUELL!',
      line2: 'Wer wird gegeneinander antreten?',
      line3: 'Lasst uns die Kämpfer auswählen...'
    },
    playerSelection: {
      title: 'DUELLANTEN GESUCHT',
      selectingA: 'SPIELER A WIRD GEWÄHLT...',
      selectingB: 'SPIELER B WIRD GEWÄHLT...',
      ready: 'DUELL STEHT FEST!'
    },
    wheel: {
      title: 'WELCHES DUELL?',
      subtitle: 'Bob dreht das Rad...'
    },
    games: {
      schnellerFinger: {
        name: 'SCHNELLER FINGER',
        description: 'Wer tippt schneller?'
      },
      schaetzDuell: {
        name: 'SCHÄTZ-DUELL',
        description: 'Wer schätzt besser?'
      },
      higherLower: {
        name: 'HIGHER LOWER',
        description: 'Höher oder niedriger?'
      },
      bobsCaptcha: {
        name: "BOB'S CAPTCHA",
        description: 'Beweise dass du kein Bot bist!'
      },
      kiOderKind: {
        name: 'KI ODER KIND?',
        description: 'Wer hat das gemalt?'
      },
      turingTest: {
        name: "BOB'S TURING TEST",
        description: 'Mensch oder Maschine?'
      }
    },
    buttons: {
      start: 'DUELL STARTEN',
      continue: 'WEITER'
    },
    results: {
      winner: 'GEWINNER',
      points: 'Punkte'
    },
    spectator: {
      watching: 'Du schaust zu...',
      waitForResult: 'Warte auf das Ergebnis des Duells'
    }
  }
}
