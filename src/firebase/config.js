import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getDatabase } from 'firebase/database'

console.log('Firebase Environment Variables Check:')
console.log('VITE_API_KEY:', import.meta.env.VITE_API_KEY ? 'Present' : 'Missing')
console.log('VITE_AUTH_DOMAIN:', import.meta.env.VITE_AUTH_DOMAIN ? 'Present' : 'Missing')
console.log('VITE_PROJECT_ID:', import.meta.env.VITE_PROJECT_ID ? 'Present' : 'Missing')
console.log('VITE_DATABASE_URL:', import.meta.env.VITE_DATABASE_URL ? 'Present' : 'Missing')

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGESENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID,
  databaseURL: import.meta.env.VITE_DATABASE_URL
};

console.log('Firebase Config:', firebaseConfig)

let app, db, realtimeDb

try {
  app = initializeApp(firebaseConfig)
  console.log('Firebase App initialized successfully')
  
  db = getFirestore(app)
  console.log('Firestore initialized successfully')
  
  realtimeDb = getDatabase(app)
  console.log('Realtime Database initialized successfully')
  
} catch (error) {
  console.error('Firebase initialization error:', error)
  throw error
}

export { db, realtimeDb }
export default app