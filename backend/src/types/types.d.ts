import 'express-session';

declare module 'express-session' {
    interface SessionData {
        oauthState: {
            token: string;
            expiresAt: Date;
            redirectPath: string;
        };
    }
}