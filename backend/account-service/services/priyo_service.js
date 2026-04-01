// account-service/services/priyo_service.js
//
// Business logic for managing a user's favourite contacts ("priyo numbers").
// Controllers call these methods — they never touch the DB directly.
//
// Rules enforced here (not in the DB, not in the controller):
//   • Max 5 priyo contacts per user
//   • A user cannot add themselves
//   • No duplicate entries in the same list
//   • Target phone must belong to a registered account

import priyoRepository from "../repositories/priyo_repository.js";
import userRepository  from "../repositories/user_repository.js";

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_PRIYO = 5;

class PriyoService {

  // ─── List ──────────────────────────────────────────────────────────────────

  /**
   * Return all priyo contacts for the authenticated user,
   * with each contact's profile data (name, phone, email) joined in.
   *
   * @param {string} userId
   * @returns {{ priyo_numbers: Array }}
   */
  async list(userId) {
    const priyo = await priyoRepository.listByUser(userId);
    return { priyo_numbers: priyo };
  }

  // ─── Add ───────────────────────────────────────────────────────────────────

  /**
   * Add a new priyo contact by phone number.
   *
   * Guards (checked in this order):
   *   1. Phone must resolve to a registered user
   *   2. Cannot add yourself
   *   3. Cannot exceed MAX_PRIYO contacts
   *   4. Cannot add a duplicate
   *
   * @param {string}      userId  The authenticated user adding the contact
   * @param {string}      phone   Phone number of the contact to add
   * @param {string|null} label   Optional nickname e.g. "Mom", "Office"
   * @returns {{ message: string, priyo_user: object }}
   */
  async add(userId, phone, label = null) {

    // ── 1. Resolve phone to a registered user ─────────────────────────────
    const targetUser = await userRepository.findByPhone(phone);
    if (!targetUser) {
      throw new Error("No registered user found with that phone number.");
    }

    // ── 2. Cannot add yourself ────────────────────────────────────────────
    if (targetUser.id === userId) {
      throw new Error("You cannot add yourself as a priyo number.");
    }

    // ── 3. Enforce the 5-contact limit ────────────────────────────────────
    const count = await priyoRepository.countByUser(userId);
    if (count >= MAX_PRIYO) {
      throw new Error(`You can have at most ${MAX_PRIYO} priyo numbers.`);
    }

    // ── 4. No duplicates ──────────────────────────────────────────────────
    const alreadyAdded = await priyoRepository.isPriyo(userId, targetUser.id);
    if (alreadyAdded) {
      throw new Error("This number is already in your priyo list.");
    }

    // ── 5. Insert ─────────────────────────────────────────────────────────
    await priyoRepository.add(userId, targetUser.id, label);

    return {
      message: "Priyo number added successfully.",
      priyo_user: {
        id:        targetUser.id,
        full_name: targetUser.full_name,
        phone:     targetUser.phone,
        label:     label ?? null,
      },
    };
  }

  // ─── Remove ────────────────────────────────────────────────────────────────

  /**
   * Remove a priyo contact by phone number.
   *
   * @param {string} userId
   * @param {string} phone
   * @returns {{ message: string }}
   */
  async remove(userId, phone) {

    // ── 1. Resolve phone to a registered user ─────────────────────────────
    const targetUser = await userRepository.findByPhone(phone);
    if (!targetUser) {
      throw new Error("No registered user found with that phone number.");
    }

    // ── 2. Confirm the contact is actually in the priyo list ──────────────
    const isPriyo = await priyoRepository.isPriyo(userId, targetUser.id);
    if (!isPriyo) {
      throw new Error("This number is not in your priyo list.");
    }

    // ── 3. Remove ─────────────────────────────────────────────────────────
    await priyoRepository.remove(userId, targetUser.id);

    return { message: "Priyo number removed successfully." };
  }

  // ─── Update Label ──────────────────────────────────────────────────────────

  /**
   * Update (or clear) the nickname label for an existing priyo contact.
   *
   * @param {string}      userId
   * @param {string}      phone
   * @param {string|null} label  Pass null to clear the label
   * @returns {{ message: string }}
   */
  async updateLabel(userId, phone, label) {

    // ── 1. Resolve phone to a registered user ─────────────────────────────
    const targetUser = await userRepository.findByPhone(phone);
    if (!targetUser) {
      throw new Error("No registered user found with that phone number.");
    }

    // ── 2. Confirm the contact is in the priyo list ───────────────────────
    const isPriyo = await priyoRepository.isPriyo(userId, targetUser.id);
    if (!isPriyo) {
      throw new Error("This number is not in your priyo list.");
    }

    // ── 3. Update ─────────────────────────────────────────────────────────
    await priyoRepository.updateLabel(userId, targetUser.id, label);

    return { message: "Label updated successfully." };
  }

}

// Export a singleton — the whole service shares one instance
export default new PriyoService();
