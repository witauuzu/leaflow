const supabase = require('../config/supabase');

//registrasi Pengguna Baru
exports.register = async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return res.status(400).json({ status: 'fail', message: error.message });
  }

  res.status(201).json({
    status: 'success',
    message: 'Registrasi berhasil!',
    user: data.user,
  });
};

//login Pengguna
exports.login = async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return res.status(400).json({ status: 'fail', message: error.message });
  }

  res.status(200).json({
    status: 'success',
    message: 'Login berhasil!',
    session: data.session,
  });
};