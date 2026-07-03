export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          first_name: string | null;
          age: number | null;
          height_inches: number | null;
          current_weight_lbs: number | null;
          goal_weight_lbs: number | null;
          primary_goal: string | null;
          activity_level: string | null;
          work_style: string | null;
          dietary_preference: string | null;
          foods_to_avoid: string | null;
          calorie_target: number | null;
          protein_target: number | null;
          sms_consent: boolean;
          phone_number: string | null;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & { user_id: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      subscriptions: {
        Row: {
          user_id: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          status: string;
          price_id: string | null;
          current_period_end: string | null;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["subscriptions"]["Row"]> & { user_id: string };
        Update: Partial<Database["public"]["Tables"]["subscriptions"]["Row"]>;
        Relationships: [];
      };
      meals: {
        Row: {
          id: string;
          user_id: string;
          image_path: string;
          thumbnail_path: string | null;
          context: string | null;
          analysis: Json;
          meal_name: string;
          calorie_min: number;
          calorie_max: number;
          protein_grams: number;
          meal_score: number;
          confidence: string;
          duration_ms: number | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["meals"]["Row"]> & { user_id: string; image_path: string; analysis: Json; meal_name: string; calorie_min: number; calorie_max: number; protein_grams: number; meal_score: number; confidence: string };
        Update: Partial<Database["public"]["Tables"]["meals"]["Row"]>;
        Relationships: [];
      };
      weight_entries: {
        Row: { id: string; user_id: string; weight_lbs: number; note: string | null; logged_at: string; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["weight_entries"]["Row"]> & { user_id: string; weight_lbs: number };
        Update: Partial<Database["public"]["Tables"]["weight_entries"]["Row"]>;
        Relationships: [];
      };
      coach_messages: {
        Row: { id: string; user_id: string; role: string; content: string; meal_id: string | null; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["coach_messages"]["Row"]> & { user_id: string; role: string; content: string };
        Update: Partial<Database["public"]["Tables"]["coach_messages"]["Row"]>;
        Relationships: [];
      };
      app_events: {
        Row: { id: string; user_id: string | null; event_name: string; metadata: Json; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["app_events"]["Row"]> & { event_name: string };
        Update: Partial<Database["public"]["Tables"]["app_events"]["Row"]>;
        Relationships: [];
      };
      waitlist_entries: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone_number: string | null;
          primary_goal: string | null;
          interest_level: string | null;
          source: string | null;
          referral: string | null;
          tried_free_scan: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["waitlist_entries"]["Row"]> & { name: string; email: string };
        Update: Partial<Database["public"]["Tables"]["waitlist_entries"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
