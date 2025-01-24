import { google, Auth } from 'googleapis';
import { prisma } from '../db/index';
import { Request, Response } from 'express';
import crypto from 'crypto';

export interface GoogleUserInfo {
  email?: string;
  name?: string;
  picture?: string;
  id?: string;
}

export interface ConnectionParams {
  userId: string;
  tokens: any;
  metadata: {
    email: string;
    name?: string;
    picture?: string;
    googleId?: string;
  };
}

// Generate cryptographically secure state token
export const generateSecureStateToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// Handle OAuth token exchange
export const handleTokenExchange = async (oauth2Client: Auth.OAuth2Client, code: string) => {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    
    if (!tokens.access_token) {
      throw new Error('No access token received');
    }

    oauth2Client.setCredentials(tokens);
    return tokens;
  } catch (error) {
    console.error('[Token Exchange] Failed:', error);
    throw new Error('Failed to exchange authorization code');
  }
};

// Fetch user info from Google
export const getUserInfo = async (oauth2Client: Auth.OAuth2Client): Promise<GoogleUserInfo> => {
  try {
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();
     // Transform data to match GoogleUserInfo type
    return {
      email: data.email || undefined,
      name: data.name || undefined,
      picture: data.picture || undefined,
      id: data.id || undefined
    };
  } catch (error) {
    console.error('[User Info] Fetch failed:', error);
    throw new Error('Failed to retrieve user information');
  }
};

// Validate user information
export const validateUserInfo = (userInfo: GoogleUserInfo): void => {
  if (!userInfo?.email) {
    throw new Error('Google did not provide required user information');
  }
};

// Upsert user in database
export const upsertUser = async (userData: {
  email: string;
  name?: string;
  picture?: string;
}) => {
  const user = await prisma.user.findUnique({ where: { email: userData.email } });
  if (!user) {
    return await prisma.user.create({ data: { email: userData.email, name: userData.name, avatar: userData.picture, authMethod: 'GOOGLE', verified: true } });
  }
  return user;
};

// Create connection record
export const createConnectionRecord = async (params: ConnectionParams) => {
  try {
    return await prisma.connection.create({
      data: {
        user: { connect: { id: params.userId } },
        app: { connect: { name: 'Gmail' } },
        accessToken: encrypt(params.tokens.access_token),
        refreshToken: params.tokens.refresh_token ? encrypt(params.tokens.refresh_token) : null,
        expiresAt: new Date(params.tokens.expiry_date || Date.now() + 3600 * 1000),
        scopes: params.tokens.scope?.split(' ') || [],
        metadata: params.metadata
      }
    });
  } catch (error) {
    console.error('[Database] Connection creation failed:', error);
    throw new Error('Failed to create connection record');
  }
};

// Encryption helper (implement proper encryption in production)
export const encrypt = (text: string): string => {
  // Implement AES-256-GCM encryption here
  return Buffer.from(text).toString('base64');
};

// Error redirection helper
export const redirectWithError = (res: Response, message: string, statusCode: number = 400) => {
  const url = `${process.env.FRONTEND_URL}/auth/error?message=${encodeURIComponent(message)}`;
  statusCode === 500 ? res.status(500).json({ error: message }) : res.redirect(url);
};

// Session cleanup helper
export const cleanupSession = (req: Request) => {
  if (req.session?.oauthState) {
    delete req.session.oauthState;
  }
};