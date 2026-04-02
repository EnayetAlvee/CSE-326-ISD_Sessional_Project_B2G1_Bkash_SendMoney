// wallet-transaction-service/repositories/wallet_repository.js
//
// Data access layer for wallet records.
// Keeps Supabase queries isolated from service/controller layers.

import { supabaseAdmin } from "../config/supabase.js";

const WALLET_TABLE = "wallets";

const isNotFoundError = (error) => error?.code === "PGRST116";

const getByUserId = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from(WALLET_TABLE)
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    if (isNotFoundError(error)) return null;
    throw error;
  }

  return data;
};

const getByPhone = async (phone) => {
  const { data, error } = await supabaseAdmin
    .from(WALLET_TABLE)
    .select("*")
    .eq("phone", phone)
    .single();

  if (error) {
    if (isNotFoundError(error)) return null;
    throw error;
  }

  return data;
};

const create = async ({ userId, phone, initialBalance = 0 }) => {
  const payload = {
    user_id: userId,
    phone,
    balance: initialBalance,
  };

  const { data, error } = await supabaseAdmin
    .from(WALLET_TABLE)
    .insert(payload)
    .select("*")
    .single();

  if (error) throw error;
  return data;
};

const updateBalanceById = async ({ walletId, nextBalance }) => {
  const { data, error } = await supabaseAdmin
    .from(WALLET_TABLE)
    .update({ balance: nextBalance })
    .eq("id", walletId)
    .select("*")
    .single();

  if (error) throw error;
  return data;
};

const applyDelta = async ({ walletId, deltaAmount }) => {
  const existing = await supabaseAdmin
    .from(WALLET_TABLE)
    .select("id,balance")
    .eq("id", walletId)
    .single();

  if (existing.error) throw existing.error;

  const currentBalance = Number(existing.data?.balance || 0);
  const nextBalance = currentBalance + Number(deltaAmount || 0);

  return updateBalanceById({ walletId, nextBalance });
};

const findOrCreate = async ({ userId, phone, initialBalance = 0 }) => {
  const existingWallet = await getByUserId(userId);
  if (existingWallet) return existingWallet;

  return create({ userId, phone, initialBalance });
};

export default {
  getByUserId,
  getByPhone,
  create,
  findOrCreate,
  updateBalanceById,
  applyDelta,
};
