"use client"
import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"

// Dynamically import the main content component with no SSR
const GoogleDocsContent = dynamic(() => import("@/components/google-docs-content"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col h-screen items-center justify-center">
      <Skeleton className="h-12 w-64 mb-4" />
      <Skeleton className="h-64 w-3/4 mb-8" />
      <div className="flex gap-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  ),
})

export default function Home() {
  return <GoogleDocsContent />
}

