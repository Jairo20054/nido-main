const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const AuthService = require('../services/authService');

// Configuración de Passport para autenticación OAuth
// Serializar usuario para la sesión
passport.serializeUser((user, done) => {
  // Guardar solo el ID del usuario en la sesión
  done(null, user._id);
});

// Deserializar usuario desde la sesión
passport.deserializeUser(async (id, done) => {
  try {
    // Buscar usuario por ID (esto normalmente se haría con un servicio)
    const User = require('../models/User');
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Estrategia de autenticación con Google OAuth 2.0 (solo si está configurado)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'https://super-yodel-4jg6pgx4pqwwh554v-3000.app.github.dev/api/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Extraer información del perfil de Google
      const oauthData = {
        provider: 'google',
        providerId: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName
      };

      // Encontrar o crear usuario
      const user = await AuthService.findOrCreateOAuthUser(oauthData);
      done(null, user);
    } catch (error) {
      console.error('Error en estrategia Google:', error);
      done(error, null);
    }
  }));
}

// Estrategia de autenticación con Facebook OAuth (solo si está configurado)
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL || 'https://super-yodel-4jg6pgx4pqwwh554v-3000.app.github.dev/api/auth/facebook/callback',
    profileFields: ['id', 'emails', 'name'] // Campos que queremos obtener
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Extraer información del perfil de Facebook
      const oauthData = {
        provider: 'facebook',
        providerId: profile.id,
        email: profile.emails[0].value,
        name: `${profile.name.givenName} ${profile.name.familyName}`
      };

      // Encontrar o crear usuario
      const user = await AuthService.findOrCreateOAuthUser(oauthData);
      done(null, user);
    } catch (error) {
      console.error('Error en estrategia Facebook:', error);
      done(error, null);
    }
  }));
}

module.exports = passport;
