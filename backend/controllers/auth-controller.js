const supabase = require('../config/supabase');
const supabaseAdmin = supabase.supabaseAdmin;

const FRONTEND_URL =
  process.env.FRONTEND_URL || 'http://localhost:5173';

const passwordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{8,}$/;

// Registrasi pengguna baru
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (
      typeof username !== 'string' ||
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !username.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        status: 'fail',
        message: 'Username, email, dan password wajib diisi.',
      });
    }

    if (username.trim().length > 30) {
      return res.status(400).json({
        status: 'fail',
        message: 'Username maksimal 30 karakter.',
      });
    }

    if (!passwordPattern.test(password)) {
      return res.status(400).json({
        status: 'fail',
        message:
          'Password harus memiliki minimal 8 karakter, huruf besar, huruf kecil, angka, dan karakter spesial.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Periksa apakah email sudah terdaftar
    let page = 1;
    let emailExists = false;

    while (true) {
      const { data: usersData, error: usersError } =
        await supabaseAdmin.auth.admin.listUsers({
          page,
          perPage: 1000,
        });

      if (usersError) {
        console.error('Check registered email error:', usersError.message);

        return res.status(500).json({
          status: 'fail',
          message: 'Unable to verify email. Please try again later.',
        });
      }

      emailExists = usersData.users.some(
        (user) => user.email?.toLowerCase() === normalizedEmail
      );

      if (emailExists || usersData.users.length < 1000) {
        break;
      }

      page++;
    }

    if (emailExists) {
      return res.status(409).json({
        status: 'fail',
        code: 'EMAIL_ALREADY_USED',
        message: 'This email is already registered. Please log in or use another email.',
      });
    }

    // Lanjutkan proses registrasi
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        emailRedirectTo: `${FRONTEND_URL}/login?verified=true`,
        data: {
          display_name: username.trim(),
        },
      },
    });

    if (error) {
      const message = error.message || '';

      // Jangan mengasumsikan setiap error berarti email duplikat.
      if (/already registered|already exists|user already/i.test(message)) {
        return res.status(409).json({
          status: 'fail',
          code: 'EMAIL_ALREADY_USED',
          message:
            'Email ini mungkin sudah terdaftar. Coba masuk atau gunakan email lain.',
        });
      }

      return res.status(400).json({
        status: 'fail',
        message: message,
      });
    }

    return res.status(201).json({
      status: 'success',
      message: 'Pendaftaran diterima. Silakan periksa email untuk verifikasi.',
      requiresEmailVerification: !data.session,
    });
  } catch (error) {
    console.error('Register error:', error.message);

    return res.status(500).json({
      status: 'fail',
      message: 'Terjadi kesalahan pada server. Silakan coba lagi.',
    });
  }
};

// Login pengguna
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        status: 'fail',
        code: 'MISSING_CREDENTIALS',
        message: 'Please enter your email and password.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Periksa apakah email terdaftar
    let page = 1;
    let registeredUser = null;

    while (true) {
      const { data: usersData, error: usersError } =
        await supabaseAdmin.auth.admin.listUsers({
          page,
          perPage: 1000,
        });

      if (usersError) {
        console.error('Check registered email error:', usersError.message);

        return res.status(500).json({
          status: 'fail',
          code: 'SERVER_ERROR',
          message: 'Unable to verify account. Please try again later.',
        });
      }

      registeredUser = usersData.users.find(
        (user) => user.email?.toLowerCase() === normalizedEmail
      );

      if (registeredUser || usersData.users.length < 1000) {
        break;
      }

      page++;
    }

    // Email tidak ditemukan
    if (!registeredUser) {
      return res.status(401).json({
        status: 'fail',
        code: 'EMAIL_NOT_REGISTERED',
        message: 'No account found with this email. Please sign up first.',
      });
    }

    // 2. Periksa email dan password menggunakan Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      // Email belum diverifikasi
      if (
        error.code === 'email_not_confirmed' ||
        /email not confirmed/i.test(error.message || '')
      ) {
        return res.status(403).json({
          status: 'fail',
          code: 'EMAIL_NOT_VERIFIED',
          message: 'Please verify your email address before logging in.',
        });
      }

      // Password salah
      if (/invalid login credentials/i.test(error.message || '')) {
        return res.status(401).json({
          status: 'fail',
          code: 'INVALID_PASSWORD',
          message: 'Incorrect password. Please try again.',
        });
      }

      console.error('Login authentication error:', error.message);

      return res.status(400).json({
        status: 'fail',
        code: 'LOGIN_ERROR',
        message: 'Unable to log in. Please try again later.',
      });
    }

    // 3. Pastikan email sudah diverifikasi
    if (!data.user?.email_confirmed_at) {
      return res.status(403).json({
        status: 'fail',
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Please verify your email address before logging in.',
      });
    }

    // 4. Login berhasil
    return res.status(200).json({
      status: 'success',
      message: 'Login successful.',
      user: {
        id: data.user.id,
        email: data.user.email,
        username: data.user.user_metadata?.username || '',
      },
      session: data.session,
    });
  } catch (error) {
    console.error('Login error:', error.message);

    return res.status(500).json({
      status: 'fail',
      code: 'SERVER_ERROR',
      message: 'Something went wrong. Please try again later.',
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please enter your email address.',
      });
    }

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      {
        redirectTo: `${FRONTEND_URL}/reset-password`,
      }
    );

    if (error) {
      console.error('Password reset request error:', error.message);

      return res.status(400).json({
        status: 'fail',
        message: 'Unable to process your request. Please try again later.',
      });
    }

    return res.status(200).json({
      status: 'success',
      message:
        'If an account exists for this email, you will receive a password reset link shortly.',
    });
  } catch (error) {
    console.error('Forgot password error:', error.message);

    return res.status(500).json({
      status: 'fail',
      message: 'Something went wrong. Please try again later.',
    });
  }
};