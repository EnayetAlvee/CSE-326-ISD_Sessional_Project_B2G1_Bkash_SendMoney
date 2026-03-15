// server/repositories/user.repository.js

/*
  WHAT THIS FILE DOES:
  All direct database queries related to "Profiles" table live here.
  No business logic here — just raw DB operations.
  The Service layer will call these methods.
*/

import { supabase, supabaseAdmin } from '../config/supabase.js';

class UserRepository {

  // Find a profile row by email
  // Used during login to check if user exists
  async findByEmail(email) {
    const { data, error } = await supabaseAdmin
      .from('Profiles')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // no row found = normal, not a crash
      throw error;
    }

    return data;
  }

  // Find a profile by their UUID (id)
  // Used after login to get full profile
  async findById(userId) {
    const { data, error } = await supabaseAdmin
      .from('Profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  }

  // Create a new Profile row after Supabase Auth creates the auth.users row
  // userId comes from Supabase Auth (they share the same UUID)
 //  UPDATED — added date_of_birth, nid_number
  async createProfile(userId, email, fullName = null, phone = null, dateOfBirth = null, nidNumber = null) {
    const { data, error } = await supabaseAdmin
      .from('Profiles')
      .insert({
        id: userId,
        email: email.toLowerCase().trim(),
        full_name: fullName,
        phone,
        date_of_birth: dateOfBirth,
        nid_number: nidNumber,
        is_verified: false,         // starts unverified
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }


  // Update profile fields (phone, full_name etc.)
  async updateProfile(userId, updates) {
    const { data, error } = await supabaseAdmin
      .from('Profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }


  // NEW — called after OTP verified to mark account active
  async markVerified(userId) {
    const { error } = await supabaseAdmin
      .from('Profiles')
      .update({ is_verified: true })
      .eq('id', userId);

    if (error) throw error;
  }

  //  NEW — find user by phone number (needed for send money)
  async findByPhone(phone) {
    const { data, error } = await supabaseAdmin
      .from('Profiles')
      .select('*')
      .eq('phone', phone.trim())
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

}

// Export a single instance — so the whole app shares one object
export default new UserRepository();