import {Express, Request} from "express";
import {UserModel, User} from "../model/user.model";
import {debugLog} from "../log/logger";
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.serializeUser((profile: User, done: (error: any, user_id: number) => void) => {
    debugLog("serializeUser: profile: ", profile);
    done(null, profile.id!);
});

passport.deserializeUser(async (user_id: number, done: (error: any, user: User | null) => void) => {
    debugLog("deserializeUser: id: ", user_id);
    const user: User | null = await UserModel.findOne({id: user_id});
    if (user === null) {
        console.log(`Can't find user with id: ${user_id}`);
        done("Can't deserialize user from id", null);
    } else {
        debugLog("                 user: ", user);
        done(null, user);
    }
});

async function configPassport(app: Express) {
    app.use(passport.initialize());
    app.use(passport.session());
    passport.use(
        new GoogleStrategy(
            {
                callbackURL: '/auth/google/callback',
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                clientID: process.env.GOOGLE_CLIENT_ID,
                passReqToCallback: true,
            },
            async (req: Request,
                   accessToken: string,
                   refreshToken: string,
                   profile: any,
                   done: (error: any, user: User | null) => void) => {
                debugLog("Access token: ", accessToken);
                debugLog("Refresh token: ", refreshToken);
                console.log("Profile: ", profile);
                if ("_json" in profile) {
                    const email: string = profile["_json"]?.email;
                    const name: string = profile["_json"]?.name;
                    const avatar: string = profile["_json"]?.picture;
                    let user: User | null = await UserModel.findOne({email});
                    if (user === null) {
                        user = new User({email, name, avatar});
                        await UserModel.save(user);
                    }
                    done(null, user);
                } else {
                    console.log(`Can't parse profile: ${profile}`);
                    done("Unexpected google profile format.", null);
                }
            },
        ),
    );
}

export {
    configPassport
};

