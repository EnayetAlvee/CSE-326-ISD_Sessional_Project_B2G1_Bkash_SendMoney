// server/services/sendmoney.service.js

import walletRepository from '../repositories/wallet_repository.js';
import transactionRepository from '../repositories/transaction_repository.js';
import priyoRepository from '../repositories/priyo_repository.js';
import userRepository from '../repositories/user_repository.js';

const PRIYO_FREE_LIMIT = 25000;   // free up to 25,000 BDT/month for priyo
const CHARGE_AMOUNT = 5;          // 5 BDT charge
const FREE_THRESHOLD = 50;        // under 50 BDT is always free

class SendMoneyService {

  async sendMoney(fromUserId, toPhone, amount) {

    // 1. Validate amount
    amount = Number(amount);
    if (isNaN(amount) || amount <= 0) {
      throw new Error('Amount must be a positive number');
    }

    // 2. Find recipient by phone number
    const recipient = await userRepository.findByPhone(toPhone);
    if (!recipient) {
      throw new Error('No user found with that phone number');
    }

    // 3. Cannot send money to yourself
    if (recipient.id === fromUserId) {
      throw new Error('You cannot send money to yourself');
    }

    // 4. Calculate charge
    const charge = await this.calculateCharge(fromUserId, recipient.id, amount);

    // 5. Check sender has enough balance
    const senderBalance = await walletRepository.getBalance(fromUserId);
    const totalDeduction = amount + charge;

    if (senderBalance < totalDeduction) {
      throw new Error(
        `Insufficient balance. You need ${totalDeduction} BDT (${amount} + ${charge} charge) but have ${senderBalance} BDT`
      );
    }

    // 6. Deduct from sender
    const newSenderBalance = senderBalance - totalDeduction;
    await walletRepository.updateBalance(fromUserId, newSenderBalance);

    // 7. Add to recipient
    const recipientBalance = await walletRepository.getBalance(recipient.id);
    const newRecipientBalance = recipientBalance + amount;
    await walletRepository.updateBalance(recipient.id, newRecipientBalance);

    // 8. Record transaction
    await transactionRepository.create({
      fromUserId,
      toUserId: recipient.id,
      amount,
      charge,
      type: 'send money',
    });

    return {
      message: 'Money sent successfully',
      sent_to: recipient.full_name,
      amount,
      charge,
      total_deducted: totalDeduction,
      your_new_balance: newSenderBalance,
    };
  }

  // Charge calculation logic
  async calculateCharge(fromUserId, toUserId, amount) {

    // Rule 1 — always free under 50 BDT
    if (amount < FREE_THRESHOLD) {
      return 0;
    }

    // Rule 2 — check if recipient is a priyo number
    const isPriyo = await priyoRepository.isPriyo(fromUserId, toUserId);

    if (isPriyo) {
      // Rule 3 — priyo: free up to 25,000 BDT/month, then 5 BDT charge
      const monthlyTotal = await transactionRepository.getMonthlySentToUser(
        fromUserId,
        toUserId
      );

      if (monthlyTotal < PRIYO_FREE_LIMIT) {
        return 0; // still within free limit
      } else {
        return CHARGE_AMOUNT; // exceeded 25,000 BDT this month
      }
    }

    // Rule 4 — non-priyo always charged 5 BDT
    return CHARGE_AMOUNT;
  }
}

export default new SendMoneyService();