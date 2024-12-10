import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

passport.use(
  new LocalStrategy(
    { usernameField: 'log-username', passwordField: 'log-password' },
    async (username, password, done) => {
      console.log('LocalStrategy called with username:', username, 'and password:', password ? '[PRESENT]' : '[MISSING]');
      
      if (!username || !password) {
        console.log('Missing credentials');
        return done(null, false, { message: 'Missing credentials' });
      }

      try {
        const user = await prisma.user.findUnique({
          where: { username },
        });

        if (!user) {
          console.log('User not found in database');
          return done(null, false, { message: 'Usuario no encontrado' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
          console.log('Password does not match');
          return done(null, false, { message: 'Contraseña incorrecta' });
        }

        console.log('Authentication successful');
        return done(null, user);
      } catch (err) {
        console.error('Error during authentication:', err);
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  console.log('Serializing user:', user.id);
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  console.log('Deserializing user:', id);
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    done(null, user || false);
  } catch (err) {
    console.error('Error deserializing user:', err);
    done(err, false);
  }
});

export default passport;

