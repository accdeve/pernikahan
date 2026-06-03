import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { handler as woSignupHandler } from "../wo-signup/index.ts";

serve(async (req: Request) => {
  const url = new URL(req.url);
  const path = url.pathname;

  if (path === "/wo-signup") {
    return woSignupHandler(req);
  }

  return new Response(
    JSON.stringify({ error: "Function not found" }),
    { status: 404, headers: { "Content-Type": "application/json" } }
  );
});
