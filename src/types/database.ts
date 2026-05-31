export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type StaffRole =
  | 'admin'
  | 'manager'
  | 'receptionist'
  | 'housekeeping'
  | 'security'
  | 'kitchen'

export type RoomStatus =
  | 'available'
  | 'occupied'
  | 'cleaning'
  | 'maintenance'
  | 'blocked'

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled'
  | 'no_show'

export type PaymentStatus =
  | 'pending'
  | 'partial'
  | 'paid'
  | 'refunded'
  | 'failed'

export type PaymentMode =
  | 'cash'
  | 'card'
  | 'upi'
  | 'bank_transfer'
  | 'razorpay'
  | 'complimentary'

export type IdProofType =
  | 'aadhaar'
  | 'passport'
  | 'driving_license'
  | 'voter_id'
  | 'pan_card'

export interface Database {
  public: {
    Tables: {
      hotels: {
        Row: {
          id:             string
          name:           string
          slug:           string
          address:        string | null
          city:           string | null
          state:          string | null
          country:        string
          pincode:        string | null
          phone:          string | null
          email:          string | null
          gstin:          string | null
          logo_url:       string | null
          currency:       string
          timezone:       string
          check_in_time:  string
          check_out_time: string
          is_active:      boolean
          created_at:     string
          updated_at:     string
        }
        Insert: {
          id?:            string
          name:           string
          slug:           string
          address?:       string | null
          city?:          string | null
          state?:         string | null
          country?:       string
          pincode?:       string | null
          phone?:         string | null
          email?:         string | null
          gstin?:         string | null
          logo_url?:      string | null
          currency?:      string
          timezone?:      string
          check_in_time?: string
          check_out_time?:string
          is_active?:     boolean
          created_at?:    string
          updated_at?:    string
        }
        Update: Partial<Database['public']['Tables']['hotels']['Insert']>
      }
      profiles: {
        Row: {
          id:         string
          hotel_id:   string
          role:       StaffRole
          full_name:  string
          phone:      string | null
          avatar_url: string | null
          is_active:  boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id:          string
          hotel_id:    string
          role?:       StaffRole
          full_name:   string
          phone?:      string | null
          avatar_url?: string | null
          is_active?:  boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      staff: {
        Row: {
          id:                string
          hotel_id:          string
          profile_id:        string | null
          employee_code:     string
          full_name:         string
          role:              StaffRole
          department:        string | null
          phone:             string
          email:             string | null
          address:           string | null
          date_of_joining:   string
          date_of_birth:     string | null
          salary:            number | null
          bank_account:      string | null
          bank_ifsc:         string | null
          emergency_contact: string | null
          is_active:         boolean
          notes:             string | null
          created_at:        string
          updated_at:        string
        }
        Insert: {
          id?:               string
          hotel_id:          string
          profile_id?:       string | null
          employee_code:     string
          full_name:         string
          role:              StaffRole
          department?:       string | null
          phone:             string
          email?:            string | null
          address?:          string | null
          date_of_joining:   string
          date_of_birth?:    string | null
          salary?:           number | null
          bank_account?:     string | null
          bank_ifsc?:        string | null
          emergency_contact?:string | null
          is_active?:        boolean
          notes?:            string | null
          created_at?:       string
          updated_at?:       string
        }
        Update: Partial<Database['public']['Tables']['staff']['Insert']>
      }
      staff_documents: {
        Row: {
          id:            string
          hotel_id:      string
          staff_id:      string
          document_type: string
          document_name: string
          file_url:      string
          uploaded_at:   string
        }
        Insert: {
          id?:           string
          hotel_id:      string
          staff_id:      string
          document_type: string
          document_name: string
          file_url:      string
          uploaded_at?:  string
        }
        Update: Partial<Database['public']['Tables']['staff_documents']['Insert']>
      }
      attendance: {
        Row: {
          id:         string
          hotel_id:   string
          staff_id:   string
          date:       string
          check_in:   string | null
          check_out:  string | null
          status:     'present' | 'absent' | 'half_day' | 'leave' | 'holiday'
          notes:      string | null
          marked_by:  string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?:        string
          hotel_id:   string
          staff_id:   string
          date:       string
          check_in?:  string | null
          check_out?: string | null
          status?:    'present' | 'absent' | 'half_day' | 'leave' | 'holiday'
          notes?:     string | null
          marked_by?: string | null
          created_at?:string
          updated_at?:string
        }
        Update: Partial<Database['public']['Tables']['attendance']['Insert']>
      }
      room_types: {
        Row: {
          id:            string
          hotel_id:      string
          name:          string
          description:   string | null
          base_price:    number
          max_occupancy: number
          amenities:     string[]
          is_active:     boolean
          created_at:    string
          updated_at:    string
        }
        Insert: {
          id?:           string
          hotel_id:      string
          name:          string
          description?:  string | null
          base_price:    number
          max_occupancy?:number
          amenities?:    string[]
          is_active?:    boolean
          created_at?:   string
          updated_at?:   string
        }
        Update: Partial<Database['public']['Tables']['room_types']['Insert']>
      }
      rooms: {
        Row: {
          id:           string
          hotel_id:     string
          room_type_id: string
          room_number:  string
          floor:        number | null
          status:       RoomStatus
          is_active:    boolean
          notes:        string | null
          created_at:   string
          updated_at:   string
        }
        Insert: {
          id?:          string
          hotel_id:     string
          room_type_id: string
          room_number:  string
          floor?:       number | null
          status?:      RoomStatus
          is_active?:   boolean
          notes?:       string | null
          created_at?:  string
          updated_at?:  string
        }
        Update: Partial<Database['public']['Tables']['rooms']['Insert']>
      }
      guests: {
        Row: {
          id:              string
          hotel_id:        string
          full_name:       string
          phone:           string
          email:           string | null
          nationality:     string | null
          id_proof_type:   IdProofType | null
          id_proof_number: string | null
          id_proof_url:    string | null
          address:         string | null
          city:            string | null
          state:           string | null
          date_of_birth:   string | null
          notes:           string | null
          total_stays:     number
          created_at:      string
          updated_at:      string
        }
        Insert: {
          id?:              string
          hotel_id:         string
          full_name:        string
          phone:            string
          email?:           string | null
          nationality?:     string | null
          id_proof_type?:   IdProofType | null
          id_proof_number?: string | null
          id_proof_url?:    string | null
          address?:         string | null
          city?:            string | null
          state?:           string | null
          date_of_birth?:   string | null
          notes?:           string | null
          total_stays?:     number
          created_at?:      string
          updated_at?:      string
        }
        Update: Partial<Database['public']['Tables']['guests']['Insert']>
      }
      bookings: {
        Row: {
          id:               string
          hotel_id:         string
          booking_number:   string
          guest_id:         string
          room_id:          string
          check_in_date:    string
          check_out_date:   string
          actual_check_in:  string | null
          actual_check_out: string | null
          num_adults:       number
          num_children:     number
          status:           BookingStatus
          source:           string | null
          room_rate:        number
          total_nights:     number
          special_requests: string | null
          notes:            string | null
          created_by:       string | null
          created_at:       string
          updated_at:       string
        }
        Insert: {
          id?:               string
          hotel_id:          string
          booking_number:    string
          guest_id:          string
          room_id:           string
          check_in_date:     string
          check_out_date:    string
          actual_check_in?:  string | null
          actual_check_out?: string | null
          num_adults?:       number
          num_children?:     number
          status?:           BookingStatus
          source?:           string | null
          room_rate:         number
          total_nights:      number
          special_requests?: string | null
          notes?:            string | null
          created_by?:       string | null
          created_at?:       string
          updated_at?:       string
        }
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>
      }
      booking_extras: {
        Row: {
          id:          string
          hotel_id:    string
          booking_id:  string
          description: string
          quantity:    number
          unit_price:  number
          total_price: number
          added_by:    string | null
          created_at:  string
        }
        Insert: {
          id?:         string
          hotel_id:    string
          booking_id:  string
          description: string
          quantity?:   number
          unit_price:  number
          total_price: number
          added_by?:   string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['booking_extras']['Insert']>
      }
      invoices: {
        Row: {
          id:              string
          hotel_id:        string
          booking_id:      string
          invoice_number:  string
          guest_id:        string
          subtotal:        number
          tax_amount:      number
          discount_amount: number
          total_amount:    number
          paid_amount:     number
          balance_amount:  number
          payment_status:  PaymentStatus
          notes:           string | null
          issued_at:       string
          due_date:        string | null
          created_by:      string | null
          created_at:      string
          updated_at:      string
        }
        Insert: {
          id?:              string
          hotel_id:         string
          booking_id:       string
          invoice_number:   string
          guest_id:         string
          subtotal?:        number
          tax_amount?:      number
          discount_amount?: number
          total_amount:     number
          paid_amount?:     number
          payment_status?:  PaymentStatus
          notes?:           string | null
          issued_at?:       string
          due_date?:        string | null
          created_by?:      string | null
          created_at?:      string
          updated_at?:      string
        }
        Update: Partial<Database['public']['Tables']['invoices']['Insert']>
      }
      payments: {
        Row: {
          id:                   string
          hotel_id:             string
          invoice_id:           string
          amount:               number
          payment_mode:         PaymentMode
          transaction_id:       string | null
          razorpay_order_id:    string | null
          razorpay_payment_id:  string | null
          razorpay_signature:   string | null
          notes:                string | null
          received_by:          string | null
          created_at:           string
        }
        Insert: {
          id?:                   string
          hotel_id:              string
          invoice_id:            string
          amount:                number
          payment_mode:          PaymentMode
          transaction_id?:       string | null
          razorpay_order_id?:    string | null
          razorpay_payment_id?:  string | null
          razorpay_signature?:   string | null
          notes?:                string | null
          received_by?:          string | null
          created_at?:           string
        }
        Update: Partial<Database['public']['Tables']['payments']['Insert']>
      }
      expense_categories: {
        Row: {
          id:          string
          hotel_id:    string
          name:        string
          description: string | null
          is_active:   boolean
          created_at:  string
        }
        Insert: {
          id?:          string
          hotel_id:     string
          name:         string
          description?: string | null
          is_active?:   boolean
          created_at?:  string
        }
        Update: Partial<Database['public']['Tables']['expense_categories']['Insert']>
      }
      expenses: {
        Row: {
          id:           string
          hotel_id:     string
          category_id:  string
          description:  string
          amount:       number
          expense_date: string
          receipt_url:  string | null
          vendor_name:  string | null
          payment_mode: PaymentMode
          approved_by:  string | null
          recorded_by:  string | null
          notes:        string | null
          created_at:   string
          updated_at:   string
        }
        Insert: {
          id?:           string
          hotel_id:      string
          category_id:   string
          description:   string
          amount:        number
          expense_date:  string
          receipt_url?:  string | null
          vendor_name?:  string | null
          payment_mode?: PaymentMode
          approved_by?:  string | null
          recorded_by?:  string | null
          notes?:        string | null
          created_at?:   string
          updated_at?:   string
        }
        Update: Partial<Database['public']['Tables']['expenses']['Insert']>
      }
      notifications: {
        Row: {
          id:         string
          hotel_id:   string
          profile_id: string | null
          title:      string
          message:    string
          type:       'info' | 'warning' | 'error' | 'success'
          is_read:    boolean
          link:       string | null
          created_at: string
        }
        Insert: {
          id?:        string
          hotel_id:   string
          profile_id?:string | null
          title:      string
          message:    string
          type?:      'info' | 'warning' | 'error' | 'success'
          is_read?:   boolean
          link?:      string | null
          created_at?:string
        }
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
      }
      feature_flags: {
        Row: {
          id:         string
          hotel_id:   string
          flag_key:   string
          is_enabled: boolean
          updated_by: string | null
          updated_at: string
        }
        Insert: {
          id?:         string
          hotel_id:    string
          flag_key:    string
          is_enabled?: boolean
          updated_by?: string | null
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['feature_flags']['Insert']>
      }
      settings: {
        Row: {
          id:                    string
          hotel_id:              string
          gst_rate:              number
          invoice_prefix:        string
          booking_prefix:        string
          whatsapp_enabled:      boolean
          whatsapp_api_key:      string | null
          razorpay_enabled:      boolean
          auto_checkout_enabled: boolean
          auto_checkout_time:    string | null
          updated_at:            string
        }
        Insert: {
          id?:                    string
          hotel_id:               string
          gst_rate?:              number
          invoice_prefix?:        string
          booking_prefix?:        string
          whatsapp_enabled?:      boolean
          whatsapp_api_key?:      string | null
          razorpay_enabled?:      boolean
          auto_checkout_enabled?: boolean
          auto_checkout_time?:    string | null
          updated_at?:            string
        }
        Update: Partial<Database['public']['Tables']['settings']['Insert']>
      }
      audit_logs: {
        Row: {
          id:           string
          hotel_id:     string | null
          table_name:   string
          record_id:    string | null
          action:       'INSERT' | 'UPDATE' | 'DELETE'
          old_data:     Json | null
          new_data:     Json | null
          performed_by: string | null
          created_at:   string
        }
        Insert: {
          id?:           string
          hotel_id?:     string | null
          table_name:    string
          record_id?:    string | null
          action:        'INSERT' | 'UPDATE' | 'DELETE'
          old_data?:     Json | null
          new_data?:     Json | null
          performed_by?: string | null
          created_at?:   string
        }
        Update: Partial<Database['public']['Tables']['audit_logs']['Insert']>
      }
    }
    Views:   Record<string, never>
    Functions: {
      get_my_hotel_id:    { Args: Record<string, never>; Returns: string }
      get_my_role:        { Args: Record<string, never>; Returns: StaffRole }
      is_admin:           { Args: Record<string, never>; Returns: boolean }
      is_admin_or_manager:{ Args: Record<string, never>; Returns: boolean }
      seed_hotel_defaults:{ Args: { p_hotel_id: string }; Returns: void }
    }
    Enums: {
      staff_role:     StaffRole
      room_status:    RoomStatus
      booking_status: BookingStatus
      payment_status: PaymentStatus
      payment_mode:   PaymentMode
      id_proof_type:  IdProofType
    }
  }
}
