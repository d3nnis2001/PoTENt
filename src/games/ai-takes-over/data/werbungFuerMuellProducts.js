/**
 * Werbung für Müll - Useless Products Data
 * Players create ad pitches for ridiculous/useless products
 */

// Product categories
export const productCategories = {
  HOUSEHOLD: 'household',     // Haushalt
  TECH: 'tech',               // Technik
  FASHION: 'fashion',         // Mode
  FOOD: 'food',               // Essen
  WELLNESS: 'wellness',       // Wellness
  OFFICE: 'office'            // Büro
}

// All useless products
export const allProducts = [
  // HOUSEHOLD - Haushalt
  {
    id: 'hh-1',
    category: 'household',
    name: 'Der Unsichtbare Staubsauger',
    description: 'Saugt nicht, macht keinen Lärm, verbraucht keinen Strom. Aber er ist unsichtbar!'
  },
  {
    id: 'hh-2',
    category: 'household',
    name: 'Einweg-Teller aus Schokolade',
    description: 'Nachhaltig UND lecker - schmilzt allerdings bei warmen Gerichten.'
  },
  {
    id: 'hh-3',
    category: 'household',
    name: 'Der Socken-Einzelhalter',
    description: 'Hält genau EINE Socke sicher auf. Für die, die den Partner verloren haben.'
  },
  {
    id: 'hh-4',
    category: 'household',
    name: 'Wasserfester Sand',
    description: 'Perfekt für den Strand im Wohnzimmer. Wird nie nass!'
  },
  {
    id: 'hh-5',
    category: 'household',
    name: 'Die Anti-Staub-Staubschicht',
    description: 'Eine spezielle Staubschicht, die verhindert, dass sich neuer Staub absetzt.'
  },
  {
    id: 'hh-6',
    category: 'household',
    name: 'Kühlschrank-Licht-Ausschalter',
    description: 'Endlich wissen, ob das Licht wirklich ausgeht, wenn die Tür zu ist.'
  },
  {
    id: 'hh-7',
    category: 'household',
    name: 'Der Regenschirm für Regenschirme',
    description: 'Schützt deinen Regenschirm vor Regen. Meta-trocken bleiben!'
  },
  {
    id: 'hh-8',
    category: 'household',
    name: 'Batteriebetriebene Batterien',
    description: 'Für Geräte, die noch mehr Batterien brauchen.'
  },

  // TECH - Technik
  {
    id: 'tech-1',
    category: 'tech',
    name: 'USB-Stick für analoge Daten',
    description: 'Speichert handgeschriebene Notizen digital. Einfach Zettel reinstecken!'
  },
  {
    id: 'tech-2',
    category: 'tech',
    name: 'Bluetooth-Kabel',
    description: 'Verbindet deine kabellosen Geräte - mit Kabel. Für mehr Sicherheit.'
  },
  {
    id: 'tech-3',
    category: 'tech',
    name: 'Solar-Taschenlampe',
    description: 'Lädt sich auf, wenn du Licht brauchst. Praktisch, oder?'
  },
  {
    id: 'tech-4',
    category: 'tech',
    name: 'WLAN-Kabel-Konverter',
    description: 'Wandelt WLAN in Kabel um und wieder zurück. Für bessere Verbindung.'
  },
  {
    id: 'tech-5',
    category: 'tech',
    name: 'Screenshot-Drucker',
    description: 'Druckt automatisch jeden Screenshot aus. Für wichtige Dokumente.'
  },
  {
    id: 'tech-6',
    category: 'tech',
    name: 'Handy-Ladegerät ohne Stecker',
    description: 'Lädt über gute Gedanken und Hoffnung. Nachhaltig!'
  },
  {
    id: 'tech-7',
    category: 'tech',
    name: 'Selfie-Stick für Selfie-Sticks',
    description: 'Wenn dein Selfie-Stick nicht lang genug ist.'
  },
  {
    id: 'tech-8',
    category: 'tech',
    name: 'Kopfhörer mit eingebautem Lautsprecher',
    description: 'Für alle, die ihre Musik teilen wollen. Ob sie wollen oder nicht.'
  },

  // FASHION - Mode
  {
    id: 'fash-1',
    category: 'fashion',
    name: 'Wasserfeste Badehose für die Dusche',
    description: 'Weil man nie weiß, ob man nass werden möchte.'
  },
  {
    id: 'fash-2',
    category: 'fashion',
    name: 'Socken mit Sandalen-Print',
    description: 'Der Look ohne das Commitment. Deutsche Innovation!'
  },
  {
    id: 'fash-3',
    category: 'fashion',
    name: 'Unsichtbare Krawatte',
    description: 'Für formelle Anlässe im Homeoffice.'
  },
  {
    id: 'fash-4',
    category: 'fashion',
    name: 'Handschuhe für Handschuhe',
    description: 'Damit deine Handschuhe auch warm bleiben.'
  },
  {
    id: 'fash-5',
    category: 'fashion',
    name: 'Deo mit Knoblauch-Duft',
    description: 'Hält Vampire UND Menschen fern. Social Distancing Deluxe.'
  },
  {
    id: 'fash-6',
    category: 'fashion',
    name: 'Brillen mit Scheibenwischer',
    description: 'Für Regentage. Manuell betrieben.'
  },
  {
    id: 'fash-7',
    category: 'fashion',
    name: 'T-Shirt mit aufgedrucktem T-Shirt',
    description: 'Für den Layering-Look ohne Hitze.'
  },
  {
    id: 'fash-8',
    category: 'fashion',
    name: 'Schuhe mit eingebauter Waage',
    description: 'Wiegt dich bei jedem Schritt. Für Fitness-Enthusiasten.'
  },

  // FOOD - Essen
  {
    id: 'food-1',
    category: 'food',
    name: 'Zuckerfreier Zucker',
    description: 'Süßt nicht, aber du kannst behaupten, du nimmst Zucker.'
  },
  {
    id: 'food-2',
    category: 'food',
    name: 'Instant-Wasser',
    description: 'Einfach Wasser hinzufügen für frisches Wasser!'
  },
  {
    id: 'food-3',
    category: 'food',
    name: 'Koffeinfreier Energy Drink',
    description: 'Für den Placebo-Effekt am Morgen.'
  },
  {
    id: 'food-4',
    category: 'food',
    name: 'Veganes Wasser',
    description: 'Garantiert 100% pflanzlich. Ohne tierische Zutaten.'
  },
  {
    id: 'food-5',
    category: 'food',
    name: 'Diät-Luft',
    description: 'Nur 0 Kalorien pro Portion. Unbegrenzt genießbar.'
  },
  {
    id: 'food-6',
    category: 'food',
    name: 'Glutenfreie Steine',
    description: 'Der perfekte Snack für Allergiker. Nicht zum Verzehr geeignet.'
  },
  {
    id: 'food-7',
    category: 'food',
    name: 'Bio-Plastiktüte',
    description: 'Für umweltbewusste Müll-Entsorgung.'
  },
  {
    id: 'food-8',
    category: 'food',
    name: 'Suppe am Stiel',
    description: 'Wie ein Eis, nur flüssig und warm. Sehr unpraktisch.'
  },

  // WELLNESS - Wellness
  {
    id: 'well-1',
    category: 'wellness',
    name: 'Stress-Ball für Stress-Bälle',
    description: 'Wenn dein Stress-Ball gestresst ist.'
  },
  {
    id: 'well-2',
    category: 'wellness',
    name: 'Yoga-Matte für Minimalisten',
    description: 'Eine Matte in der Größe einer Briefmarke. Für fokussiertes Training.'
  },
  {
    id: 'well-3',
    category: 'wellness',
    name: 'Schlaftabletten mit Koffein',
    description: 'Für produktive Träume.'
  },
  {
    id: 'well-4',
    category: 'wellness',
    name: 'Meditations-Wecker',
    description: 'Klingelt alle 5 Minuten, um dich an die Stille zu erinnern.'
  },
  {
    id: 'well-5',
    category: 'wellness',
    name: 'Laufband für Faule',
    description: 'Läuft von selbst, während du sitzt. Fitness durch Beobachtung.'
  },
  {
    id: 'well-6',
    category: 'wellness',
    name: 'Anti-Falten-Creme ab 5 Jahren',
    description: 'Es ist nie zu früh für Prävention!'
  },
  {
    id: 'well-7',
    category: 'wellness',
    name: 'Aroma-Therapie: Büro-Duft',
    description: 'Der Geruch von Druckertinte und altem Kaffee. Für Nostalgiker.'
  },
  {
    id: 'well-8',
    category: 'wellness',
    name: 'Fitness-Tracker ohne Display',
    description: 'Trackt alles. Zeigt nichts an. Für Minimalisten.'
  },

  // OFFICE - Büro
  {
    id: 'off-1',
    category: 'office',
    name: 'Meeting-Teilnahme-Dummy',
    description: 'Ein aufblasbarer Kollege, der für dich nickt.'
  },
  {
    id: 'off-2',
    category: 'office',
    name: 'Kabelloser Locher',
    description: 'Locht Papier durch pure Willenskraft. Batterien inklusive.'
  },
  {
    id: 'off-3',
    category: 'office',
    name: 'Post-its die nicht kleben',
    description: 'Für temporäre Notizen. Sehr temporär.'
  },
  {
    id: 'off-4',
    category: 'office',
    name: 'Unsichtbare Tinte für wichtige Verträge',
    description: 'Perfekt für Dinge, die man später bereuen könnte.'
  },
  {
    id: 'off-5',
    category: 'office',
    name: 'E-Mail-Drucker-Fax-Konverter',
    description: 'Druckt E-Mails, faxt sie, scannt sie wieder ein.'
  },
  {
    id: 'off-6',
    category: 'office',
    name: 'Bürostuhl ohne Räder',
    description: 'Für fokussiertes Arbeiten. Keine Ablenkung durch Bewegung.'
  },
  {
    id: 'off-7',
    category: 'office',
    name: 'Kaffeemaschine ohne Kaffee',
    description: 'Macht das Geräusch. Für den Placebo-Effekt.'
  },
  {
    id: 'off-8',
    category: 'office',
    name: 'Papierkorb mit Cloud-Backup',
    description: 'Dein Müll, sicher gespeichert für die Ewigkeit.'
  }
]

