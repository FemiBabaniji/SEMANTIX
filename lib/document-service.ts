import { db } from "./firebase"
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore"
import { extractPlainText } from "./document-processor"
import type { SemanticAnalysis } from "./semantic-processing"

// Document type definition
export interface Document {
  id: string
  title: string
  content: string
  plainText?: string
  createdAt: any // Firestore timestamp
  updatedAt: any // Firestore timestamp
  userId?: string
  analysis?: SemanticAnalysis
}

// Collection reference
const DOCUMENTS_COLLECTION = "documents"

/**
 * Create a new document in Firestore
 */
export async function createDocument(title = "Untitled Document", userId?: string): Promise<Document> {
  const docRef = doc(collection(db, DOCUMENTS_COLLECTION))

  const newDocument: Document = {
    id: docRef.id,
    title,
    content: "",
    plainText: "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    userId,
  }

  await setDoc(docRef, newDocument)
  return { ...newDocument, id: docRef.id }
}

/**
 * Save document content to Firestore
 */
export async function saveDocument(
  documentId: string,
  content: string,
  title?: string,
  analysis?: SemanticAnalysis,
): Promise<void> {
  const docRef = doc(db, DOCUMENTS_COLLECTION, documentId)
  const plainText = extractPlainText(content)

  const updateData: Partial<Document> = {
    content,
    plainText,
    updatedAt: serverTimestamp(),
  }

  if (title) {
    updateData.title = title
  }

  if (analysis) {
    updateData.analysis = analysis
  }

  await updateDoc(docRef, updateData)
}

/**
 * Get a document from Firestore by ID
 */
export async function getDocument(documentId: string): Promise<Document | null> {
  const docRef = doc(db, DOCUMENTS_COLLECTION, documentId)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Document
  }

  return null
}

/**
 * Get all documents for a user
 */
export async function getUserDocuments(userId: string): Promise<Document[]> {
  const q = query(collection(db, DOCUMENTS_COLLECTION), where("userId", "==", userId), orderBy("updatedAt", "desc"))

  const querySnapshot = await getDocs(q)
  const documents: Document[] = []

  querySnapshot.forEach((doc) => {
    documents.push({ id: doc.id, ...doc.data() } as Document)
  })

  return documents
}

