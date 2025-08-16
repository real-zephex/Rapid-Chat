"use server";

import { createClient } from "@supabase/supabase-js";

const supabaseInstance = () => {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  );
  return supabase;
};

export default supabaseInstance;
