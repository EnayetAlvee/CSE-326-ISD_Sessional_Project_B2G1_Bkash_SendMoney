// account-service/repositories/user_repository.js
//
// All direct database operations for the "Profiles" table live here.
// No business logic — pure data access only.
// The service layer calls these methods; controllers never touch this directly.
//
// Table: Profiles
//   id (UUID)        — shared with Supabase Auth user id
//   email
//   full_name
//   phone
//   date_of_birth
//   nid_number
//   is_verified
//   two_fa_enabled
//   picture_url
//   created_at

import { supabaseAdmin } from "../config/supabase.js";

class UserRepository {

  // ─── Read ──────────────────────────────────────────────────────────────────

  /**
   * Find a profile by email address.
   * Used during login and signup duplicate-email check.
   *
   * @param {string} email
   * @returns {object|null}  Profile row, or null if not found
   */
  async findByEmail(email) {
    const { data, error } = await supabaseAdmin
      .from("Profiles")
      .select("*")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // no row found — not an error
      throw error;
    }

    return data;
  }

  /**
   * Find a profile by UUID (primary key).
   * Used by auth_middleware after decoding a JWT to hydrate req.user.
   *
   * @param {string} userId  UUID from the JWT payload
   * @returns {object|null}
   */
  async findById(userId) {
    const { data, error } = await supabaseAdmin
      .from("Profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }

    return data;
  }

  /**
   * Find a profile by phone number.
   * Used during:
   *   • Signup — duplicate phone check
   *   • GET /internal/users/by-phone — called by wallet-service to resolve
   *     a recipient phone number to a userId before a send-money transfer
   *
   * @param {string} phone
   * @returns {object|null}
   */
  async findByPhone(phone) {
    const { data, error } = await supabaseAdmin
      .from("Profiles")
      .select("*")
      .eq("phone", phone.trim())
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }

    return data;
  }

  // ─── Write ─────────────────────────────────────────────────────────────────

  /**
   * Insert a new Profile row immediately after Supabase Auth creates the user.
   * The userId comes from Supabase Auth — both rows share the same UUID so they
   * can always be joined without a foreign key.
   *
   * @param {string}      userId
   * @param {string}      email
   * @param {string|null} fullName
   * @param {string|null} phone
   * @param {string|null} dateOfBirth   ISO date string e.g. "1995-06-15"
   * @param {string|null} nidNumber
   * @returns {object}  The created profile row
   */
  async createProfile(
    userId,
    email,
    fullName = null,
    phone = null,
    dateOfBirth = null,
    nidNumber = null,
  ) {
    const { data, error } = await supabaseAdmin
      .from("Profiles")
      .insert({
        id:            userId,
        email:         email.toLowerCase().trim(),
        full_name:     fullName,
        phone:         phone,
        date_of_birth: dateOfBirth,
        nid_number:    nidNumber,
        is_verified:   false,        // starts unverified — set to true after OTP confirmation
        two_fa_enabled: false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Partially update profile fields.
   * Phone is intentionally excluded from allowed updates —
   * it cannot be changed after registration.
   *
   * @param {string} userId
   * @param {{ full_name?, date_of_birth?, nid_number?, picture_url? }} updates
   * @returns {object}  The updated profile row
   */
  async updateProfile(userId, updates) {
    const { data, error } = await supabaseAdmin
      .from("Profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Mark a user's account as verified after their OTP is confirmed.
   * Called by auth_service once sms-service responds that the OTP was valid.
   *
   * @param {string} userId
   */
  async markVerified(userId) {
    const { error } = await supabaseAdmin
      .from("Profiles")
      .update({ is_verified: true })
      .eq("id", userId);

    if (error) throw error;
  }

}

// Export a singleton — the whole service shares one instance
export default new UserRepository();
