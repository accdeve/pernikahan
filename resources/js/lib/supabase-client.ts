import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables')
}

// Custom fetch proxy to intercept database queries and apply Redis caching
const customFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const urlStr = typeof input === 'string' ? input : input.toString()
  const method = init?.method || 'GET'

  const targetTables = ['invitations', 'stories', 'galleries', 'cust_metadata']
  const matchedTable = targetTables.find(table => urlStr.includes(`/rest/v1/${table}`))

  const cacheEndpoint = `${supabaseUrl}/functions/v1/redis-cache`

  if (matchedTable && method === 'GET') {
    const cacheKey = `cache:${matchedTable}:${urlStr.split('/rest/v1/')[1] || urlStr}`

    try {
      const cacheCheckRes = await fetch(cacheEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify({
          action: 'get',
          key: cacheKey
        })
      })

      if (cacheCheckRes.ok) {
        const { data } = await cacheCheckRes.json()
        if (data) {
          console.log(`[Redis Cache Hit] key: ${cacheKey}`)
          return new Response(data, {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Content-Range': '0-0/1'
            }
          })
        }
      }
    } catch (err) {
      console.warn('Redis Cache Get Error, falling back to database:', err)
    }

    console.log(`[Redis Cache Miss] Fetching from DB for key: ${cacheKey}`)
    const originalResponse = await fetch(input, init)
    
    if (originalResponse.ok) {
      const responseClone = originalResponse.clone()
      try {
        const dataText = await responseClone.text()
        fetch(cacheEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseAnonKey,
          },
          body: JSON.stringify({
            action: 'set',
            key: cacheKey,
            value: dataText,
            expiry: 300 // Cache for 5 minutes
          })
        }).catch(err => console.error('Failed to set Redis cache:', err))
      } catch (err) {
        console.error('Failed to clone response for caching:', err)
      }
    }
    
    return originalResponse
  }

  if (matchedTable && ['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
    const originalResponse = await fetch(input, init)

    if (originalResponse.ok) {
      const invalidatePattern = `cache:${matchedTable}:*`
      console.log(`[Redis Cache Invalidation] Invalidating pattern: ${invalidatePattern}`)
      fetch(cacheEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify({
          action: 'invalidate',
          pattern: invalidatePattern
        })
      }).catch(err => console.error('Failed to invalidate Redis cache:', err))
    }

    return originalResponse
  }

  return fetch(input, init)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: customFetch
  }
})

if (typeof window !== 'undefined') {
  (window as any).supabase = supabase
}

