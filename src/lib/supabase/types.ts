// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          attendance: string
          date: string
          id: string
          status: string
          student_email: string | null
          student_id: string
          student_name: string | null
          unit_id: string
        }
        Insert: {
          attendance?: string
          date: string
          id?: string
          status?: string
          student_email?: string | null
          student_id: string
          student_name?: string | null
          unit_id: string
        }
        Update: {
          attendance?: string
          date?: string
          id?: string
          status?: string
          student_email?: string | null
          student_id?: string
          student_name?: string | null
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar: string | null
          date_of_birth: string | null
          email: string
          favorite_unit_id: string | null
          id: string
          name: string
          role: string
          status: string
        }
        Insert: {
          avatar?: string | null
          date_of_birth?: string | null
          email: string
          favorite_unit_id?: string | null
          id: string
          name: string
          role?: string
          status?: string
        }
        Update: {
          avatar?: string | null
          date_of_birth?: string | null
          email?: string
          favorite_unit_id?: string | null
          id?: string
          name?: string
          role?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_favorite_unit_id_fkey"
            columns: ["favorite_unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      schedules: {
        Row: {
          day_of_week: number
          id: string
          unit_id: string
        }
        Insert: {
          day_of_week: number
          id?: string
          unit_id: string
        }
        Update: {
          day_of_week?: number
          id?: string
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedules_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          address: string
          capacity: number
          id: string
          name: string
          photo: string
          price: number
        }
        Insert: {
          address: string
          capacity: number
          id?: string
          name: string
          photo: string
          price: number
        }
        Update: {
          address?: string
          capacity?: number
          id?: string
          name?: string
          photo?: string
          price?: number
        }
        Relationships: []
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
  public: {
    Enums: {},
  },
} as const


// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: bookings
//   id: uuid (not null, default: gen_random_uuid())
//   date: date (not null)
//   unit_id: uuid (not null)
//   student_id: uuid (not null)
//   status: text (not null, default: 'booked'::text)
//   attendance: text (not null, default: 'pending'::text)
//   student_name: text (nullable)
//   student_email: text (nullable)
// Table: profiles
//   id: uuid (not null)
//   name: text (not null)
//   email: text (not null)
//   role: text (not null, default: 'student'::text)
//   status: text (not null, default: 'active'::text)
//   favorite_unit_id: uuid (nullable)
//   avatar: text (nullable)
//   date_of_birth: date (nullable)
// Table: schedules
//   id: uuid (not null, default: gen_random_uuid())
//   unit_id: uuid (not null)
//   day_of_week: integer (not null)
// Table: units
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   address: text (not null)
//   photo: text (not null)
//   capacity: integer (not null)
//   price: numeric (not null)

// --- CONSTRAINTS ---
// Table: bookings
//   PRIMARY KEY bookings_pkey: PRIMARY KEY (id)
//   FOREIGN KEY bookings_student_id_fkey: FOREIGN KEY (student_id) REFERENCES profiles(id) ON DELETE CASCADE
//   FOREIGN KEY bookings_unit_id_fkey: FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE
// Table: profiles
//   FOREIGN KEY profiles_favorite_unit_id_fkey: FOREIGN KEY (favorite_unit_id) REFERENCES units(id) ON DELETE SET NULL
//   FOREIGN KEY profiles_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY profiles_pkey: PRIMARY KEY (id)
// Table: schedules
//   PRIMARY KEY schedules_pkey: PRIMARY KEY (id)
//   FOREIGN KEY schedules_unit_id_fkey: FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE
// Table: units
//   PRIMARY KEY units_pkey: PRIMARY KEY (id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: bookings
//   Policy "insert_bookings" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (student_id = auth.uid())
//   Policy "public_bookings" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "update_bookings" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: ((student_id = auth.uid()) OR (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['teacher'::text, 'admin'::text]))))))
// Table: profiles
//   Policy "public_profiles" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "update_own_profile" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (id = auth.uid())
// Table: schedules
//   Policy "public_schedules" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: units
//   Policy "public_units" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true

// --- DATABASE FUNCTIONS ---
// FUNCTION handle_new_user()
//   CREATE OR REPLACE FUNCTION public.handle_new_user()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     parsed_dob DATE := NULL;
//   BEGIN
//     -- Safely parse the date, if it fails, fallback to NULL
//     BEGIN
//       IF NEW.raw_user_meta_data->>'date_of_birth' IS NOT NULL AND NEW.raw_user_meta_data->>'date_of_birth' != '' THEN
//         parsed_dob := (NEW.raw_user_meta_data->>'date_of_birth')::DATE;
//       END IF;
//     EXCEPTION WHEN OTHERS THEN
//       parsed_dob := NULL;
//     END;
//   
//     INSERT INTO public.profiles (id, name, email, role, status, date_of_birth)
//     VALUES (
//       NEW.id,
//       COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
//       NEW.email,
//       'student',
//       'active',
//       parsed_dob
//     )
//     ON CONFLICT (id) DO NOTHING;
//     
//     RETURN NEW;
//   END;
//   $function$
//   

