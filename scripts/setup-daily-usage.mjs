import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDailyUsage() {
  try {
    // Create table
    const { error: tableError } = await supabase.rpc("query", {
      query: `
        CREATE TABLE IF NOT EXISTS daily_usage (
          user_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          date      DATE NOT NULL DEFAULT CURRENT_DATE,
          questions_attempted INTEGER NOT NULL DEFAULT 0,
          ai_chats_used       INTEGER NOT NULL DEFAULT 0,
          PRIMARY KEY (user_id, date)
        );
      `,
    });

    if (tableError) console.log("Table creation:", tableError);

    // Enable RLS
    const { error: rlsError } = await supabase.rpc("query", {
      query: "ALTER TABLE daily_usage ENABLE ROW LEVEL SECURITY;",
    });

    if (rlsError) console.log("RLS enable:", rlsError);

    // Create policies
    const policies = [
      `DROP POLICY IF EXISTS "Users can read own usage" ON daily_usage;
       CREATE POLICY "Users can read own usage"
         ON daily_usage FOR SELECT
         USING (auth.uid() = user_id);`,
      `DROP POLICY IF EXISTS "Service role full access" ON daily_usage;
       CREATE POLICY "Service role full access"
         ON daily_usage FOR ALL
         USING (true);`,
    ];

    for (const policy of policies) {
      const { error: policyError } = await supabase.rpc("query", {
        query: policy,
      });
      if (policyError) console.log("Policy error:", policyError);
    }

    // Create RPC function
    const { error: rpcError } = await supabase.rpc("query", {
      query: `
        CREATE OR REPLACE FUNCTION increment_daily_usage(
          p_user_id UUID,
          p_date    DATE,
          p_field   TEXT
        )
        RETURNS VOID
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          IF p_field = 'questions_attempted' THEN
            INSERT INTO daily_usage (user_id, date, questions_attempted, ai_chats_used)
              VALUES (p_user_id, p_date, 1, 0)
            ON CONFLICT (user_id, date)
              DO UPDATE SET questions_attempted = daily_usage.questions_attempted + 1;
          ELSIF p_field = 'ai_chats_used' THEN
            INSERT INTO daily_usage (user_id, date, questions_attempted, ai_chats_used)
              VALUES (p_user_id, p_date, 0, 1)
            ON CONFLICT (user_id, date)
              DO UPDATE SET ai_chats_used = daily_usage.ai_chats_used + 1;
          END IF;
        END;
        $$;
      `,
    });

    if (rpcError) console.log("RPC error:", rpcError);
    else console.log("Daily usage setup complete!");
  } catch (error) {
    console.error("Setup error:", error);
  }
}

setupDailyUsage();
