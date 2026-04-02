// wallet-transaction-service/repositories/transaction_repository.js
//
// Data access layer for transaction records.

import { supabaseAdmin } from "../config/supabase.js";

const TRANSACTION_TABLE = "transactions";

const create = async ({
  senderWalletId,
  receiverWalletId,
  amount,
  charge = 0,
  type = "send_money",
  status = "completed",
  idempotencyKey = null,
  metadata = null,
}) => {
  const payload = {
    sender_wallet_id: senderWalletId,
    receiver_wallet_id: receiverWalletId,
    amount,
    charge,
    txn_type: type,
    status,
    idempotency_key: idempotencyKey,
    metadata,
  };

  const { data, error } = await supabaseAdmin
    .from(TRANSACTION_TABLE)
    .insert(payload)
    .select("*")
    .single();

  if (error) throw error;
  return data;
};

const listByWalletId = async ({ walletId, limit = 20, offset = 0 }) => {
  const { data, error } = await supabaseAdmin
    .from(TRANSACTION_TABLE)
    .select("*")
    .or(`sender_wallet_id.eq.${walletId},receiver_wallet_id.eq.${walletId}`)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data || [];
};

const findByIdempotencyKey = async (idempotencyKey) => {
  if (!idempotencyKey) return null;

  const { data, error } = await supabaseAdmin
    .from(TRANSACTION_TABLE)
    .select("*")
    .eq("idempotency_key", idempotencyKey)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return data;
};

export default {
  create,
  listByWalletId,
  findByIdempotencyKey,
};
