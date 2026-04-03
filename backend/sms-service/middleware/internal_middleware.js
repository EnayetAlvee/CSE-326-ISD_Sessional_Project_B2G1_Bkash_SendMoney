import config from '../config/index.js';

export const requireInternalSecret = (req, res, next) => {
    const secret = req.headers['x-internal-secret'];
    
    if (!secret || secret !== config.INTERNAL_SECRET) {
        return res.status(403).json({ error: 'Forbidden: Invalid or missing internal secret.' });
    }

    next();
};
