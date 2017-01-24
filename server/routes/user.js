var express = require('express');
var router = express.Router();
var db = require('../database/database');
var bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({
	extended: true
}));

router.post('/request_friend', function(req, res) {
	var query = "SELECT * FROM user_friend_requests WHERE sender_id = " + req.body.sender_id + " AND receiver_id = " + req.body.receiver_id;

	db.query(query).spread(function(result, metadata) {
		if (result.length === 0) {
			insertRequest();
		}
	}).catch(function(err) {
		res.status(500).send(err);
	});

	function insertRequest() {
		var query = "INSERT INTO user_friend_requests (sender_id, receiver_id, status) VALUES (" + req.body.sender_id + ", " + req.body.receiver_id + ", 'pending')";
		db.query(query).spread(function(result, metadata) {
			res.status(200).send("Friend Request Sent.");
		}).catch(function(err) {
			res.status(500).send(err);
		});
	}
});
router.post("/request_friend_response", function(req, res) {
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

	function updateRequest(){
		var isAccepted = req.body.confirmation === "confirmed";
		var query;
		if(isAccepted){
			query = "UPDATE user_friend_requests SET status ='confirmed'WHERE id=" + req.body.request_id;
		} else {
			query = "DELETE FROM user_friend_requests WHERE id =" + req.body.request_id;
		}
		
		db.query(query).spread(function(){
			if(isAccepted){
				performSenderInserts();
			} else {
				res.status(200).send("Request removed.");
			}
		}).catch(function(){
			res.status(400).send('Unable to process request. Please try again later.');
		});
	}
	function performSenderInserts (){
		var query = "INSERT INTO user_friends (user_id, friend_id, date_friended) VALUES (" + senderId + ", " + receiverId + ", now())";

		db.query(query).spread(function(){
			performReceiverInsert();
		}).catch(function(){
			res.status(500).send('Unable to process request');
		});

	function performReceiverInsert (){
		var query = "INSERT INTO user_friends (user_id, friend_id, date_friended) VALUES (" + receiverId + ", " + senderId + ", now())";

		db.query(query).spread(function(){
			res.status(200).send("User Added!");
		}).catch(function(){
			res.status(500).send('Unable to process request');
		});
	}
	}
});

module.exports = router;