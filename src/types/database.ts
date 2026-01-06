export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ProjectStatus = 'Active' | 'Concept' | 'Maintenance' | 'Archived'
export type ProjectType = 'Tool' | 'Platform' | 'Research' | 'AI Agent' | 'Analytics' | 'Experiment' | 'Other'

export interface Database {
  public: {
    Tables: {
      missions: {
        Row: {
          id: string
          user_id: string | null
          title: string
          statement: string
          color: string
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          title: string
          statement: string
          color: string
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          title?: string
          statement?: string
          color?: string
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string | null
          mission_id: string
          title: string
          status: ProjectStatus
          progress: number
          type: ProjectType
          description: string | null
          github_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          mission_id: string
          title: string
          status?: ProjectStatus
          progress?: number
          type?: ProjectType
          description?: string | null
          github_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          mission_id?: string
          title?: string
          status?: ProjectStatus
          progress?: number
          type?: ProjectType
          description?: string | null
          github_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      project_status: ProjectStatus
      project_type: ProjectType
    }
  }
}

// Helper types for easier usage
export type Mission = Database['public']['Tables']['missions']['Row']
export type MissionInsert = Database['public']['Tables']['missions']['Insert']
export type MissionUpdate = Database['public']['Tables']['missions']['Update']

export type Project = Database['public']['Tables']['projects']['Row']
export type ProjectInsert = Database['public']['Tables']['projects']['Insert']
export type ProjectUpdate = Database['public']['Tables']['projects']['Update']

// Combined type for missions with their projects
export interface MissionWithProjects extends Mission {
  projects: Project[]
}
