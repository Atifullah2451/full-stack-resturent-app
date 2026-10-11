/**
 * Firebase Auth ID Token Verification Middleware
 * Extracts and validates Bearer token from HTTP request header.
 */
const { auth } = require('../config/firebaseAdmin');

const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Missing or malformed authorization header (Bearer token required).'
      });
    }

    const idToken = authHeader.split('Bearer ')[1].trim();

    if (!idToken) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Token is empty.'
      });
    }

    // Verify token with Firebase Admin Auth
    const decodedToken = await auth.verifyIdToken(idToken);
    
    // Attach decoded token and user information to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      name: decodedToken.name || '',
      ...decodedToken
    };

    next();
  } catch (error) {
    console.error('Token verification error:', error.code || error.message);

    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        success: false,
        message: 'Authentication token has expired. Please refresh your session.',
        code: 'TOKEN_EXPIRED'
      });
    }

    return res.status(403).json({
      success: false,
      message: 'Invalid or unauthorized token.',
      error: error.message
    });
  }
};

module.exports = {
  verifyFirebaseToken
};
