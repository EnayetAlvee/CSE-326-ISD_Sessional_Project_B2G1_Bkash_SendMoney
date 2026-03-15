// server/repositories/otp.repository.js

import { supabaseAdmin } from '../config/supabase.js'; // ✅ changed

class OtpRepository {

  async create(email, otp, purpose) {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { data, error } = await supabaseAdmin  // ✅ changed
      .from('otps')
      .insert({
        email: email.toLowerCase().trim(),
        otp,
        purpose,
        expires_at: expiresAt,
        used: false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findValid(email, otp, purpose) {
    const now = new Date().toISOString();

    const { data, error } = await supabaseAdmin  // ✅ changed
      .from('otps')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .eq('otp', otp)
      .eq('purpose', purpose)
      .eq('used', false)
      .gt('expires_at', now)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async markUsed(id) {
    const { error } = await supabaseAdmin  // ✅ changed
      .from('otps')
      .update({ used: true })
      .eq('id', id);

    if (error) throw error;
  }
}

export default new OtpRepository();