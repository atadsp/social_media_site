var express = require('express');
var router = express.Router();
var db = require('../database/database');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({
	extended: true
}));

router.use(function(req, res, next){
	var token = req.headers['auth-token'];
	jwt.verify(token, process.env.SECRET, function(err, decoded){
		if(err){
			res.status(400).send('Invalid Token');
		} else {
			req.user_id = decoded.id;
			next();
		}
	});
});

//get endpoints
router.get('/get_friends', function(req, res) {
	var query = "SELECT friend.friend_id, friend.date_friended, u.username FROM user_friends friend INNER JOIN users u ON(u.id = friend.friend_id) WHERE user_id=" + req.user_id;
	db.query(query).spread(function(result, metadata) {
		res.json({
			data: result
		});
	}).catch(function(err) {
		res.status(500).send(err);
	});
});

router.get('/get_friend_requests', function(req,res){
	console.log(req.user_id);
	var query = "SELECT request.id, request.sender_id, u.username FROM user_friend_requests request INNER JOIN users u ON (u.id = request.sender_id)WHERE request.receiver_id= " + req.user_id + " AND status='pending'";
	db.query(query).spread(function(result, metadata){
		res.json({
			data: result
		});
	}).catch(function(err){
		res.status(500).send("Unable to receive friend requests at this time");
	});
});

router.get('/get_users_by_quantity', function(req, res){
	var query = "SELECT id, username FROM users WHERE id != " + req.user_id;

    db.query(query).spread(function(result, metadata){
        res.json({
            data: result
        });
    }).catch(function(err){
        res.status(500).send("unable to find users. Try again later.");
    });
});

//post endpoints
router.post('/request_friend', function(req, res) {
	var query = "SELECT * FROM user_friend_requests WHERE sender_id = " + req.user_id + " AND receiver_id = " + req.body.receiver_id;

	db.query(query).spread(function(result, metadata) {
		if (result.length === 0) {
			insertRequest();
		}
	}).catch(function(err) {
		res.status(500).send(err);
	});

	function insertRequest() {
		var query = "INSERT INTO user_friend_requests (sender_id, receiver_id, status) VALUES (" + req.user_id + ", " + req.body.receiver_id + ", 'pending')";
		db.query(query).spread(function(result, metadata) {
			res.status(200).send("Friend Request Sent.");
		}).catch(function(err) {
			res.status(500).send(err);
		});
	}
});
router.post("/request_friend_response", function(req, res) {
	console.log(req.body);
	var query = "SELECT * FROM user_friend_requests WHERE ID =" + req.body.request_id;
	var senderId;
	var receiverId;
	db.query(query).spread(function(result, metadata) {
		if (result.length > 0) {
			senderId = result[0].sender_id;
			receiverId = result[0].receiver_id;
			updateRequest();
		} else {
			res.status(400).send('request doesnt exist');
		}
	});

	function updateRequest() {
		var isAccepted = req.body.confirmation === "confirmed";
		var query;
		if (isAccepted) {
			query = "UPDATE user_friend_requests SET status ='confirmed'WHERE id=" + req.body.request_id;
		} else {
			query = "DELETE FROM user_friend_requests WHERE id =" + req.body.request_id;
		}

		db.query(query).spread(function() {
			if (isAccepted) {
				performSenderInserts();
			} else {
				res.status(200).send("Request removed.");
			}
		}).catch(function() {
			res.status(400).send('Unable to process request. Please try again later.');
		});
	}

	function performSenderInserts() {
		var query = "INSERT INTO user_friends (user_id, friend_id, date_friended) VALUES (" + senderId + ", " + receiverId + ", now())";

		db.query(query).spread(function() {
			performReceiverInsert();
		}).catch(function() {
			res.status(500).send('Unable to process request');
		});

		function performReceiverInsert() {
			var query = "INSERT INTO user_friends (user_id, friend_id, date_friended) VALUES (" + receiverId + ", " + senderId + ", now())";

			db.query(query).spread(function() {
				res.status(200).send("User Added!");
			}).catch(function() {
				res.status(500).send('Unable to process request');
			});
		}
	}
});

module.exports = router;