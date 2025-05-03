// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { serve } from "https://deno.land/std/http/server.ts"

console.log("Luma Scraper Function Initialized")

serve(async (req) => {
  const { event_url } = await req.json()

  // Trigger scraper (later we'll call Python or a webhook)
  console.log("Received event URL:", event_url)
  const webhook = "https://luma-scraper.onrender.com/scrape"


  return new Response(JSON.stringify({ ok: true, message: `Received ${event_url}` }), {
    headers: { "Content-Type": "application/json" },
    status: 200
  })
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/scrape-luma' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"event_url":"https://lu.ma/example-event"}'

*/
