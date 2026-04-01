// account-service/repositories/priyo_repository.js
//
// All direct database operations for the "priyo_numbers" table live here.
// No business logic — pure data access only.
// The service layer calls these methods; controllers never touch this directly.
//
// "Priyo" = favourite contacts (bKash terminology).
// A user can have up to 5 priyo numbers — that limit is enforced in the service layer.
//
// Table: priyo_numbers
//   user_id       (UUID) — the owner of the list
//   priyo_user_id (UUID) — the contact being favourited
//   label         (text) — optional nickname e.g. "Mom", "Office"
//   created_at

import { supabaseAdmin } from "../config/supabase.js";

class PriyoRepository {

  // ─── Read ──────────────────────────────────────────────────────────────────

  /**
   * Get all priyo entries for a user, joined with each contact's profile data.
   * Ordered oldest-first so the list order is stable across requests.
   *
   * @param {string} userId
   * @returns {Array<{ priyo_user_id, label, created_at, Profiles: { id, full_name, email, phone } }>}
   */
  async listByUser(userId) {
    const { data, error } = await supabaseAdmin
      .from("priyo_numbers")
      .select(`
        priyo_user_id,
        label,
        created_at,
        Profiles:priyo_user_id ( id, full_name, email, phone )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data;
  }

  /**
   * Check whether targetUserId is in userId's priyo list.
   *
   * Used in two places:
   *   1. priyo_service.add()            — prevent duplicate adds
   *   2. priyo_service.remove()         — confirm entry exists before deleting
   *   3. GET /internal/priyo/check      — called by wallet-service to decide
   *                                       whether a send-money charge applies
   *
   * @param {string} userId        The owner of the priyo list
   * @param {string} targetUserId  The contact being checked
   * @returns {boolean}
   */
  async isPriyo(userId, targetUserId) {
    const { data, error } = await supabaseAdmin
      .from("priyo_numbers")
      .select("priyo_user_id")
      .eq("user_id", userId)
      .eq("priyo_user_id", targetUserId)
      .maybeSingle(); // returns null (not an error) when no row exists

    if (error) throw error;
    return data !== null;
  }

  /**
   * Count how many priyo entries a user currently has.
   * Used before inserting to enforce the 5-contact limit.
   *
   * @param {string} userId
   * @returns {number}
   */
  async countByUser(userId) {
    const { count, error } = await supabaseAdmin
      .from("priyo_numbers")
      .select("*", { count: "exact", head: true }) // head: true — skip returning rows, just count
      .eq("user_id", userId);

    if (error) throw error;
    return count ?? 0;
  }

  // ─── Write ─────────────────────────────────────────────────────────────────

  /**
   * Insert a new priyo entry.
   *
   * @param {string}      userId        The user adding the contact
   * @param {string}      priyoUserId   The contact's user ID
   * @param {string|null} label         Optional nickname
   * @returns {object}  The inserted row
   */
  async add(userId, priyoUserId, label = null) {
    const { data, error } = await supabaseAdmin
      .from("priyo_numbers")
      .insert({
        user_id:       userId,
        priyo_user_id: priyoUserId,
        label,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete a priyo entry.
   *
   * @param {string} userId
   * @param {string} priyoUserId
   */
  async remove(userId, priyoUserId) {
    const { error } = await supabaseAdmin
      .from("priyo_numbers")
      .delete()
      .eq("user_id", userId)
      .eq("priyo_user_id", priyoUserId);

    if (error) throw error;
  }

  /**
   * Update the label (nickname) for an existing priyo entry.
   * Pass null to clear the label.
   *
   * @param {string}      userId
   * @param {string}      priyoUserId
   * @param {string|null} label
   */
  async updateLabel(userId, priyoUserId, label) {
    const { error } = await supabaseAdmin
      .from("priyo_numbers")
      .update({ label })
      .eq("user_id", userId)
      .eq("priyo_user_id", priyoUserId);

    if (error) throw error;
  }

}

// Export a singleton — the whole service shares one instance
export default new PriyoRepository();
