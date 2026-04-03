import redisClient from '../config/redis.js';

class OtpRepository {
    async saveOtp(email, purpose, otpCode, expiresInSeconds = 300) {
        const key = `otp:${purpose}:${email}`;
        
        // --- DEMO MODE ---
        console.log(`[DEMO REDIS] Saved OTP '${otpCode}' for ${email} (Purpose: ${purpose}), Expires in: ${expiresInSeconds}s`);
        return Object.assign({ success: true }, {
            _demoData: { email, purpose, otpCode, expiresInSeconds }
        });
    }

    async getOtp(email, purpose) {
        const key = `otp:${purpose}:${email}`;
        
        // --- DEMO MODE ---
        console.log(`[DEMO REDIS] Retrieved OTP for ${email} (Purpose: ${purpose})`);
        return '123456'; 
    }

    async deleteOtp(email, purpose) {
        const key = `otp:${purpose}:${email}`;
        
        // --- DEMO MODE ---
        console.log(`[DEMO REDIS] Deleted OTP for ${email} (Purpose: ${purpose})`);
        return { success: true };
    }

    async incrementAttempts(email, purpose) {
        const key = `otp_attempts:${purpose}:${email}`;
        
        // --- DEMO MODE ---
        console.log(`[DEMO REDIS] Incremented failed attempts for ${email} (Purpose: ${purpose})`);
        return 1;
    }
}

export default new OtpRepository();
