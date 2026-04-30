export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          cover_letter: string | null
          created_at: string | null
          desired_move_in: string | null
          has_pets: boolean | null
          id: string
          landlord_id: string
          lease_months: number | null
          occupants: number | null
          pets_description: string | null
          property_id: string
          status: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          cover_letter?: string | null
          created_at?: string | null
          desired_move_in?: string | null
          has_pets?: boolean | null
          id?: string
          landlord_id: string
          lease_months?: number | null
          occupants?: number | null
          pets_description?: string | null
          property_id: string
          status?: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          cover_letter?: string | null
          created_at?: string | null
          desired_move_in?: string | null
          has_pets?: boolean | null
          id?: string
          landlord_id?: string
          lease_months?: number | null
          occupants?: number | null
          pets_description?: string | null
          property_id?: string
          status?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_landlord_id_fkey"
            columns: ["landlord_id"]
            isOneToOne: false
            referencedRelation: "landlords"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_decisions: {
        Row: {
          application_id: string
          approval_status: Database["public"]["Enums"]["approval_status_enum"]
          classification: Database["public"]["Enums"]["approval_classification_enum"]
          created_at: string | null
          decided_at: string | null
          decided_by: string | null
          id: string
          landlord_id: string
          reasoning: string | null
          requires_guarantor: boolean | null
          requires_insurance: boolean | null
          requires_manual_review: boolean | null
          tenant_id: string
          updated_at: string | null
          valid_until: string | null
        }
        Insert: {
          application_id: string
          approval_status: Database["public"]["Enums"]["approval_status_enum"]
          classification: Database["public"]["Enums"]["approval_classification_enum"]
          created_at?: string | null
          decided_at?: string | null
          decided_by?: string | null
          id?: string
          landlord_id: string
          reasoning?: string | null
          requires_guarantor?: boolean | null
          requires_insurance?: boolean | null
          requires_manual_review?: boolean | null
          tenant_id: string
          updated_at?: string | null
          valid_until?: string | null
        }
        Update: {
          application_id?: string
          approval_status?: Database["public"]["Enums"]["approval_status_enum"]
          classification?: Database["public"]["Enums"]["approval_classification_enum"]
          created_at?: string | null
          decided_at?: string | null
          decided_by?: string | null
          id?: string
          landlord_id?: string
          reasoning?: string | null
          requires_guarantor?: boolean | null
          requires_insurance?: boolean | null
          requires_manual_review?: boolean | null
          tenant_id?: string
          updated_at?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "approval_decisions_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_decisions_decided_by_fkey"
            columns: ["decided_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_decisions_landlord_id_fkey"
            columns: ["landlord_id"]
            isOneToOne: false
            referencedRelation: "landlords"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_decisions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string | null
          entity_type: string
          error_message: string | null
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          status: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          error_message?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          status?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          error_message?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          status?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          application_id: string
          contract_url: string | null
          created_at: string | null
          duration_months: number | null
          id: string
          landlord_id: string
          landlord_responsibilities: string | null
          lease_end_date: string
          lease_start_date: string
          maintenance_fee: number | null
          penalties: string | null
          property_id: string
          rent_amount: number
          security_deposit: number | null
          status: Database["public"]["Enums"]["contract_status_enum"]
          tenant_id: string
          tenant_responsibilities: string | null
          terms_and_conditions: string | null
          updated_at: string | null
        }
        Insert: {
          application_id: string
          contract_url?: string | null
          created_at?: string | null
          duration_months?: number | null
          id?: string
          landlord_id: string
          landlord_responsibilities?: string | null
          lease_end_date: string
          lease_start_date: string
          maintenance_fee?: number | null
          penalties?: string | null
          property_id: string
          rent_amount: number
          security_deposit?: number | null
          status?: Database["public"]["Enums"]["contract_status_enum"]
          tenant_id: string
          tenant_responsibilities?: string | null
          terms_and_conditions?: string | null
          updated_at?: string | null
        }
        Update: {
          application_id?: string
          contract_url?: string | null
          created_at?: string | null
          duration_months?: number | null
          id?: string
          landlord_id?: string
          landlord_responsibilities?: string | null
          lease_end_date?: string
          lease_start_date?: string
          maintenance_fee?: number | null
          penalties?: string | null
          property_id?: string
          rent_amount?: number
          security_deposit?: number | null
          status?: Database["public"]["Enums"]["contract_status_enum"]
          tenant_id?: string
          tenant_responsibilities?: string | null
          terms_and_conditions?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_landlord_id_fkey"
            columns: ["landlord_id"]
            isOneToOne: false
            referencedRelation: "landlords"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          auth_id: string
          avatar_url: string | null
          bio: string | null
          city: string | null
          country: string | null
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          id_number: string | null
          is_verified: boolean | null
          last_name: string | null
          phone: string | null
          postal_code: string | null
          role: Database["public"]["Enums"]["user_role_enum"]
          updated_at: string | null
          verification_date: string | null
        }
        Insert: {
          address?: string | null
          auth_id: string
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email: string
          first_name?: string | null
          id?: string
          id_number?: string | null
          is_verified?: boolean | null
          last_name?: string | null
          phone?: string | null
          postal_code?: string | null
          role?: Database["public"]["Enums"]["user_role_enum"]
          updated_at?: string | null
          verification_date?: string | null
        }
        Update: {
          address?: string | null
          auth_id?: string
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          id_number?: string | null
          is_verified?: boolean | null
          last_name?: string | null
          phone?: string | null
          postal_code?: string | null
          role?: Database["public"]["Enums"]["user_role_enum"]
          updated_at?: string | null
          verification_date?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          amenities: string[] | null
          area_m2: number | null
          available_from: string | null
          bathrooms: number
          bedrooms: number
          city: string
          country: string
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          furnished: boolean | null
          id: string
          landlord_id: string
          latitude: number | null
          longitude: number | null
          maintenance_fee: number | null
          max_occupants: number | null
          min_lease_months: number | null
          monthly_rent: number
          parking_spots: number | null
          pets_allowed: boolean | null
          postal_code: string | null
          property_type: string
          security_deposit: number | null
          slug: string | null
          status: string
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          address: string
          amenities?: string[] | null
          area_m2?: number | null
          available_from?: string | null
          bathrooms: number
          bedrooms: number
          city: string
          country: string
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          furnished?: boolean | null
          id?: string
          landlord_id: string
          latitude?: number | null
          longitude?: number | null
          maintenance_fee?: number | null
          max_occupants?: number | null
          min_lease_months?: number | null
          monthly_rent: number
          parking_spots?: number | null
          pets_allowed?: boolean | null
          postal_code?: string | null
          property_type: string
          security_deposit?: number | null
          slug?: string | null
          status?: string
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          address?: string
          amenities?: string[] | null
          area_m2?: number | null
          available_from?: string | null
          bathrooms?: number
          bedrooms?: number
          city?: string
          country?: string
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          furnished?: boolean | null
          id?: string
          landlord_id?: string
          latitude?: number | null
          longitude?: number | null
          maintenance_fee?: number | null
          max_occupants?: number | null
          min_lease_months?: number | null
          monthly_rent?: number
          parking_spots?: number | null
          pets_allowed?: boolean | null
          postal_code?: string | null
          property_type?: string
          security_deposit?: number | null
          slug?: string | null
          status?: string
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_landlord_id_fkey"
            columns: ["landlord_id"]
            isOneToOne: false
            referencedRelation: "landlords"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string | null
          credit_score: number | null
          current_rental_id: string | null
          has_guarantor: boolean | null
          id: string
          is_verified: boolean | null
          monthly_income: number | null
          occupation: string | null
          profile_id: string
          rating: number | null
          rental_history_count: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          credit_score?: number | null
          current_rental_id?: string | null
          has_guarantor?: boolean | null
          id?: string
          is_verified?: boolean | null
          monthly_income?: number | null
          occupation?: string | null
          profile_id: string
          rating?: number | null
          rental_history_count?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          credit_score?: number | null
          current_rental_id?: string | null
          has_guarantor?: boolean | null
          id?: string
          is_verified?: boolean | null
          monthly_income?: number | null
          occupation?: string | null
          profile_id?: string
          rating?: number | null
          rental_history_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenants_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
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
      calculate_prequalification: {
        Args: {
          p_has_guarantor: boolean
          p_monthly_income: number
          p_occupation: string
          p_tenant_id: string
        }
        Returns: {
          classification: Database["public"]["Enums"]["approval_classification_enum"]
          result: Database["public"]["Enums"]["approval_status_enum"]
          score: number
        }[]
      }
      get_current_user_profile: {
        Args: never
        Returns: {
          email: string
          first_name: string
          id: string
          landlord_id: string
          role: Database["public"]["Enums"]["user_role_enum"]
          tenant_id: string
        }[]
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role_enum"]
      }
      is_landlord: { Args: { user_id?: string }; Returns: boolean }
      is_tenant: { Args: { user_id?: string }; Returns: boolean }
    }
    Enums: {
      approval_classification_enum: "high" | "medium" | "low"
      approval_status_enum: "approved" | "needs_backup" | "rejected"
      contract_status_enum:
        | "draft"
        | "pending_signatures"
        | "active"
        | "completed"
        | "terminated"
        | "disputed"
      delivery_status_enum: "pending" | "in_progress" | "completed" | "disputed"
      document_status_enum:
        | "pending"
        | "uploaded"
        | "reviewing"
        | "approved"
        | "rejected"
        | "needs_fix"
      notification_type_enum: "info" | "warning" | "error" | "success"
      payment_status_enum:
        | "pending"
        | "held"
        | "released"
        | "failed"
        | "refunded"
      signature_status_enum: "pending" | "signed" | "rejected"
      user_role_enum: "admin" | "landlord" | "tenant"
      verification_status_enum:
        | "pending"
        | "approved"
        | "conditional"
        | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never
