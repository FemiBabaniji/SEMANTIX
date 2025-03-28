"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { toast } from "@/hooks/use-toast"
import { getDocument, saveDocument, createDocumentWithId } from "@/lib/supabase/utils"
import type { SemanticAnalysis } from "@/lib/semantic-processing"

interface DocumentEditorProps {
  documentId: string
  onTitleChange: (title: string) => void
  onAnalysisComplete: (analysis: SemanticAnalysis) => void
  onSetActiveLayer: (layer: "metadata" | "logic" | "action") => void
}

export function DocumentEditor({
  documentId,
  onTitleChange,
  onAnalysisComplete,
  onSetActiveLayer,
}: DocumentEditorProps) {
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const documentLoadedRef = useRef(false)
  const isTypingRef = useRef(false)
  const pendingContentRef = useRef<string | null>(null)

  // Function to safely set editor content
  const setEditorContent = useCallback((htmlContent: string) => {
    if (editorRef.current) {
      console.log("Setting editor content directly")
      editorRef.current.innerHTML = htmlContent
    } else {
      console.log("Editor ref not available, storing content for later")
      pendingContentRef.current = htmlContent
    }
  }, [])

  // Memoize the saveContent function to prevent recreating it on every render
  const saveContent = useCallback(
    async (newContent: string) => {
      if (!documentId || documentId === "default-doc-id") return

      try {
        setIsSaving(true)

        console.log(`Saving content for document: ${documentId}`)
        const success = await saveDocument(documentId, newContent)

        if (!success) {
          throw new Error("Failed to save document")
        } else {
          console.log("Document saved successfully:", documentId)
        }
      } catch (error) {
        console.error("Error saving document:", error)
        toast({
          title: "Error saving document",
          description: "Could not save the document to the database.",
          variant: "destructive",
        })
      } finally {
        setIsSaving(false)
      }
    },
    [documentId],
  )

  // Handle content changes with debounce
  const handleContentChange = useCallback(() => {
    if (!editorRef.current) return

    // Mark that we're handling user input
    isTypingRef.current = true

    const newContent = editorRef.current.innerHTML
    setContent(newContent)

    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Set new timeout for saving
    saveTimeoutRef.current = setTimeout(() => {
      saveContent(newContent)
      // Reset typing flag after save
      isTypingRef.current = false
    }, 1000)
  }, [saveContent])

  // Reset document loaded ref when document ID changes
  useEffect(() => {
    documentLoadedRef.current = false
    setIsLoading(true)
  }, [documentId])

  // Check if editor ref is available and set pending content if needed
  useEffect(() => {
    if (editorRef.current && pendingContentRef.current) {
      console.log("Editor ref now available, setting pending content")
      editorRef.current.innerHTML = pendingContentRef.current
      pendingContentRef.current = null
    }
  })

  // Load document from Supabase
  useEffect(() => {
    // Prevent multiple loads for the same document ID
    if (documentLoadedRef.current) return

    const loadDocument = async () => {
      try {
        setIsLoading(true)
        setLoadError(null)

        console.log(`Loading document with ID: ${documentId}`)

        // Skip loading for default-doc-id as it doesn't exist yet
        if (documentId === "default-doc-id") {
          console.log("Using default document ID, setting default content")
          const defaultContent = getDefaultContent()
          setContent(defaultContent)
          setEditorContent(defaultContent)
          setIsLoading(false)
          documentLoadedRef.current = true
          return
        }

        // Try to get the document
        const document = await getDocument(documentId)
        console.log("Document loaded from database:", document)

        if (document) {
          console.log("Document loaded successfully:", document)

          if (document.title) {
            onTitleChange(document.title)
          }

          if (document.content) {
            console.log("Setting document content:", document.content.substring(0, 100) + "...")
            setContent(document.content)
            setEditorContent(document.content)
          } else {
            // If document exists but has no content, set default content
            console.log("Document exists but has no content, setting default")
            const defaultContent = getDefaultContent()
            setContent(defaultContent)
            setEditorContent(defaultContent)

            // Save the default content to ensure it's persisted
            await saveDocument(documentId, defaultContent, document.title)
          }

          if (document.analysis) {
            onAnalysisComplete(document.analysis)
          }
        } else {
          console.log(`Document ${documentId} not found, creating it`)

          // If document doesn't exist, create it with default content
          const defaultContent = getDefaultContent()
          setContent(defaultContent)
          setEditorContent(defaultContent)

          // Create the document with the specific ID, passing null for userId
          const newDoc = await createDocumentWithId(documentId, "Prototype for Research", null)

          if (newDoc) {
            console.log("Document created successfully:", newDoc)

            // Save the default content
            await saveDocument(documentId, defaultContent, "Prototype for Research")
          } else {
            throw new Error("Failed to create document with ID: " + documentId)
          }
        }
      } catch (error) {
        console.error("Error loading document:", error)
        setLoadError("Could not load the document. Please try again.")

        // Set default content even if there's an error
        const defaultContent = getDefaultContent()
        setContent(defaultContent)
        setEditorContent(defaultContent)

        toast({
          title: "Error loading document",
          description: "Could not load the document from the database.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
        documentLoadedRef.current = true
      }
    }

    loadDocument()
  }, [documentId, onTitleChange, onAnalysisComplete, saveContent, setEditorContent])

  // Set content in editor when content state changes and we're not typing
  useEffect(() => {
    if (content && !isTypingRef.current && !isLoading) {
      console.log("Content state changed, updating editor if needed")
      // Only update if the content differs from what's in the editor
      if (editorRef.current && editorRef.current.innerHTML !== content) {
        console.log("Setting editor content from state")
        editorRef.current.innerHTML = content
      }
    }
  }, [content, isLoading])

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  // Default content for new documents
  const getDefaultContent = () => {
    return `
      <h1>Welcome to Semantix: A New Google Feature</h1>
      <p>
        This prototype demonstrates how Semantix enhances your document experience with AI-powered analysis and
        organization.
      </p>
      <p>Key features include:</p>
      <ul>
        <li>Automatic document tagging and organization</li>
        <li>AI personalities that analyze your content from different perspectives</li>
        <li>Integration with third-party tools and automation capabilities</li>
        <li>Hierarchical document structure visualization</li>
      </ul>
      <p>Try exploring the sidebar on the right to see these features in action!</p>

      <h2 id="feature-suggestions">Feature Suggestions</h2>
      <p>
        <strong>We value your feedback!</strong> Please document any additional features you believe would
        enhance your experience with Semantix below:
      </p>
      <ol>
        <li>What additional capabilities would make Semantix more valuable to you?</li>
        <li>How would these features improve your workflow?</li>
        <li>Are there specific integrations you'd like to see with other tools?</li>
      </ol>

      <h3>How would these features improve your workflow?</h3>
      <p>Please explain how your suggested features would help you work more efficiently or effectively.</p>
    `
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center p-6 max-w-md">
          <div className="text-red-500 text-xl mb-4">Error Loading Document</div>
          <p className="mb-4">{loadError}</p>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto bg-white">
      <div className="max-w-[850px] mx-auto py-12 px-8">
        <div
          ref={editorRef}
          className="min-h-[calc(100vh-200px)] outline-none prose prose-sm sm:prose lg:prose-lg font-sans"
          contentEditable
          onInput={handleContentChange}
          suppressContentEditableWarning
        />
      </div>
      {isSaving && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-3 py-1 rounded-md text-sm opacity-70">
          Saving...
        </div>
      )}
    </div>
  )
}