/**
 * Get random products for a game
 * @param {number} count - Number of products needed
 * @returns {Array} Array of product objects
 */
export const getRandomProducts = (count = 4) => {
  const shuffled = [...allProducts].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

/**
 * Get products by category
 * @param {string} category - Category name
 * @returns {Array} Array of products in that category
 */
export const getProductsByCategory = (category) => {
  return allProducts.filter(p => p.category === category)
}

/**
 * Get a balanced selection of products (one from each category if possible)
 * @param {number} count - Number of products needed
 * @returns {Array} Array of product objects
 */
export const getBalancedProducts = (count = 4) => {
  const categories = Object.values(productCategories)
  const selected = []

  const shuffledCategories = [...categories].sort(() => Math.random() - 0.5)
  for (const category of shuffledCategories) {
    if (selected.length >= count) break
    const categoryProducts = getProductsByCategory(category)
    const randomProduct = categoryProducts[Math.floor(Math.random() * categoryProducts.length)]
    if (randomProduct && !selected.find(p => p.id === randomProduct.id)) {
      selected.push(randomProduct)
    }
  }

  while (selected.length < count) {
    const remainingProducts = allProducts.filter(p => !selected.find(s => s.id === p.id))
    if (remainingProducts.length === 0) break
    const randomProduct = remainingProducts[Math.floor(Math.random() * remainingProducts.length)]
    selected.push(randomProduct)
  }

  return selected
}

export default {
  productCategories,
  allProducts,
  getRandomProducts,
  getProductsByCategory,
  getBalancedProducts
}
