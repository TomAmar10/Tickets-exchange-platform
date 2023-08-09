import dotenv from "dotenv";
import passport from "passport";
import { UserModel } from "../models/user";
import mongoose from "mongoose";
dotenv.config();

const client_id = process.env.GOOGLE_CLIENT_ID;
const client_secret = process.env.GOOGLE_CLIENT_SECRET;
const callbackURL = process.env.GOOGLE_CALLBACK_URL;

const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// passport.serializeUser((user: IMongoDBUser, done: any) => {
//   return done(null, user._id);
// });

// passport.deserializeUser((id: string, done: any) => {

//   User.findById(id, (err: Error, doc: IMongoDBUser) => {
//     // Whatever we return goes to the client and binds to the req.user property
//     return done(null, doc);
//   })
// })

passport.use(
  new GoogleStrategy(
    {
      clientID: client_id,
      clientSecret: client_secret,
      callbackURL,
      scope: ["profile", "email"],
    },

    async function (accessToken, refreshToken, profile, done) {
      try {
        const randomUser = {
          first_name: profile.name.givenName,
          last_name: profile.name.familyName,
          image: profile.photos[0].value,
          email: profile.emails[0].value,
          password: profile.id,
        };
        const existingUser = await UserModel.findOne({
          password: randomUser.password,
          email: randomUser.email,
        });
        if (existingUser) {
          return done(null, existingUser);
        }
        const newUser = new UserModel({
          ...randomUser,
          _id: new mongoose.Types.ObjectId(),
        });

        await newUser.save().then((user) => {
          return done(null, newUser);
        });
      } catch (error) {
        return done(error);
      }
    }
  )
);
