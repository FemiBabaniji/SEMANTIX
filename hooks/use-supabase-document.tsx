"use client"

import { useState, useEffect, useCallback } from "react"
import { useToast } from "./use-toast"
import { getDocument, saveDocument, createDocument } from "@/lib/supabase"
import type { Document } from "@/lib/supabase"

// Debounce function to limit save operations
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function useSupabaseDocument(documentId?: string) {
  const [document, setDocument] = useState<Document | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const { toast } = useToast()

  // Load document on mount or when documentId changes
  useEffect(() => {
    if (!documentId || documentId === "default-doc-id") {
      setIsLoading(false)
      return
    }

    async function loadDocument() {
      try {
        setIsLoading(true)
        const doc = await getDocument(documentId)
        if (doc) {
          setDocument(doc)
        } else {
          setError(new Error("Document not found"))
        }
      } catch (err) {
        console.error("Error loading document:", err)
        setError(err instanceof Error ? err : new Error(String(err)))
        toast({
          title: "Error loading document",
          description: "Could not load the document from the database.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadDocument()
  }, [documentId, toast])

  // Create a new document
  const createNewDocument = useCallback(
    async (title?: string, userId?: string) => {
      try {
        setIsLoading(true)
        const newDoc = await createDocument(title, userId)
        if (newDoc) {
          setDocument(newDoc)
          toast({
            title: "Document created",
            description: "New document created successfully",
          })
        }
        return newDoc
      } catch (err) {
        console.error("Error creating document:", err)
        const error = err instanceof Error ? err : new Error(String(err))
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
    debounce(async (content: string, title?: string, analysis?: any) => {
      if (!documentId || documentId === "default-doc-id") return

      try {
        setIsSaving(true)
        const success = await saveDocument(documentId, content, title, analysis)
        if (!success) {
          throw new Error("Failed to save document")
        }
      } catch (err) {
        console.error("Error saving document:", err)
        const error = err instanceof Error ? err : new Error(String(err))
        setError(error)
        toast({
          title: "Error saving document",
          description: error.message,
          variant: "destructive",
        })
      } finally {
        setIsSaving(false)
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

