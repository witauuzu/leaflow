const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false // Praktik baik untuk lingkungan Node.js/Backend
  },
  global: {
    fetch: fetch
  },
  // Memberikan WebSocket constructor secara manual
  realtime: {
    transport: ws
  }
});

module.exports = supabase;