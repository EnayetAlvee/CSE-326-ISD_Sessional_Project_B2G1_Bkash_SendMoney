import otpService from '../services/otp_service.js';

class OtpController {
    /**
     * Request a new OTP
     * POST /internal/otp/request
     */
    async requestOtp(req, res) {
        try {
            const { email, purpose } = req.body;

            if (!email || !purpose) {
                return res.status(400).json({ error: 'Email and purpose are required.' });
            }

            const result = await otpService.requestOtp(email, purpose);
            return res.status(200).json(result);
        } catch (error) {
            console.error('Error requesting OTP:', error);
            return res.status(500).json({ error: 'Internal server error while requesting OTP.' });
        }
    }

    /**
     * Verify an OTP
     * POST /internal/otp/verify
     */
    async verifyOtp(req, res) {
        try {
            const { email, otp, purpose } = req.body;

            if (!email || !otp || !purpose) {
                return res.status(400).json({ error: 'Email, otp, and purpose are required.' });
            }

            const result = await otpService.verifyOtp(email, otp, purpose);
            
            return res.status(200).json(result);
        } catch (error) {
            console.error('Error verifying OTP:', error);
            return res.status(500).json({ error: 'Internal server error while verifying OTP.' });
        }
    }
}

export default new OtpController();
