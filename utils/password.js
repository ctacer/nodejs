
module.exports = function (findUser) {

    "use strict";

    var passport = require('passport');
    var LocalStrategy = require('passport-local').Strategy;

    /**
     * Passport setup
     */
    function findByName(login, fn) {
        findUser({ login : login }, function(users) {
            if(users && users.length){
                fn(null, users[0]);
            } else {
                fn(new Error('User ' + login + ' does not exist'));
            }
        });
    }

    // Passport session setup
    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(user, done) {
        findByName(user.login, function (err, user) {
            if (err) throw err;
            done(err, { 'login' : user.login});
        });
    });

    // Use the LocalStrategy within Passport and additional "is_approved" field
    passport.use(new LocalStrategy({
        usernameField: 'login',
        passwordField: 'password'
    },
    function(userlogin, password, done) {
        process.nextTick(function () {
            findUser({ login : userlogin, password: password }, function(users) {

                if (!users || !users.length) { return done(null, false, { message: 'Unknown user ' + userlogin }); }
                // if (users[0].password != password) { return done(null, false, { message: 'Incorrect password ' }); }
                return done(null, { 'login' : users[0].login });

            });
        });
    }
    ));

    return passport;
};