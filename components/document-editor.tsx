"use client"

import { useState, useRef, useEffect } from "react"
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { toast } from "@/hooks/use-toast"
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
  const editorRef = useRef<HTMLDivElement>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load document from Firebase
  useEffect(() => {
    const loadDocument = async () => {
      try {
        setIsLoading(true)
        const docRef = doc(db, "documents", documentId)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const data = docSnap.data()
          if (data.title) {
            onTitleChange(data.title)
          }
          if (data.content) {
            setContent(data.content)
            if (editorRef.current) {
              editorRef.current.innerHTML = data.content
            }
          }
        } else {
          // Create a new document if it doesn't exist
          await setDoc(docRef, {
            title: "Prototype for Research",
            content: "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
        }
      } catch (error) {
        console.error("Error loading document:", error)
        toast({
          title: "Error loading document",
          description: "Could not load the document from Firebase.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (documentId) {
      loadDocument()
    }
  }, [documentId, onTitleChange])

  // Save document content to Firebase
  const saveContent = async (newContent: string) => {
    if (!documentId) return

    try {
      const docRef = doc(db, "documents", documentId)
      await updateDoc(docRef, {
        content: newContent,
        updatedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error saving document:", error)
      toast({
        title: "Error saving document",
        description: "Could not save the document to Firebase.",
        variant: "destructive",
      })
    }
  }

  // Handle content changes with debounce
  const handleContentChange = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML
      setContent(newContent)

      // Clear previous timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }

      // Set new timeout for saving
      saveTimeoutRef.current = setTimeout(() => {
        saveContent(newContent)
      }, 1000)
    }
  }

  // Run document analysis
  const runAnalysis = async () => {
    if (!editorRef.current) return

    const content = editorRef.current.innerHTML
    const plainText = content
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentId,
          content: plainText,
          title: "Prototype for Research",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to analyze document")
      }

      const data = await response.json()
      onAnalysisComplete(data.analysis)
      onSetActiveLayer("metadata")
    } catch (error) {
      console.error("Error analyzing document:", error)
      toast({
        title: "Analysis failed",
        description: "There was an error analyzing your document. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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
          dangerouslySetInnerHTML={{
            __html:
              content ||
              `
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
            `,
          }}
        />
      </div>
    </div>
  )
}

