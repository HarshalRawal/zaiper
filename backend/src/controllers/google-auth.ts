import { Request, Response } from "express";
import { google } from "googleapis";
import jwt from "jsonwebtoken";
import {
  generateSecureStateToken,
  handleTokenExchange,
  getUserInfo,
  validateUserInfo,
  upsertUser,
  createConnectionRecord,
  redirectWithError,
  cleanupSession,
} from "../utils/auth-helper";
interface SessionState {
  token: string;
  expiresAt: Date;
  redirectPath: string;
}
export const googleAuth = async (req: Request, res: Response) => {
  try {
    console.log('[Google Auth] Initializing OAuth flow');
    
    // Validate environment configuration
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_REDIRECT_URI) {
      throw new Error("Missing Google OAuth configuration");
    }

    // Generate and store state
    const state = generateSecureStateToken();

    const redirectPath = req.query.redirect_path?.toString() || '/';
    
    // Configure session
    req.session.oauthState = {
      token: state,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      redirectPath
    };
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/gmail.readonly'
    ];
    
    // Build authorization URL
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      response_type: 'code',
      scope: scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent',
      state: state
    });

    authUrl.search = params.toString();
    console.log('[Google Auth] Redirecting to Google authorization URL');
    res.redirect(authUrl.toString());

  } catch (error) {
    console.error('[Google Auth] Error:', error);
    redirectWithError(res, 'Failed to initiate authentication', 500);
  }
};

  export const googleAuthCallback = async (req: Request, res: Response) => {
  try {
    console.log('[Google Callback] Starting callback processing');
    const { code, state, error: queryError } = req.query;

    // Validate initial parameters
    if (queryError) {
      throw new Error(`Authorization failed: ${queryError}`);
    }

    // Verify session state
    console.log("checking session state");
    const sessionState = req.session.oauthState as SessionState | undefined;
    if (!sessionState || state !== sessionState.token) {
      throw new Error('Invalid session state');
    }
    console.log("session state is valid");
    // Check expiration
    console.log("checking state expiration");
    if (Date.now() > new Date(sessionState.expiresAt).getTime()) {
      throw new Error('Session expired');
    }
    console.log("state expiration is valid");
    // Exchange code for tokens
    console.log("exchanging code for tokens");
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const tokens = await handleTokenExchange(oauth2Client, code as string);
    console.log("tokens exchanged");
    // Get and validate user info
    const userInfo = await getUserInfo(oauth2Client);
    validateUserInfo(userInfo);
    // Upsert user record
    const user = await upsertUser({
      email: userInfo.email!,
      name: userInfo.name,
      picture: userInfo.picture
    });
    // Create connection record
    const connection = await createConnectionRecord({
      userId: user.id,
      tokens,
      metadata: {
        email: userInfo.email!,
        name: userInfo.name,
        picture: userInfo.picture,
        googleId: userInfo.id
      }
    });

    // Finalize flow
    cleanupSession(req);
    console.log('[Google Callback] Redirecting to success URL');
    res.redirect(`${process.env.FRONTEND_URL}?success=true&connectionId=${connection.id}`);
  } catch (error) {
    console.error('[Google Callback] Error:', error);
    cleanupSession(req);
    redirectWithError(res, error instanceof Error ? error.message : 'Authentication failed');
  }
};