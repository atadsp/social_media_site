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


//Post
router.post('/create_post', function(req,res){
	var query = "INSERT INTO posts"
});