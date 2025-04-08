
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          phone_number: string | null
          avatar_url: string | null
          biometric_auth_enabled: boolean | null
          notification_preferences: Json | null
          created_at: string | null
          updated_at: string | null
          last_login_at: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          phone_number?: string | null
          avatar_url?: string | null
          biometric_auth_enabled?: boolean | null
          notification_preferences?: Json | null
          created_at?: string | null
          updated_at?: string | null
          last_login_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          phone_number?: string | null
          avatar_url?: string | null
          biometric_auth_enabled?: boolean | null
          notification_preferences?: Json | null
          created_at?: string | null
          updated_at?: string | null
          last_login_at?: string | null
        }
      }
      emergency_contacts: {
        Row: {
          id: string
          user_id: string
          name: string
          phone_number: string
          email: string | null
          relationship: string | null
          priority: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          phone_number: string
          email?: string | null
          relationship?: string | null
          priority?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          phone_number?: string
          email?: string | null
          relationship?: string | null
          priority?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      safe_zones: {
        Row: {
          id: string
          user_id: string
          name: string
          address: string
          latitude: number
          longitude: number
          radius: number | null
          type: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          address: string
          latitude: number
          longitude: number
          radius?: number | null
          type?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          address?: string
          latitude?: number
          longitude?: number
          radius?: number | null
          type?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      sos_events: {
        Row: {
          id: string
          user_id: string
          status: string | null
          initiated_at: string | null
          resolved_at: string | null
          location: string | null
          latitude: number | null
          longitude: number | null
          custom_message: string | null
        }
        Insert: {
          id?: string
          user_id: string
          status?: string | null
          initiated_at?: string | null
          resolved_at?: string | null
          location?: string | null
          latitude?: number | null
          longitude?: number | null
          custom_message?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          status?: string | null
          initiated_at?: string | null
          resolved_at?: string | null
          location?: string | null
          latitude?: number | null
          longitude?: number | null
          custom_message?: string | null
        }
      }
      sos_notifications: {
        Row: {
          id: string
          sos_event_id: string
          contact_id: string
          notification_type: string
          status: string | null
          sent_at: string | null
          delivered_at: string | null
        }
        Insert: {
          id?: string
          sos_event_id: string
          contact_id: string
          notification_type: string
          status?: string | null
          sent_at?: string | null
          delivered_at?: string | null
        }
        Update: {
          id?: string
          sos_event_id?: string
          contact_id?: string
          notification_type?: string
          status?: string | null
          sent_at?: string | null
          delivered_at?: string | null
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
      [_ in never]: never
    }
  }
}
