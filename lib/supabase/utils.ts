// Fix the import to correctly import testSupabaseConnection
import { supabase } from "../supabase"

export const saveDocument = async (
  documentId: string,
  content: string,
  title?: string,
  analysis?: any,
): Promise<boolean> => {
  try {
    if (!documentId) {
      console.error("No document ID provided to saveDocument")
      return false
    }

    console.log(`Attempting to save document with ID: ${documentId}`)

    const updates: any = {
      updated_at: new Date().toISOString(),
    }

    if (content) updates.content = content
    if (title) updates.title = title
    if (analysis) updates.analysis = analysis

    // Check if the document exists first
    const { data: existingDoc, error: checkError } = await supabase
      .from("documents")
      .select("id")
      .eq("id", documentId)
      .single()

    if (checkError) {
      console.log("Check error:", checkError)

      // If the document doesn't exist, create it
      if (checkError.code === "PGRST116") {
        // "No rows found" error code
        console.log(`Document ${documentId} not found, creating it now`)

        const { data, error: insertError } = await supabase
          .from("documents")
          .insert([
            {
              id: documentId,
              title: title || "Untitled Document",
              content: content || "",
              user_id: null, // Changed from "anonymous" to null
              anonymous_access: true, // Added anonymous_access flag
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select()

        if (insertError) {
          console.error("Supabase error inserting document:", insertError)
          throw insertError
        }

        console.log("Document created successfully:", data)
        return true
      } else {
        console.error("Supabase error checking document:", checkError)
        throw checkError
      }
    }

    // If the document exists, update it
    console.log(`Document ${documentId} exists, updating it now`)
    const { data, error: updateError } = await supabase.from("documents").update(updates).eq("id", documentId).select()

    if (updateError) {
      console.error("Supabase error updating document:", updateError)
      throw updateError
    }

    console.log("Document updated successfully:", data)
    return true
  } catch (error) {
    console.error("Error in utils.saveDocument:", error)
    if (error instanceof Error) {
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }
    return false
  }
}

export const getDocument = async (documentId: string) => {
  try {
    if (!documentId) {
      console.error("No document ID provided to getDocument")
      return null
    }

    console.log("Fetching document with ID:", documentId)

    // Simplified connection check to avoid potential circular dependencies
    try {
      console.log("Checking Supabase connection...")
      const { error } = await supabase.from("documents").select("count", { count: "exact" }).limit(1)

      if (error) {
        console.error("Supabase connection check failed:", error)
        throw new Error("Database connection failed")
      }

      console.log("Supabase connection successful, querying document...")
    } catch (connectionError) {
      console.error("Connection test failed:", connectionError)
      throw new Error("Database connection failed")
    }

    try {
      const { data, error } = await supabase.from("documents").select("*").eq("id", documentId).single()

      if (error) {
        console.error("Supabase query error:", error)

        // If document not found, return null instead of throwing
        if (error.code === "PGRST116") {
          console.log(`Document ${documentId} not found`)
          return null
        }

        throw error
      }

      console.log("Document fetched successfully:", data ? "Found" : "Not found")
      return data
    } catch (queryError) {
      console.error("Exception during Supabase query:", queryError)
      if (queryError instanceof Error) {
        console.error("Error message:", queryError.message)
        console.error("Error stack:", queryError.stack)
      }
      throw queryError
    }
  } catch (error) {
    // More detailed error logging
    console.error("Error in utils.getDocument:", error)
    if (error instanceof Error) {
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    } else {
      console.error("Unknown error type:", typeof error)
    }
    return null
  }
}

// Update the Document interface to match the schema
export interface Document {
  id: string
  title: string
  content: string
  user_id: string | null
  anonymous_access: boolean
  created_at?: string
  updated_at?: string
  analysis?: any
}

export const getUserDocuments = async (userId: string | null = null): Promise<Document[]> => {
  try {
    console.log(`Fetching documents for user: ${userId || "anonymous"}`)

    // Query documents with anonymous_access = true if userId is null
    const query = userId
      ? supabase.from("documents").select("*").eq("user_id", userId)
      : supabase.from("documents").select("*").eq("anonymous_access", true)

    const { data, error } = await query.order("updated_at", { ascending: false })

    if (error) {
      console.error("Supabase error fetching documents:", error)
      throw error
    }

    console.log(`Found ${data?.length || 0} documents`)
    return data || []
  } catch (error) {
    console.error("Error in getUserDocuments:", error)
    if (error instanceof Error) {
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }
    return []
  }
}

// Update the createDocument function to handle the UUID and anonymous_access fields correctly
export const createDocument = async (title: string, userId: string | null = null): Promise<Document | null> => {
  try {
    console.log(`Creating new document with title "${title}"`)

    // Simplified connection check
    try {
      const { error } = await supabase.from("documents").select("count", { count: "exact" }).limit(1)
      if (error) throw error
    } catch (connectionError) {
      console.error("Database connection check failed:", connectionError)
      throw new Error("Database connection failed")
    }

    const newDocument = {
      title: title || "Untitled Document",
      content: "",
      user_id: userId, // This will be null for anonymous users
      anonymous_access: true, // Set anonymous_access to true
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("documents").insert([newDocument]).select()

    if (error) {
      console.error("Supabase error creating document:", error)
      throw error
    }

    if (!data || data.length === 0) {
      console.error("No data returned after creating document")
      return null
    }

    console.log("Document created successfully:", data[0])
    return data[0] || null
  } catch (error) {
    console.error("Error in createDocument:", error)
    if (error instanceof Error) {
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }
    return null
  }
}

// Update createDocumentWithId to match the schema
export const createDocumentWithId = async (
  documentId: string,
  title: string,
  userId: string | null = null,
): Promise<Document | null> => {
  try {
    if (!documentId) {
      console.error("Missing document ID in createDocumentWithId")
      return null
    }

    console.log(`Creating document with specific ID: ${documentId}`)

    const newDocument = {
      id: documentId,
      title: title || "Untitled Document",
      content: "",
      user_id: userId, // This will be null for anonymous users
      anonymous_access: true, // Set anonymous_access to true
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("documents").insert([newDocument]).select()

    if (error) {
      console.error("Supabase error creating document with ID:", error)
      throw error
    }

    console.log("Document created successfully with ID:", documentId)
    return data?.[0] || null
  } catch (error) {
    console.error("Error in createDocumentWithId:", error)
    if (error instanceof Error) {
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }
    return null
  }
}

// Update getOrCreateDocument to match the schema
export const getOrCreateDocument = async (
  documentId: string,
  title = "Untitled Document",
  userId: string | null = null,
) => {
  try {
    // Try to get the document first
    const document = await getDocument(documentId)

    if (document) {
      return document
    }

    // If document doesn't exist, create it
    console.log("Document not found, creating a new one with ID:", documentId)

    const newDocument = {
      id: documentId,
      title: title,
      content: "",
      user_id: userId, // This will be null for anonymous users
      anonymous_access: true, // Set anonymous_access to true
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("documents").insert([newDocument]).select()

    if (error) {
      console.error("Error creating document:", error)
      throw error
    }

    return data?.[0] || null
  } catch (error) {
    console.error("Error in getOrCreateDocument:", error)
    return null
  }
}

