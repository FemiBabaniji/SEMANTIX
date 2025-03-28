"use client"

import { useState, useEffect, useCallback } from "react"
import { useToast } from "./use-toast"
import { saveDocument, createDocument } from "@/lib/document-service"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Document } from "@/lib/document-service"
import type { SemanticAnalysis } from "@/lib/semantic-processing"

// Debounce function to limit save operations
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function useDocument(documentId?: string) {
  const [document, setDocument] = useState<Document | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const { toast } = useToast()

  // Load document on mount or when documentId changes
  useEffect(() => {
    if (!documentId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    // Set up real-time listener for document changes
    const unsubscribe = onSnapshot(
      doc(db, "documents", documentId),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          setDocument({ id: docSnapshot.id, ...docSnapshot.data() } as Document)
        } else {
          setError(new Error("Document not found"))
        }
        setIsLoading(false)
      },
      (err) => {
        console.error("Error loading document:", err)
        setError(err as Error)
        setIsLoading(false)
        toast({
          title: "Error loading document",
          description: err.message,
          variant: "destructive",
        })
      },
    )

    // Clean up listener on unmount
    return () => unsubscribe()
  }, [documentId, toast])

  // Create a new document
  const createNewDocument = useCallback(
    async (title?: string, userId?: string) => {
      try {
        setIsLoading(true)
        const newDoc = await createDocument(title, userId)
        setDocument(newDoc)
        toast({
          title: "Document created",
          description: "New document created successfully",
        })
        return newDoc
      } catch (err) {
        console.error("Error creating document:", err)
        const error = err as Error
        setError(error)
        toast({
          title: "Error creating document",
          description: error.message,
          variant: "destructive",
        })
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [toast],
  )

  // Save document content with debounce
  const saveDocumentContent = useCallback(
    debounce(async (content: string, title?: string, analysis?: SemanticAnalysis) => {
      if (!documentId) return

      try {
        setIsSaving(true)
        await saveDocument(documentId, content, title, analysis)
        setIsSaving(false)
      } catch (err) {
        console.error("Error saving document:", err)
        const error = err as Error
        setError(error)
        setIsSaving(false)
        toast({
          title: "Error saving document",
          description: error.message,
          variant: "destructive",
        })
      }
    }, 1000),
    [documentId, toast],
  )

  return {
    document,
    isLoading,
    error,
    isSaving,
    createNewDocument,
    saveDocumentContent,
  }
}

