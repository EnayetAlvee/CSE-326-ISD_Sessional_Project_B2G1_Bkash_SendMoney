// server/controllers/profile.controller.js

import userRepository from '../repositories/user.repository.js';

class ProfileController {

  async getProfile(req, res) {
    try {
      res.status(200).json({ user: req.user });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  async updateProfile(req, res) {
    try {
      // Phone number cannot be changed
      const { full_name, date_of_birth, nid_number, picture_url } = req.body;

      const updates = {};
      if (full_name) updates.full_name = full_name;
      if (date_of_birth) updates.date_of_birth = date_of_birth;
      if (nid_number) updates.nid_number = nid_number;
      if (picture_url) updates.picture_url = picture_url;

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: 'No valid fields to update' });
      }

      const updated = await userRepository.updateProfile(req.user.id, updates);
      res.status(200).json({ message: 'Profile updated', user: updated });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
}

export default new ProfileController();