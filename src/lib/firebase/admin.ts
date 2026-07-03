import { getApps, initializeApp, cert, type App } from "firebase-admin/app"
import { getAuth, type Auth } from "firebase-admin/auth"
import { getFirestore, type Firestore } from "firebase-admin/firestore"

// Store on globalThis so HMR reloads reuse the same instance instead of
// opening a new gRPC connection on every file save.
type AdminGlobal = {
  _firebaseApp?: App
  _firebaseAuth?: Auth
  _firebaseDb?: Firestore
}
const g = global as typeof global & AdminGlobal

function getApp(): App {
  if (g._firebaseApp) return g._firebaseApp
  if (getApps().length > 0) {
    g._firebaseApp = getApps()[0]!
    return g._firebaseApp
  }

  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY

  if (projectId && clientEmail && privateKey) {
    // Local dev: explicit service account credentials from .env.local
    g._firebaseApp = initializeApp({
      credential: cert({ projectId, clientEmail, privateKey: privateKey.replace(/\\n/g, "\n") }),
    })
  } else {
    // Firebase App Hosting / Cloud Run: ADC is injected automatically.
    // Try all known project-ID env vars before falling back to the demo project.
    const resolvedProjectId =
      projectId ??
      process.env.GCLOUD_PROJECT ??
      process.env.GOOGLE_CLOUD_PROJECT ??
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ??
      "demo-myexpectpay"
    g._firebaseApp = initializeApp({ projectId: resolvedProjectId })
  }

  return g._firebaseApp
}

export function getAdminAuth(): Auth {
  if (!g._firebaseAuth) g._firebaseAuth = getAuth(getApp())
  return g._firebaseAuth
}

export function getAdminDb(): Firestore {
  if (!g._firebaseDb) g._firebaseDb = getFirestore(getApp())
  return g._firebaseDb
}
