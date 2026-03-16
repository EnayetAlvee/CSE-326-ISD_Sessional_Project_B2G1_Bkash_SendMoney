// server/repositories/wallet.repository.js

/*
  WHAT THIS FILE DOES:
  All DB queries related to the "wallets" table.
  Balance reads and updates happen here.
  The WalletService will call these — never controllers directly.
*/

import { supabase, supabaseAdmin } from '../config/supabase.js';

class WalletRepository {

  // Get the wallet row for a user
  // Returns null if no wallet exists yet
  async getWallet(userId) {
    const { data, error } = await supabaseAdmin
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle(); // maybeSingle = returns null instead of error if no row found

    if (error) throw error;
    return data; // { user_id, balance, created_at } or null
  }

  // Just get the balance number (convenience method)
  async getBalance(userId) {
    const wallet = await this.getWallet(userId);
    return wallet?.balance ?? 0;
  }

  // Create wallet when a new user registers
  async createWallet(userId) {
    const { data, error } = await supabaseAdmin
      .from('wallets')
      .insert({
        user_id: userId,
        balance: 0,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Set a new balance value
  // Always called through the service layer which validates the amount first
  async updateBalance(userId, newBalance) {
    if (newBalance < 0) throw new Error('Balance cannot be negative');

    const { data, error } = await supabaseAdmin
      .from('wallets')
      .update({ balance: newBalance })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export default new WalletRepository();