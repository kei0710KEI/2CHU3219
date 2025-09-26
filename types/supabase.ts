// /types/supabase.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type RegionKey = 'JP' | 'US' | 'EU';

export interface Database {
  public: {
    Tables: {
      // レイテンシ実験用（RLSなし）
      records_bench: {
        Row: {
          id: string;
          content: string | null;
          region: RegionKey | null;
          created_at: string; // timestamptz -> ISO文字列で扱う
        };
        Insert: {
          id?: string;
          content?: string | null;
          region?: RegionKey | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          content?: string | null;
          region?: RegionKey | null;
          created_at?: string;
        };
        Relationships: [];
      };
      // RLSデモ用（RLSあり）
      records_rls: {
        Row: {
          id: string;
          content: string | null;
          country: RegionKey; // 'JP' | 'US' | 'EU'
          created_at: string;
        };
        Insert: {
          id?: string;
          content?: string | null;
          country: RegionKey;
          created_at?: string;
        };
        Update: {
          id?: string;
          content?: string | null;
          country?: RegionKey;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}
