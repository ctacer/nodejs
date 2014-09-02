
var logger = require(global.config.logger.dist)(module);

/*
 * user log out route
 */
module.exports.logout = function(req, res){
    req.logout();
    res.redirect('/login');
};

/**
 * route for registration og the new user
 */
module.exports.register = function(req, res){
    var newUser = {
        "login" : req.body.login,
        "password" : req.body.password
    };

    global.modules.db.User.save(newUser, function (error) {
        if (error) {
            logger.error(error.message);
            res.redirect('/register');
        }
        else {
            res.redirect('/login');
        }
    });
    
    // res.render('test', { title : 'Test', user: req.user, data: JSON.stringify(req.body) });
    // res.send('ok');
};

/**
 * user log in route
 */
module.exports.login = function(req, res) {

    var callback = function (result) {
        if (result.ok) {
            res.redirect('/lobby');
        }
        else {
            res.redirect('/login');
        }        
    };

    var response = {};
    var loginStatus = false;
    global.modules.passport.authenticate('local', function(err, user, info) {
        if (err) {
            response.err = err;
        }
        if (!user) {
            response.err = { "message" : "no user" };
        }
        req.logIn(user, function(err) {
            if (err) {
                response.err = err;
            }
            else {
                loginStatus = true;
                response.user = user;
            }
            callback({ "ok" : loginStatus , "data" : response });
        });
    })(req, res);
};