"use strict";

/*
=========================================================
TOYIN PORTFOLIO
SUPABASE CONFIGURATION
=========================================================

IMPORTANT:
Only use the Supabase PROJECT URL and ANON/PUBLISHABLE KEY
in frontend code.

NEVER put your Supabase service_role key here.
=========================================================
*/

const SUPABASE_URL = "https://mbbcdvqnwwydawtwipas.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_hHvYkE9Pxvepj_DYrJtBwA_bp8HZ_de";

if (
    SUPABASE_URL === "https://mbbcdvqnwwydawtwipas.supabase.co" ||
    SUPABASE_ANON_KEY === "sb_publishable_hHvYkE9Pxvepj_DYrJtBwA_bp8HZ_de"
) {
    console.warn(
        "Supabase is not configured yet. Add your Project URL and Anon/Publishable Key."
    );
}

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);