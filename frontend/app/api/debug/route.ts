export const dynamic = 'force-dynamic'

export async function GET() {
  const envCheck = {
    DATABASE_URL: !!process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: !!process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || 'NOT SET',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'NOT SET',
    NODE_ENV: process.env.NODE_ENV,
  }

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

  return Response.json({ envCheck, dbStatus })
}
