"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getUserDocuments } from "@/lib/document-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { FileText, Plus, Clock, Trash2 } from "lucide-react"
import type { Document } from "@/lib/document-service"

interface DocumentListProps {
  userId?: string
}

export function DocumentList({ userId }: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function loadDocuments() {
      try {
        setIsLoading(true)
        if (userId) {
          const docs = await getUserDocuments(userId)
          setDocuments(docs)
        } else {
          // For demo purposes, load all documents if no user ID
          const docs = await getUserDocuments("demo-user")
          setDocuments(docs)
        }
      } catch (error) {
        console.error("Error loading documents:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDocuments()
  }, [userId])

  const createNewDocument = () => {
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Documents</h1>
          <Button onClick={createNewDocument}>
            <Plus className="mr-2 h-4 w-4" /> New Document
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-8 w-20" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Documents</h1>
        <Button onClick={createNewDocument}>
          <Plus className="mr-2 h-4 w-4" /> New Document
        </Button>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No documents yet</h2>
          <p className="text-gray-500 mb-6">Create your first document to get started</p>
          <Button onClick={createNewDocument}>
            <Plus className="mr-2 h-4 w-4" /> Create Document
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <Card key={doc.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <Link href={`/?id=${doc.id}`} className="block h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{doc.title || "Untitled Document"}</CardTitle>
                  <CardDescription className="flex items-center">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    {doc.updatedAt ? new Date(doc.updatedAt.seconds * 1000).toLocaleString() : "Recently updated"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-24 overflow-hidden text-sm text-gray-600">
                    {doc.plainText ? (
                      doc.plainText.substring(0, 150) + (doc.plainText.length > 150 ? "..." : "")
                    ) : (
                      <span className="italic text-gray-400">No content</span>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="text-xs text-gray-500">
                    {doc.analysis?.topics && doc.analysis.topics.length > 0
                      ? `${doc.analysis.topics.length} topics identified`
                      : "No analysis yet"}
                  </div>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

