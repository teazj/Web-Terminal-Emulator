var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var passport	  = require('passport');
var config      = require('./config/database');
var User        = require('./app/models/user');
var port 	      = process.env.PORT || 8080;
var jwt 			  = require('jwt-simple');
var router = express.Router();       

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(morgan('dev'));
app.use(passport.initialize());

mongoose.connect(config.database);
require('./config/passport')(passport);

router.use(function(req, res, next) {
    console.log('Something is happening.' + req);
    next(); 
});

router.route('/signup')
    .post(function (req, res) {
        if (!req.body.name || !req.body.password) {
            res.json({succes: false, msg: 'Please pass name and password.'});
        } else {
            var newUser = new User({
                name: req.body.name,
                password: req.body.password
            });
            newUser.save(function(err) {
                if (err) {
                    res.json({succes: false, msg: 'Username already exists.'});
                } else {
                    res.json({succes: true, msg: 'Successful created user!'});
                }
            });
        }
    });

router.route('/authenticate')
    .post(function (req, res) {
        User.findOne({
            name: req.body.name
        }, function(err, user) {
            if (err) throw err;

            if (!user) {
                res.send({success: false, msg: 'Authentication failed. User not found.'});
            } else {
                user.comparePassword(req.body.password, function(err, isMatch) {
                    if (isMatch && !err) {
                        var token = jwt.encode(user, config.secret);
                        res.json({success: true, token: 'JWT ' + token});
                    } else {
                        res.send({success: false, msg: 'Authentication failed. Wrong password.'});
                    }
                });
            }
        });
    });

router.route('/memberinfo')
    .get(passport.authenticate('jwt', {session: false}), function (req, res) {
        var token = getToken(req.headers);
        if (token) {
            var decoded = jwt.decode(token, config.secret);
            User.findOne({
                name: decoded.name
            }, function(err, user) {
                if (err) throw err;

                if (!user) {
                    return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
                } else {
                    return res.json({success: true, msg: 'Welcome in the member area ' + user.name + '!'});
                }
            });
        } else {
            return res.status(403).send({success: false, msg: 'No token provided.'});
        }
    });

router.route('/commands')
    .post(passport.authenticate('jwt', {session: false}), function(req, res) {
        var token = getToken(req.headers);
        if (token) {
            var decoded = jwt.decode(token, config.secret);
            User.findOne({
                name: decoded.name
            }, function(err, user) {
                if (err) throw err;

                if (!user) {
                    return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
                } else {
                    user.commands.push({command: req.body.command, currenttime: req.body.currenttime});

                    user.save(function(err) {
                        if (err)
                            res.send(err);
                        return res.json({ message: 'Command logged' });
                    });
                }
            });
        } else {
            return res.status(403).send({success: false, msg: 'No token provided.'});
        }
        
    })
    .get(passport.authenticate('jwt', {session: false}), function(req, res) {
        var token = getToken(req.headers);
        if (token) {
            var decoded = jwt.decode(token, config.secret);
            User.findOne({
                name: decoded.name
            }, function(err, user) {
                if (err) throw err;

                if (!user) {
                    return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
                } else {
                    return res.json(user.commands);
                }
            });
        } else {
            return res.status(403).send({success: false, msg: 'No token provided.'});
        }
    });

router.route('/validcommands')
  .get(passport.authenticate('jwt', {session: false}), function(req, res) {
      var token = getToken(req.headers);
      if (token) {
          var decoded = jwt.decode(token, config.secret);
          User.findOne({
              name: decoded.name
          }, function(err, user) {
              if (err) throw err;

              if (!user) {
                  return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
              } else {
                  return res.json("<ul style=\"list-style-type: none; font-family: 'Inconsolata', monospace;\"><li>ls</li><li>cd</li><li>Chess</li></ul>")
              }
          });
      } else {
          return res.status(403).send({success: false, msg: 'No token provided.'});
      }
  });

getToken = function(headers) {
    if (headers && headers.authorization) {
        var parted = headers.authorization.split(' ');
        if (parted.length === 2) {
            return parted[1];
        } else {
            return null;
        }
    } else {
        return null;
    }
};

app.use('/api', router);

app.listen(port);
console.log('Server started on port: ' + port);