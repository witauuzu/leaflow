const { createClient } = require('@supabase/supabase-js')
const supabase = require('../config/supabase')
const ws = require('ws')

const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'fail',
        message: 'Authentication required.',
      })
    }

    const token = authHeader.split(' ')[1]

    // Verifikasi access token
    const { data, error } = await supabase.auth.getUser(token)

    if (error || !data.user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid or expired session.',
      })
    }

    // Simpan informasi user
    req.user = data.user

    // Buat Supabase client khusus untuk user ini
    req.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
        global: {
          fetch: fetch,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        realtime: {
          transport: ws,
        },
      }
    )

    next()
  } catch (error) {
    console.error('Authentication middleware error:', error.message)

    return res.status(500).json({
      status: 'fail',
      message: 'Authentication failed.',
    })
  }
}

module.exports = authenticateUser