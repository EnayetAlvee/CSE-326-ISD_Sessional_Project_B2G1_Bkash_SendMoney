// server/repositories/priyo.repository.js

/*
  WHAT THIS FILE DOES:
  All DB queries for the "priyo_numbers" table.
  Add, remove, list priyo contacts.
*/

import { supabaseAdmin } from '../config/supabase.js';

class PriyoRepository {

  // Get all priyo numbers for a user (max 5 allowed — enforced in service)
  async listByUser(userId) {
    const { data, error } = await supabaseAdmin
      .from('priyo_numbers')
      .select(`
        priyo_user_id,
        created_at,
        Profiles:priyo_user_id ( id, full_name, email, phone )
      `)
      // This joins Profiles table so we get the priyo contact's name/email too
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }

 // ✅ updated — now accepts label
  async add(userId, priyoUserId, label = null) {
    const { data, error } = await supabaseAdmin
      .from('priyo_numbers')
      .insert({
        user_id: userId,
        priyo_user_id: priyoUserId,
        label,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Remove a priyo number
  async remove(userId, priyoUserId) {
    const { error } = await supabaseAdmin
      .from('priyo_numbers')
      .delete()
      .eq('user_id', userId)
      .eq('priyo_user_id', priyoUserId);

    if (error) throw error;
    return true;
  }

  // Check if a specific user is already in someone's priyo list
  // Returns true/false — used during send money charge calculation
  async isPriyo(userId, priyoUserId) {
    const { data, error } = await supabaseAdmin
      .from('priyo_numbers')
      .select('priyo_user_id')
      .eq('user_id', userId)
      .eq('priyo_user_id', priyoUserId)
      .maybeSingle();

    if (error) throw error;
    return data !== null; // true if row exists
  }

  // Count how many priyo numbers a user currently has
  // Used to enforce the 5-number limit
  async countByUser(userId) {
    const { count, error } = await supabaseAdmin
      .from('priyo_numbers')
      .select('*', { count: 'exact', head: true }) // head:true means don't return rows, just count
      .eq('user_id', userId);

    if (error) throw error;
    return count;
  }
   // ✅ new method
  async updateLabel(userId, priyoUserId, label) {
    const { error } = await supabaseAdmin
      .from('priyo_numbers')
      .update({ label })
      .eq('user_id', userId)
      .eq('priyo_user_id', priyoUserId);

    if (error) throw error;
  }
}

export default new PriyoRepository();