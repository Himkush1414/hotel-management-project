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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          check_in: string | null
          check_out: string | null
          created_at: string
          date: string
          hotel_id: string
          id: string
          marked_by: string | null
          notes: string | null
          staff_id: string
          status: string
          updated_at: string
        }
        Insert: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          date: string
          hotel_id: string
          id?: string
          marked_by?: string | null
          notes?: string | null
          staff_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          date?: string
          hotel_id?: string
          id?: string
          marked_by?: string | null
          notes?: string | null
          staff_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_marked_by_fkey"
            columns: ["marked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          hotel_id: string | null
          id: string
          new_data: Json | null
          old_data: Json | null
          performed_by: string | null
          record_id: string | null
          table_name: string
        }
        Insert: {
          action: string
          created_at?: string
          hotel_id?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          performed_by?: string | null
          record_id?: string | null
          table_name: string
        }
        Update: {
          action?: string
          created_at?: string
          hotel_id?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          performed_by?: string | null
          record_id?: string | null
          table_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_extras: {
        Row: {
          added_by: string | null
          booking_id: string
          created_at: string
          description: string
          hotel_id: string
          id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          added_by?: string | null
          booking_id: string
          created_at?: string
          description: string
          hotel_id: string
          id?: string
          quantity?: number
          total_price: number
          unit_price: number
        }
        Update: {
          added_by?: string | null
          booking_id?: string
          created_at?: string
          description?: string
          hotel_id?: string
          id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "booking_extras_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_extras_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_extras_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          actual_check_in: string | null
          actual_check_out: string | null
          booking_number: string
          check_in_date: string
          check_out_date: string
          created_at: string
          created_by: string | null
          guest_id: string
          hotel_id: string
          id: string
          notes: string | null
          num_adults: number
          num_children: number
          room_id: string
          room_rate: number
          source: string | null
          special_requests: string | null
          status: Database["public"]["Enums"]["booking_status"]
          total_nights: number
          updated_at: string
        }
        Insert: {
          actual_check_in?: string | null
          actual_check_out?: string | null
          booking_number: string
          check_in_date: string
          check_out_date: string
          created_at?: string
          created_by?: string | null
          guest_id: string
          hotel_id: string
          id?: string
          notes?: string | null
          num_adults?: number
          num_children?: number
          room_id: string
          room_rate: number
          source?: string | null
          special_requests?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          total_nights: number
          updated_at?: string
        }
        Update: {
          actual_check_in?: string | null
          actual_check_out?: string | null
          booking_number?: string
          check_in_date?: string
          check_out_date?: string
          created_at?: string
          created_by?: string | null
          guest_id?: string
          hotel_id?: string
          id?: string
          notes?: string | null
          num_adults?: number
          num_children?: number
          room_id?: string
          room_rate?: number
          source?: string | null
          special_requests?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          total_nights?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_categories: {
        Row: {
          created_at: string
          description: string | null
          hotel_id: string
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          hotel_id: string
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          hotel_id?: string
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_categories_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          approved_by: string | null
          category_id: string
          created_at: string
          description: string
          expense_date: string
          hotel_id: string
          id: string
          notes: string | null
          payment_mode: Database["public"]["Enums"]["payment_mode"]
          receipt_url: string | null
          recorded_by: string | null
          updated_at: string
          vendor_name: string | null
        }
        Insert: {
          amount: number
          approved_by?: string | null
          category_id: string
          created_at?: string
          description: string
          expense_date: string
          hotel_id: string
          id?: string
          notes?: string | null
          payment_mode?: Database["public"]["Enums"]["payment_mode"]
          receipt_url?: string | null
          recorded_by?: string | null
          updated_at?: string
          vendor_name?: string | null
        }
        Update: {
          amount?: number
          approved_by?: string | null
          category_id?: string
          created_at?: string
          description?: string
          expense_date?: string
          hotel_id?: string
          id?: string
          notes?: string | null
          payment_mode?: Database["public"]["Enums"]["payment_mode"]
          receipt_url?: string | null
          recorded_by?: string | null
          updated_at?: string
          vendor_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          flag_key: string
          hotel_id: string
          id: string
          is_enabled: boolean
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          flag_key: string
          hotel_id: string
          id?: string
          is_enabled?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          flag_key?: string
          hotel_id?: string
          id?: string
          is_enabled?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feature_flags_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feature_flags_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      guests: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          full_name: string
          hotel_id: string
          id: string
          id_proof_number: string | null
          id_proof_type: Database["public"]["Enums"]["id_proof_type"] | null
          id_proof_url: string | null
          nationality: string | null
          notes: string | null
          phone: string
          state: string | null
          total_stays: number
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name: string
          hotel_id: string
          id?: string
          id_proof_number?: string | null
          id_proof_type?: Database["public"]["Enums"]["id_proof_type"] | null
          id_proof_url?: string | null
          nationality?: string | null
          notes?: string | null
          phone: string
          state?: string | null
          total_stays?: number
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name?: string
          hotel_id?: string
          id?: string
          id_proof_number?: string | null
          id_proof_type?: Database["public"]["Enums"]["id_proof_type"] | null
          id_proof_url?: string | null
          nationality?: string | null
          notes?: string | null
          phone?: string
          state?: string | null
          total_stays?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guests_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      hotels: {
        Row: {
          address: string | null
          check_in_time: string
          check_out_time: string
          city: string | null
          country: string | null
          created_at: string
          currency: string
          email: string | null
          gstin: string | null
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          phone: string | null
          pincode: string | null
          slug: string
          state: string | null
          timezone: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          check_in_time?: string
          check_out_time?: string
          city?: string | null
          country?: string | null
          created_at?: string
          currency?: string
          email?: string | null
          gstin?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          phone?: string | null
          pincode?: string | null
          slug: string
          state?: string | null
          timezone?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          check_in_time?: string
          check_out_time?: string
          city?: string | null
          country?: string | null
          created_at?: string
          currency?: string
          email?: string | null
          gstin?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          phone?: string | null
          pincode?: string | null
          slug?: string
          state?: string | null
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          balance_amount: number | null
          booking_id: string
          created_at: string
          created_by: string | null
          discount_amount: number
          due_date: string | null
          guest_id: string
          hotel_id: string
          id: string
          invoice_number: string
          issued_at: string
          notes: string | null
          paid_amount: number
          payment_status: Database["public"]["Enums"]["payment_status"]
          subtotal: number
          tax_amount: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          balance_amount?: number | null
          booking_id: string
          created_at?: string
          created_by?: string | null
          discount_amount?: number
          due_date?: string | null
          guest_id: string
          hotel_id: string
          id?: string
          invoice_number: string
          issued_at?: string
          notes?: string | null
          paid_amount?: number
          payment_status?: Database["public"]["Enums"]["payment_status"]
          subtotal?: number
          tax_amount?: number
          total_amount: number
          updated_at?: string
        }
        Update: {
          balance_amount?: number | null
          booking_id?: string
          created_at?: string
          created_by?: string | null
          discount_amount?: number
          due_date?: string | null
          guest_id?: string
          hotel_id?: string
          id?: string
          invoice_number?: string
          issued_at?: string
          notes?: string | null
          paid_amount?: number
          payment_status?: Database["public"]["Enums"]["payment_status"]
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          hotel_id: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          profile_id: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          hotel_id: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          profile_id?: string | null
          title: string
          type?: string
        }
        Update: {
          created_at?: string
          hotel_id?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          profile_id?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          hotel_id: string
          id: string
          invoice_id: string
          notes: string | null
          payment_mode: Database["public"]["Enums"]["payment_mode"]
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          received_by: string | null
          transaction_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          hotel_id: string
          id?: string
          invoice_id: string
          notes?: string | null
          payment_mode: Database["public"]["Enums"]["payment_mode"]
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          received_by?: string | null
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          hotel_id?: string
          id?: string
          invoice_id?: string
          notes?: string | null
          payment_mode?: Database["public"]["Enums"]["payment_mode"]
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          received_by?: string | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          hotel_id: string
          id: string
          is_active: boolean
          phone: string | null
          role: Database["public"]["Enums"]["staff_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name: string
          hotel_id: string
          id: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["staff_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          hotel_id?: string
          id?: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["staff_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      room_type_ids: {
        Row: {
          amenities: string[]
          base_price: number
          created_at: string
          description: string | null
          hotel_id: string
          id: string
          is_active: boolean
          max_occupancy: number
          name: string
          updated_at: string
        }
        Insert: {
          amenities?: string[]
          base_price: number
          created_at?: string
          description?: string | null
          hotel_id: string
          id?: string
          is_active?: boolean
          max_occupancy?: number
          name: string
          updated_at?: string
        }
        Update: {
          amenities?: string[]
          base_price?: number
          created_at?: string
          description?: string | null
          hotel_id?: string
          id?: string
          is_active?: boolean
          max_occupancy?: number
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_type_ids_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          created_at: string
          floor: number | null
          hotel_id: string
          id: string
          is_active: boolean
          notes: string | null
          room_number: string
          room_type_id: string
          status: Database["public"]["Enums"]["room_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          floor?: number | null
          hotel_id: string
          id?: string
          is_active?: boolean
          notes?: string | null
          room_number: string
          room_type_id: string
          status?: Database["public"]["Enums"]["room_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          floor?: number | null
          hotel_id?: string
          id?: string
          is_active?: boolean
          notes?: string | null
          room_number?: string
          room_type_id?: string
          status?: Database["public"]["Enums"]["room_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rooms_room_type_id_fkey"
            columns: ["room_type_id"]
            isOneToOne: false
            referencedRelation: "room_type_ids"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          auto_checkout_enabled: boolean
          auto_checkout_time: string | null
          booking_prefix: string
          gst_rate: number
          hotel_id: string
          id: string
          invoice_prefix: string
          razorpay_enabled: boolean
          updated_at: string
          whatsapp_api_key: string | null
          whatsapp_enabled: boolean
        }
        Insert: {
          auto_checkout_enabled?: boolean
          auto_checkout_time?: string | null
          booking_prefix?: string
          gst_rate?: number
          hotel_id: string
          id?: string
          invoice_prefix?: string
          razorpay_enabled?: boolean
          updated_at?: string
          whatsapp_api_key?: string | null
          whatsapp_enabled?: boolean
        }
        Update: {
          auto_checkout_enabled?: boolean
          auto_checkout_time?: string | null
          booking_prefix?: string
          gst_rate?: number
          hotel_id?: string
          id?: string
          invoice_prefix?: string
          razorpay_enabled?: boolean
          updated_at?: string
          whatsapp_api_key?: string | null
          whatsapp_enabled?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "settings_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: true
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      staff: {
        Row: {
          address: string | null
          bank_account: string | null
          bank_ifsc: string | null
          created_at: string
          date_of_birth: string | null
          date_of_joining: string
          department: string | null
          email: string | null
          emergency_contact: string | null
          employee_code: string
          full_name: string
          hotel_id: string
          id: string
          is_active: boolean
          notes: string | null
          phone: string
          profile_id: string | null
          role: Database["public"]["Enums"]["staff_role"]
          salary: number | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          bank_account?: string | null
          bank_ifsc?: string | null
          created_at?: string
          date_of_birth?: string | null
          date_of_joining: string
          department?: string | null
          email?: string | null
          emergency_contact?: string | null
          employee_code: string
          full_name: string
          hotel_id: string
          id?: string
          is_active?: boolean
          notes?: string | null
          phone: string
          profile_id?: string | null
          role: Database["public"]["Enums"]["staff_role"]
          salary?: number | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          bank_account?: string | null
          bank_ifsc?: string | null
          created_at?: string
          date_of_birth?: string | null
          date_of_joining?: string
          department?: string | null
          email?: string | null
          emergency_contact?: string | null
          employee_code?: string
          full_name?: string
          hotel_id?: string
          id?: string
          is_active?: boolean
          notes?: string | null
          phone?: string
          profile_id?: string | null
          role?: Database["public"]["Enums"]["staff_role"]
          salary?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_documents: {
        Row: {
          document_name: string
          document_type: string
          file_url: string
          hotel_id: string
          id: string
          staff_id: string
          uploaded_at: string
        }
        Insert: {
          document_name: string
          document_type: string
          file_url: string
          hotel_id: string
          id?: string
          staff_id: string
          uploaded_at?: string
        }
        Update: {
          document_name?: string
          document_type?: string
          file_url?: string
          hotel_id?: string
          id?: string
          staff_id?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_documents_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_documents_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_hotel_id: { Args: never; Returns: string }
      get_my_role: {
        Args: never
        Returns: Database["public"]["Enums"]["staff_role"]
      }
      is_admin: { Args: never; Returns: boolean }
      is_admin_or_manager: { Args: never; Returns: boolean }
    }
    Enums: {
      booking_status:
        | "pending"
        | "confirmed"
        | "checked_in"
        | "checked_out"
        | "cancelled"
        | "no_show"
      id_proof_type:
        | "aadhaar"
        | "passport"
        | "driving_license"
        | "voter_id"
        | "pan_card"
      payment_mode:
        | "cash"
        | "card"
        | "upi"
        | "bank_transfer"
        | "razorpay"
        | "complimentary"
      payment_status: "pending" | "partial" | "paid" | "refunded" | "failed"
      room_status:
        | "available"
        | "occupied"
        | "cleaning"
        | "maintenance"
        | "blocked"
      staff_role:
        | "admin"
        | "manager"
        | "receptionist"
        | "housekeeping"
        | "security"
        | "kitchen"
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

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      booking_status: [
        "pending",
        "confirmed",
        "checked_in",
        "checked_out",
        "cancelled",
        "no_show",
      ],
      id_proof_type: [
        "aadhaar",
        "passport",
        "driving_license",
        "voter_id",
        "pan_card",
      ],
      payment_mode: [
        "cash",
        "card",
        "upi",
        "bank_transfer",
        "razorpay",
        "complimentary",
      ],
      payment_status: ["pending", "partial", "paid", "refunded", "failed"],
      room_status: [
        "available",
        "occupied",
        "cleaning",
        "maintenance",
        "blocked",
      ],
      staff_role: [
        "admin",
        "manager",
        "receptionist",
        "housekeeping",
        "security",
        "kitchen",
      ],
    },
  },
} as const

export type StaffRole = "admin" | "manager" | "receptionist" | "housekeeping" | "maintenance" | "chef" | "security" | "accountant";

export type BookingStatus = "pending" | "confirmed" | "checked_in" | "checked_out" | "cancelled" | "no_show";

export type RoomStatus = "available" | "occupied" | "cleaning" | "maintenance" | "blocked";
