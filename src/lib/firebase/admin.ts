import { getApps, initializeApp, cert, type App } from "firebase-admin/app"
import { getAuth, type Auth } from "firebase-admin/auth"
import { getFirestore, type Firestore } from "firebase-admin/firestore"

let _app: App | undefined
let _auth: Auth | undefined
let _db: Firestore | undefined

function getApp(): App {
  if (_app) return _app
  if (getApps().length > 0) {
    _app = getApps()[0]!
    return _app
  }

  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY

  if (projectId && clientEmail && privateKey) {
    _app = initializeApp({
      credential: cert({ projectId, clientEmail, privateKey: privateKey.replace(/\\n/g, "\n") }),
    })
  } else {
    // Emulator or build-time: no credential needed
    _app = initializeApp({ projectId: projectId ?? "demo-myexpectpay" })
  }

  return _app
}

export function getAdminAuth(): Auth {
  if (!_auth) _auth = getAuth(getApp())
  return _auth
}

export function getAdminDb(): Firestore {
  if (!_db) _db = getFirestore(getApp())
  return _db
}
