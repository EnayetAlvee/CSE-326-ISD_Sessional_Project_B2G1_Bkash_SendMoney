// server/repositories/transaction.repository.js

/*
  WHAT THIS FILE DOES:
  All DB queries for the "transactions" table.
  Recording transactions and reading history live here.
*/

import { supabase, supabaseAdmin } from '../config/supabase.js';

class TransactionRepository {

  // Save a completed transaction to the DB
  // type must be 'send money' or 'add money' (enforced by DB constraint)
  async create({ fromUserId, toUserId, amount, charge, type }) {
    const { data, error } = await supabaseAdmin
      .from('transactions')
      .insert({
        from_user_id: fromUserId,  // null when type = 'add money'
        to_user_id: toUserId,
        amount,
        charge,
        type,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Get all transactions where the user was sender OR receiver
  // Ordered newest first
  async getHistoryByUser(userId) {
    const { data, error } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Get total amount sent TO a specific user by a sender in the current month
  // Used to calculate whether priyo free limit (25000 BDT) is exceeded
  async getMonthlySentToUser(fromUserId, toUserId) {
    const now = new Date();

    // First day of this month at midnight
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const { data, error } = await supabaseAdmin
      .from('transactions')
      .select('amount')
      .eq('from_user_id', fromUserId)
      .eq('to_user_id', toUserId)
      .eq('type', 'send money')
      .gte('created_at', startOfMonth); // gte = greater than or equal

    if (error) throw error;

    // Add up all amounts from the returned rows
    const total = (data || []).reduce((sum, tx) => sum + Number(tx.amount), 0);
    return total;
  }
}

export default new TransactionRepository();