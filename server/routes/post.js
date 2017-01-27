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


//GET
router.get('/get_posts', function(req, res){
	var query = "SELECT DISTINCT post.id, u.username, post.post_content, post.date_posted FROM  users u INNER JOIN user_friends friend ON (u.id = friend.friend_id) INNER JOIN user_posts post ON (post.user_id = friend.friend_id) WHERE friend.user_id =" + req.user_id + " OR u.id =" + req.user_id + " ORDER BY post.id DESC";
    db.query(query).spread(function(result, metadata){
        res.json({
            data: result
        });
    }).catch(function(err){
		res.status(500).send("unable to display posts");
	});
});

//Post
router.post('/create_post', function(req,res){
	var query = "INSERT INTO user_posts (user_id, post_content, date_posted) VALUES (" + req.user_id + ", '" + req.body.content + "', now())"; 

	db.query(query).spread(function(){
		res.status(200).send("User Status Updated");
	}).catch(function(err){
		res.status(500).send(err);
	});
});

module.exports = router;