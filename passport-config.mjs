import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import session from 'express-session';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Configurar LocalStrategy
passport.use(
  new LocalStrategy(
    { usernameField: 'email', passwordField: 'password' }, // Campos personalizados
    async (email, password, done) => {
      try {
        // Buscar usuario en la base de datos con Prisma
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          return done(null, false, { message: 'Usuario no encontrado' });
        }

        // Verificar contraseña
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: 'Contraseña incorrecta' });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Serializar y deserializar usuario
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    // Buscar usuario por ID
    const user = await prisma.user.findUnique({
      where: { id },
    });
    done(null, user || false);
  } catch (err) {
    done(err, false);
  }
});

// Configurar sesión con Prisma Session Store

export default passport;
