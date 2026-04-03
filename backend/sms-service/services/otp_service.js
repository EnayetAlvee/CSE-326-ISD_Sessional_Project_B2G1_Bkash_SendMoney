import otpRepository from '../repositories/otp_repository.js';

class OtpService {
    async requestOtp(email, purpose) {
        const otpCode = '123456';
        const expiresInSeconds = 300; 

        await otpRepository.saveOtp(email, purpose, otpCode, expiresInSeconds);

        console.log('\n======================================================');
        console.log(`✉️  [SMS/EMAIL SERVICE] Simulated Message Sending`);
        console.log(`To      : ${email}`);
        console.log(`Purpose : ${purpose}`);
        console.log(`Code    : ${otpCode}`);
        console.log(`Expires : ${expiresInSeconds / 60} minutes`);
        console.log('======================================================\n');

        return {
            success: true,
            message: `OTP sent successfully to ${email}`
        };
    }

    async verifyOtp(email, otp, purpose) {
        const storedOtp = await otpRepository.getOtp(email, purpose);

        if (!storedOtp) {
            return {
                valid: false,
                reason: 'OTP expired or not found. Please request a new one.'
            };
        }

        if (storedOtp !== otp) {
            await otpRepository.incrementAttempts(email, purpose);
            return {
                valid: false,
                reason: 'Invalid OTP code provided.'
            };
        }

        await otpRepository.deleteOtp(email, purpose);
        console.log(`[SMS/EMAIL SERVICE] Successfully verified OTP for ${email} (Purpose: ${purpose})`);

        return { valid: true };
    }
}

export default new OtpService();
