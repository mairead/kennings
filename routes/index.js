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
	var instagrams = [];
	data.forEach(function(item){
		var randomSize = Math.round(Math.random() *10) >5 ? 'small': 'large';
		instagrams.push({
			imgUrl:item.images.low_resolution.url, 
			txt:item.caption.text, 
			type: 'instagram', 
			imgSize: randomSize,
			link: item.link,
			user: item.caption.from.username
		});
	});
	return instagrams;
}

function filterTwitterText(tweets){
	var tweetText = [];
	
	tweets.forEach(function(item){
		tweetText.push({
			txt:item.text,
			 type: 'tweet',
			 user: item.user.screen_name
			});
	});
	return tweetText;
}

var instagramRequest = new Promise(function(resolve,reject){
    instagram.tags.recent({
		  name: 'eight17',
		  complete: function(data){

		    var instagrams = filterThumbnails(data.slice(0,3));
		    resolve(instagrams);
		  }
		});
});

var twitterRequest = new Promise(function(resolve,reject){
	client.get('search/tweets', {'q':'#eight17', 'count': '10'}, function(error, tweets, response){
		// console.log(error, tweets, response);
	  if (!error) {
	  	// console.log("TWEETS", tweets);
	  	var tweetText = filterTwitterText(tweets.statuses);
	    resolve(tweetText);
	  }
	});
});

//https://github.com/coolaj86/knuth-shuffle
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}


function randomiseContent(arrayOfResults){
	var fullContent = [];
	fullContent = arrayOfResults[0].concat(arrayOfResults[1]);
	shuffle(fullContent);
	return fullContent;
}

/* GET home page. */
router.get('/', function(req, res, next) {
	var instagrams, tweets;

	Promise.all([instagramRequest, twitterRequest]).then(function(arrayOfResults) {
		var contentFeed = randomiseContent(arrayOfResults);
		//console.log(contentFeed);
	  res.render('index', {data: {instagrams: arrayOfResults[0], tweets: arrayOfResults[1], random: contentFeed}});
	});
  
});

module.exports = router;
