import express from 'express'
import session from 'express-session'
import passport from './passport-config.mjs'
import { PrismaSessionStore } from '@quixo3/prisma-session-store'
import { PrismaClient } from '@prisma/client'

import registerRoute from './routes/registerRoute.mjs'
import logInRoute from './routes/logInRoute.mjs'
import driveRoute from './routes/driveRoute.mjs'


const app = express()

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', './views');

app.use(
  session({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days // 
    },
    secret: 'my secret',
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(
      new PrismaClient(),
      {
        checkPeriod: 2 * 60 * 1000,  // 2 days // 
        dbRecordIdIsSessionId: true,
        dbRecordIdFunction: undefined,
      }
    )
  })
);


app.use(passport.initialize())
app.use(passport.session())

// ALWAYS BEFORE I RENDER THE VIEWS !!!! // 
app.use((req, res, next) => {
  res.locals.user = req.user || null // user available in all views // 
  next()
})

app.get('/', (req, res) => res.render('landing'))
app.use('/register', registerRoute)
app.use('/log-in', logInRoute)
app.use('/drive', driveRoute)
app.get("/log-out", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err)
    }
    res.redirect("/")
  })
})

app.listen(3000, () => console.log("Server started on port 3000!"))