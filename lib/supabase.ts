import { createClient } from "@supabase/supabase-js";

export type ResponseType = "text" | "audio" | "video";

export type MemoryResponse = {
  id: string;
  name: string;
  prompt: string;
  type: ResponseType;
  content: string;
  created_at: string;
};

export type ResponseInsert = {
  name: string;
  prompt: string;
  type: ResponseType;
  content: string;
};

type Database = {
  public: {
    Tables: {
      responses: {
        Row: MemoryResponse;
        Insert: ResponseInsert;
        Update: Partial<ResponseInsert>;
        Relationships: [];
      };
    };
  };
};

let browserClient: ReturnType<typeof createClient<Database>> | null = null;

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Missing Supabase environment variables.");
  }

  return { url, anonKey };
}

export function createSupabaseBrowserClient() {
  if (browserClient) {
    return browserClient;
  }

  const { url, anonKey } = getSupabaseConfig();
  browserClient = createClient<Database>(url, anonKey);
  return browserClient;
}

export function createSupabaseServerClient() {
  const { url, anonKey } = getSupabaseConfig();
  return createClient<Database>(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function insertResponse(input: ResponseInsert) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await (supabase.from("responses") as any).insert(input);
  return { error: error as { message: string } | null };
}

export async function fetchResponses() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await (supabase.from("responses") as any)
    .select("*")
    .order("created_at", { ascending: true });

  return {
    data: (data ?? []) as MemoryResponse[],
    error: error as { message: string } | null,
  };
}
