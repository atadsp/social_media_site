var db = require('../database/database');
var bcrypt = require('bcryptjs');
var salt = bcrypt.genSaltSync(12);
var jwt = require('jsonwebtoken');
var Checker = require('password-checker');
var checker = new Checker();
checker.min_length = 14;
checker.requireLetters(true);
checker.requireNumbers(true);
checker.requireSymbols(true);
checker.disallowNames(true);
// checker.disallowWords(true, true);
// checker.disallowPasswords(true, true, 3);

module.exports.createUser = function(req, res) {
	db.query("SELECT * FROM users WHERE username = '" + req.body.username + "' or email = '" + req.body.email + "'")
		.spread(function(result, metadata) {
			console.log(result.length);
			if (result.length < 1) {
				if (checker.check(req.body.user_password)) {
					var password = bcrypt.hashSync(req.body.user_password, salt);
					var currentDate = Date.now();
					var query = "INSERT INTO users (username, user_password, email, last_login_attempt, login_attempts) VALUES ('" + req.body.username + "', '" + password + "', '" + req.body.email + "', " + currentDate + ", 0 )";

					db.query(query).spread(function(results, metadata) {
						res.status(200).send("User Created");
					}).catch(function(err) {
						console.log(err);
						res.status(500).send("User was not created");
					});
				} else {
					checker.check(req.body.user_password);
					var passError = checker.errors;
					var errorArry = [];
					for (var i = 0; i < passError.length; i++) {
						errorString = passError[i].toString();
						errorArry.push(errorString);
					}
					res.status(500).send(errorArry);
				}
			} else {
				res.status(500).send('That username or email address is already in use. Try a diffrent one.');
			}
		});
};

module.exports.login = function(req, res) {
	var submittedPassword = req.body.password;

	var query = "SELECT * FROM users WHERE username = '" + req.body.loginName + "' or email = '" + req.body.loginName + "'";
	db.query(query).spread(function(result, metadata) {
		if (result.length > 0) {
			var userData = result[0];
			var lastLogin = userData.last_login_attempt;
			var currentDate = Date.now();
			var loginAttempts = userData.login_attempts;
			var timeDiffrence = ((currentDate - lastLogin) / 86400000);
			if (((loginAttempts < 10) || (timeDiffrence > 1)) && (lastLogin > 1484900000000)) {
				if ((loginAttempts < 10) && (timeDiffrence > 1)) {
					db.query("UPDATE users SET login_attempts = 1, last_login_attempt = " + currentDate + " WHERE username = '" + userData.username + "'");
				} else {
					db.query("UPDATE users SET login_attempts = login_attempts + 1, last_login_attempt = " + currentDate + " WHERE username = '" + userData.username + "'");
				}
				var isVerified = bcrypt.compareSync(submittedPassword, userData.user_password);
				if (isVerified) {
					delete userData.user_password;
					delete userData.last_login_attempt;
					delete userData.login_attempts;
					db.query("UPDATE users SET login_attempts = 0 WHERE username = '" + userData.username + "'");
					//user authenticated
					var token = jwt.sign(userData, process.env.SECRET, {
						expiresIn: 60 * 60 * 4
					});
					res.json({
						data: userData,
						token: token
					});
				} else {
					res.status(400).send("Incorrect Username/Email and Password Combination.");
				}
			} else if (loginAttempts > 9) {
				res.status(400).send("You attempted to log in too many times, please wait 24 hours before trying again.");
			} else if (lastLogin < 1484900000000) {
				res.status(500).send('Unable to process your request.');
			}
		} else {
			var delay = Math.floor(Math.random() * (1030 - 971 + 1) + 971);
			setTimeout(function() {
				res.status(400).send("Incorrect Username/Email and Password Combination.");
			}, delay);

		}

	}).catch(function(err) {
		res.status(500).send('Unable to process your request.');
	});
};