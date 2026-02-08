export const dynamic = 'force-dynamic'

import { auth } from '@/lib/auth'
import { headers, cookies } from 'next/headers'

export async function GET(request: Request) {
  const envCheck = {
    DATABASE_URL: !!process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: !!process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || 'NOT SET',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'NOT SET',
    NODE_ENV: process.env.NODE_ENV,
  }

  // Check cookies from request
  const cookieHeader = request.headers.get('cookie') || 'NONE'
  const cookieNames = cookieHeader !== 'NONE'
    ? cookieHeader.split(';').map(c => c.trim().split('=')[0])
    : []

  // Test DB connection
  let dbStatus = 'not tested'
  try {
    const { Pool } = await import('@neondatabase/serverless')
    const pool = new Pool({ connectionString: process.env.DATABASE_URL })
    const result = await pool.query('SELECT 1 as ok')
    dbStatus = result.rows[0]?.ok === 1 ? 'connected' : 'unexpected result'
    await pool.end()
  } catch (e) {
    dbStatus = `error: ${String(e)}`
  }

  // Test auth.api.getSession
  let sessionResult = 'not tested'
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })
    sessionResult = session ? JSON.stringify({ userId: session.user?.id, email: session.user?.email }) : 'null (no session)'
  } catch (e) {
    sessionResult = `error: ${String(e)}`
  }

  // Clean JWKS if requested
  let jwksClean = 'not requested'
  const url = new URL(request.url)
  if (url.searchParams.get('cleanJwks') === 'true') {
    try {
      const { Pool } = await import('@neondatabase/serverless')
      const pool = new Pool({ connectionString: process.env.DATABASE_URL })
      const result = await pool.query("DELETE FROM \"jwks\" WHERE 1=1 RETURNING id")
      jwksClean = `deleted ${result.rowCount} rows`
      await pool.end()
    } catch (e) {
      jwksClean = `error: ${String(e)}`
    }
  }

  return Response.json({ envCheck, dbStatus, cookieNames, sessionResult, jwksClean })
}
