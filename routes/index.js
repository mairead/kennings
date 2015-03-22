var express = require('express');
var router = express.Router();
var instagram = require('instagram-node-lib');
var Twitter = require('twitter');
require("native-promise-only");

instagram.set('client_id', 'b0a36a7bba44441fa73993fd09143663');
instagram.set('client_secret', '8d714a8a57e54749a02d028ba0548e93');

var client = new Twitter({
  consumer_key: '1o4X2yoGlw4FvEdHCns8Wg5RB',
  consumer_secret: 'h8HYjrUHsBiG7oK7lRgqivhF2Ys9TRUOt0mmQ3LiW3wrM5ACJE',
  access_token_key: '12120512-un7GD6gE0vpCnlTpOLJNYXWVF0et4F9GIpv5iDhwb',
  access_token_secret: 'tkZl2glmZspHoTFjQxiXuC9Iyd1hRAjaswoYSXaQXFtEt'
});

function filterThumbnails(data){
	var images = [];

	data.forEach(function(item){
		images.push(item.images.thumbnail.url);
	})
	return images;
}

function filterTwitterText(tweets){
	var tweetText = [];
	// console.log(tweets)

	tweets.forEach(function(item){
		tweetText.push(item.text);
	})

	return tweetText;
}

var instagramRequest = new Promise(function(resolve,reject){
    instagram.tags.recent({
		  name: 'Eight17',
		  complete: function(data){
		    var instagrams = filterThumbnails(data);
		    resolve(instagrams);
		  }
		});
});

// instagramRequest.then(function(msg){
//     console.log(msg); 
// });

var twitterRequest = new Promise(function(resolve,reject){
	client.get('search/tweets', {'q':'#walthamstow', 'count': '20'}, function(error, tweets, response){
	  if (!error) {
	  	// console.log(tweets);
	  	var tweetText = filterTwitterText(tweets.statuses);
	    resolve(tweetText);
	  }
	});
});

// twitterRequest.then(function(msg){
//     console.log(msg); 
// });


/* GET home page. */
router.get('/', function(req, res, next) {
	var instagrams, tweets;

	Promise.all([instagramRequest, twitterRequest]).then(function(arrayOfResults) {
		console.log(arrayOfResults[1][0]);
	  res.render('index', {data: {instagrams: arrayOfResults[0], tweets: arrayOfResults[1]}});
	});

	
  
});

module.exports = router;
