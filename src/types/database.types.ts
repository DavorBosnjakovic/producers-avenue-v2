// File: database.types.ts
// Path: /src/types/database.types.ts
// TypeScript types for Supabase database
// This file will be auto-generated from Supabase schema using:
// supabase gen types typescript --local > src/types/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Placeholder types - will be replaced with actual generated types
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          user_id: string
          username: string
          display_name: string | null
          bio: string | null
          avatar_url: string | null
          banner_url: string | null
          smart_link: string | null
          location_city: string | null
          location_country: string | null
          experience_level: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          username: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          banner_url?: string | null
          smart_link?: string | null
          location_city?: string | null
          location_country?: string | null
          experience_level?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          username?: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          banner_url?: string | null
          smart_link?: string | null
          location_city?: string | null
          location_country?: string | null
          experience_level?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      // More tables will be added here when generated
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}