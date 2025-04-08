export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ai_chat_history: {
        Row: {
          created_at: string | null
          id: string
          is_user: boolean
          message: string
          session_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_user: boolean
          message: string
          session_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_user?: boolean
          message?: string
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      detected_devices: {
        Row: {
          categorization: string | null
          detected_at: string | null
          device_id: string | null
          device_name: string | null
          device_type: string
          id: string
          is_suspicious: boolean | null
          scan_id: string
          signal_strength: number | null
        }
        Insert: {
          categorization?: string | null
          detected_at?: string | null
          device_id?: string | null
          device_name?: string | null
          device_type: string
          id?: string
          is_suspicious?: boolean | null
          scan_id: string
          signal_strength?: number | null
        }
        Update: {
          categorization?: string | null
          detected_at?: string | null
          device_id?: string | null
          device_name?: string | null
          device_type?: string
          id?: string
          is_suspicious?: boolean | null
          scan_id?: string
          signal_strength?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "detected_devices_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "device_scans"
            referencedColumns: ["id"]
          },
        ]
      }
      device_scans: {
        Row: {
          id: string
          is_completed: boolean | null
          latitude: number | null
          location: string | null
          longitude: number | null
          scan_completed_at: string | null
          scan_started_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          is_completed?: boolean | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          scan_completed_at?: string | null
          scan_started_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          is_completed?: boolean | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          scan_completed_at?: string | null
          scan_started_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_scans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_contacts: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone_number: string
          priority: number | null
          relationship: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone_number: string
          priority?: number | null
          relationship?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone_number?: string
          priority?: number | null
          relationship?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emergency_contacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_media: {
        Row: {
          created_at: string | null
          file_path: string
          file_size: number | null
          id: string
          incident_id: string
          media_type: string
        }
        Insert: {
          created_at?: string | null
          file_path: string
          file_size?: number | null
          id?: string
          incident_id: string
          media_type: string
        }
        Update: {
          created_at?: string | null
          file_path?: string
          file_size?: number | null
          id?: string
          incident_id?: string
          media_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "incident_media_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          description: string | null
          happened_at: string | null
          id: string
          incident_type: string
          is_public: boolean | null
          is_verified: boolean | null
          latitude: number | null
          location: string | null
          longitude: number | null
          reported_at: string | null
          severity: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          description?: string | null
          happened_at?: string | null
          id?: string
          incident_type: string
          is_public?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          reported_at?: string | null
          severity?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          description?: string | null
          happened_at?: string | null
          id?: string
          incident_type?: string
          is_public?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          reported_at?: string | null
          severity?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incidents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          biometric_auth_enabled: boolean | null
          created_at: string | null
          full_name: string | null
          id: string
          last_login_at: string | null
          notification_preferences: Json | null
          phone_number: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          biometric_auth_enabled?: boolean | null
          created_at?: string | null
          full_name?: string | null
          id: string
          last_login_at?: string | null
          notification_preferences?: Json | null
          phone_number?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          biometric_auth_enabled?: boolean | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          last_login_at?: string | null
          notification_preferences?: Json | null
          phone_number?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      safe_zones: {
        Row: {
          address: string
          created_at: string | null
          id: string
          latitude: number
          longitude: number
          name: string
          radius: number | null
          type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address: string
          created_at?: string | null
          id?: string
          latitude: number
          longitude: number
          name: string
          radius?: number | null
          type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string
          created_at?: string | null
          id?: string
          latitude?: number
          longitude?: number
          name?: string
          radius?: number | null
          type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "safe_zones_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      safety_tips: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          id?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sos_events: {
        Row: {
          custom_message: string | null
          id: string
          initiated_at: string | null
          latitude: number | null
          location: string | null
          longitude: number | null
          resolved_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          custom_message?: string | null
          id?: string
          initiated_at?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          resolved_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          custom_message?: string | null
          id?: string
          initiated_at?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          resolved_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sos_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sos_notifications: {
        Row: {
          contact_id: string
          delivered_at: string | null
          id: string
          notification_type: string
          sent_at: string | null
          sos_event_id: string
          status: string | null
        }
        Insert: {
          contact_id: string
          delivered_at?: string | null
          id?: string
          notification_type: string
          sent_at?: string | null
          sos_event_id: string
          status?: string | null
        }
        Update: {
          contact_id?: string
          delivered_at?: string | null
          id?: string
          notification_type?: string
          sent_at?: string | null
          sos_event_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sos_notifications_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "emergency_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sos_notifications_sos_event_id_fkey"
            columns: ["sos_event_id"]
            isOneToOne: false
            referencedRelation: "sos_events"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          created_at: string | null
          device_info: Json | null
          expires_at: string | null
          id: string
          ip_address: string | null
          is_active: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_info?: Json | null
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_info?: Json | null
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
