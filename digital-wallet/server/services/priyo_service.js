// server/services/priyo.service.js

import priyoRepository from '../repositories/priyo_repository.js';
import userRepository from '../repositories/user_repository.js';

const MAX_PRIYO = 5;

class PriyoService {

  async list(userId) {
    const priyo = await priyoRepository.listByUser(userId);
    return { priyo_numbers: priyo };
  }

  async add(userId, phone, label = null) {

    // 1. Find the user by phone
    const targetUser = await userRepository.findByPhone(phone);
    if (!targetUser) {
      throw new Error('No user found with that phone number');
    }

    // 2. Cannot add yourself
    if (targetUser.id === userId) {
      throw new Error('You cannot add yourself as a priyo number');
    }

    // 3. Check limit
    const count = await priyoRepository.countByUser(userId);
    if (count >= MAX_PRIYO) {
      throw new Error('You can only have up to 5 priyo numbers');
    }

    // 4. Check not already added
    const alreadyPriyo = await priyoRepository.isPriyo(userId, targetUser.id);
    if (alreadyPriyo) {
      throw new Error('This number is already in your priyo list');
    }

    // 5. Add it
    await priyoRepository.add(userId, targetUser.id, label);

    return {
      message: 'Priyo number added successfully',
      priyo_user: {
        name: targetUser.full_name,
        phone: targetUser.phone,
        label,
      },
    };
  }

  async remove(userId, phone) {
    const targetUser = await userRepository.findByPhone(phone);
    if (!targetUser) {
      throw new Error('No user found with that phone number');
    }

    const isPriyo = await priyoRepository.isPriyo(userId, targetUser.id);
    if (!isPriyo) {
      throw new Error('This number is not in your priyo list');
    }

    await priyoRepository.remove(userId, targetUser.id);
    return { message: 'Priyo number removed successfully' };
  }

  async updateLabel(userId, phone, label) {
    const targetUser = await userRepository.findByPhone(phone);
    if (!targetUser) {
      throw new Error('No user found with that phone number');
    }

    const isPriyo = await priyoRepository.isPriyo(userId, targetUser.id);
    if (!isPriyo) {
      throw new Error('This number is not in your priyo list');
    }

    await priyoRepository.updateLabel(userId, targetUser.id, label);
    return { message: 'Label updated successfully' };
  }
}

export default new PriyoService();