import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

// Import routes
import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import dashboardRoutes from './routes/dashboard.routes';
import walletRoutes from './routes/wallet.routes';
import groupsRoutes from './routes/groups.routes';
import referralsRoutes from './routes/referrals.routes';
import save2740Routes from './routes/save2740.routes';
import saverPocketsRoutes from './routes/saver-pockets.routes';
import paymentsRoutes from './routes/payments.routes';
import paymentMethodsRoutes from './routes/payment-methods.routes';
import notificationsRoutes from './routes/notifications.routes';
import feesRoutes from './routes/fees.routes';
import kycRoutes from './routes/kyc.routes';
import supportRoutes from './routes/support.routes';
import supportChatRoutes from './routes/support-chat.routes';
import accountRoutes from './routes/account.routes';
import dailySavingsRoutes from './routes/daily-savings.routes';
import quoteOfDayRoutes from './routes/quote-of-day.routes';
import healthRoutes from './routes/health.routes';
import webhooksRoutes from './routes/webhooks.routes';
import bankingRoutes from './routes/banking.routes';

// Middleware
import { errorHandler } from './middleware/error-handler';
import {
    requestId,
    securityHeaders,
    xssProtection,
    preventInjection,
    sanitizeBodyMiddleware,
    auditLog
} from './middleware/security';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';

const app: Application = express();

// Request ID for tracking
app.use(requestId);

// Security middleware
app.use(helmet());
app.use(securityHeaders);
app.use(xssProtection);
app.use(hpp()); // Prevent HTTP Parameter Pollution
app.use(cookieParser()); // Parse cookies

// CORS configuration - UPDATED FOR VERCEL
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'https://save-2740-frrontend.vercel.app',
    // Add your Vercel frontend domain here
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security: Input sanitization and injection prevention
app.use(sanitizeBodyMiddleware);
app.use(preventInjection);

// Audit logging for sensitive operations
app.use(auditLog);

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Rate limiting - ADJUSTED FOR SERVERLESS
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'development' ? 5000 : 100, // limit each IP to 100 requests per windowMs (5000 in dev)
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/', limiter);

// Health check
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root route - API Documentation
app.get('/', (req: Request, res: Response) => {
    res.json({
        name: "Save2740 API",
        status: "operational",
        version: "1.0.0",
        base_url: "/api",
        endpoints: {
            auth: "POST /api/auth/{signup,login,me,verify-email,resend-verification,forgot/reset-password}",
            profile: "GET/PUT /api/profile (PUT /avatar)",
            dashboard: "GET /api/dashboard/{overview,stats,breakdown}",
            wallet: "GET /api/wallet (also POST deposit/withdraw, GET transactions)",
            groups: "GET /api/groups (also POST create/join/leave)",
            referrals: "GET /api/referrals/stats",
            save2740: "GET /api/save2740/status (POST join/contribute)",
            saver_pockets: "GET/POST /api/saver-pockets (PUT/DELETE /:id)",
            payments: "GET /api/payments (POST /intent)",
            payment_methods: "GET/POST /api/payment-methods (DELETE /:id)",
            notifications: "GET /api/notifications (PUT /:id/read)",
            fees: "GET /api/fees",
            kyc: "GET /api/kyc/status (POST /submit)",
            support: "POST /api/support",
            support_chat: "GET /api/support-chat/history (POST message)",
            account: "DELETE /api/account",
            daily_savings: "GET/POST /api/daily-savings",
            quote_of_day: "GET /api/quote-of-day",
            banking: "GET /api/banking",
            webhooks: "POST /api/webhooks/stripe",
            health: "GET /api/health"
        }
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/groups', groupsRoutes);
app.use('/api/referrals', referralsRoutes);
app.use('/api/save2740', save2740Routes);
app.use('/api/saver-pockets', saverPocketsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/payment-methods', paymentMethodsRoutes);
app.use('/api/payments/methods', paymentMethodsRoutes); // Alias for frontend compatibility
app.use('/api/notifications', notificationsRoutes);
app.use('/api/fees', feesRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/support-chat', supportChatRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/user', accountRoutes); // Alias for account routes (delete-account)
app.use('/api/daily-savings', dailySavingsRoutes);
app.use('/api/quote-of-day', quoteOfDayRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/webhooks', webhooksRoutes);
app.use('/api/banking', bankingRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

// Error handling middleware
app.use(errorHandler);

// VERCEL SERVERLESS EXPORT
// This is crucial for Vercel deployment
export default app;
