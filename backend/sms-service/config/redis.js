// export { createClient } from 'redis';

// const redisClient = createClient({
//     url: process.env.REDIS_URL || 'redis://localhost:6379'
// });

// redisClient.on('error', (err) => console.log('Redis Client Error', err));
// redisClient.on('connect', () => console.log('Redis Client Connected'));

// // Await connection in a real app
// // redisClient.connect().catch(console.error);

// export default redisClient;

// DEMO MODE: Exporting a mock client so your app doesn't crash without Redis
const mockRedisClient = {
    isMock: true,
    setEx: async () => 'OK',
    get: async () => null,
    del: async () => 1,
    incr: async () => 1,
    expire: async () => 1
};

export default mockRedisClient;
