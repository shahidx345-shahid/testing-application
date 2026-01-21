import express from 'express';
import mongoose from 'mongoose';
import { getRedisClient } from '../config/redis';

const router = express.Router();

// GET /api/health - Comprehensive health check
router.get('/', async (req, res) => {
    try {
        const health = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
            version: '1.0.0',
            services: {
                database: 'unknown',
                redis: 'unknown'
            }
        };

        // Check MongoDB
        try {
            const dbState = mongoose.connection.readyState;
            health.services.database = dbState === 1 ? 'healthy' : 'unhealthy';
        } catch (error) {
            health.services.database = 'unhealthy';
            health.status = 'degraded';
        }

        // Check Redis
        try {
            const redisClient = getRedisClient();
            if (redisClient?.isOpen) {
                await redisClient.ping();
                health.services.redis = 'healthy';
            } else {
                health.services.redis = 'unavailable';
                // Redis is optional, so don't mark as degraded
            }
        } catch (error) {
            health.services.redis = 'unhealthy';
        }

        // Determine overall status
        if (health.services.database !== 'healthy') {
            health.status = 'unhealthy';
        }

        const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;

        res.status(statusCode).json({
            success: health.status !== 'unhealthy',
            data: health
        });
    } catch (error) {
        console.error('Health check error:', error);
        res.status(503).json({
            success: false,
            status: 'unhealthy',
            error: 'Health check failed'
        });
    }
});

// GET /api/health/ready - Kubernetes readiness probe
router.get('/ready', async (req, res) => {
    const dbReady = mongoose.connection.readyState === 1;
    
    if (dbReady) {
        res.status(200).json({ ready: true });
    } else {
        res.status(503).json({ ready: false });
    }
});

// GET /api/health/live - Kubernetes liveness probe
router.get('/live', (req, res) => {
    res.status(200).json({ alive: true });
});

export default router;
