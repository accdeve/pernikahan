import { connect } from "https://deno.land/x/redis@v0.29.0/mod.ts";

const redisHost = Deno.env.get('REDIS_HOST') || 'redis';
const redisPort = parseInt(Deno.env.get('REDIS_PORT') || '6379', 10);

let redisClient: any = null;

async function getRedis() {
  if (!redisClient) {
    try {
      redisClient = await connect({
        hostname: redisHost,
        port: redisPort,
      });
    } catch (e) {
      console.error("Failed to connect to Redis, retrying...", e);
      // Wait and try again
      await new Promise(resolve => setTimeout(resolve, 1000));
      redisClient = await connect({
        hostname: redisHost,
        port: redisPort,
      });
    }
  }
  return redisClient;
}

export async function handler(req: Request): Promise<Response> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, key, value, expiry = 300, pattern } = await req.json();
    const redis = await getRedis();

    if (action === 'get') {
      const cachedValue = await redis.get(key);
      return new Response(JSON.stringify({ data: cachedValue }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'set') {
      await redis.set(key, value, { ex: expiry });
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'invalidate') {
      if (pattern) {
        const keys = await redis.keys(pattern);
        if (keys && keys.length > 0) {
          await redis.del(...keys);
        }
        return new Response(JSON.stringify({ success: true, invalidated: keys }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else if (key) {
        await redis.del(key);
        return new Response(JSON.stringify({ success: true, invalidated: [key] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    // If Redis connection dies, log it and try to reset client for next call
    console.error("Redis operation error:", err);
    redisClient = null;
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
