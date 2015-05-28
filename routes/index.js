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

function randomSize(){
	return Math.round(Math.random() *10) >5 ? 'small': 'large';
}

function stripHashtags(text){
	text = text.replace(/(^|[^&\w'"]+)\#([a-zA-Z0-9_^"^<]+)/g, '');
 	return text;
}

//regex help from Remy
//https://github.com/remy/twitterlib/blob/master/twitterlib.js#L81
function addLinks(text){
	text = text.replace(/[a-z]+:\/\/([a-z0-9-_]+\.[a-z0-9-_:~\+#%&\?\/.=]+[^:\.,\)\s*$])/ig, function(m, link) {
    return '<a title="' + m + '" href="' + m + '">' + ((link.length > 36) ? link.substr(0, 35) + '&hellip;' : link) + '</a>';
  })
 	return text;
}

function stripLinks(text){
	text = text.replace(/[a-z]+:\/\/([a-z0-9-_]+\.[a-z0-9-_:~\+#%&\?\/.=]+[^:\.,\)\s*$])/ig, function(m, link) {
          return '';
        })
 	return text;
}
	
function stripSymbols(text){
	return text.replace("&amp;", "&");
}

function augmentTxt(text){
	text = stripHashtags(text);
	text = stripSymbols(text);
	return text;
}

function reduceTxt(text){
	text = stripHashtags(text);
	text = stripSymbols(text);
	text = stripLinks(text);
	return text;
}


//regex help from Remy
//https://github.com/remy/twitterlib/blob/master/twitterlib.js#L81
function improveLinks(tweet){
	var text = tweet.text,
  i = 0;
  if (tweet.entities) {
    // replace urls with expanded urls and let the ify shorten the link
    if (tweet.entities.urls && tweet.entities.urls.length) {
      for (i = 0; i < tweet.entities.urls.length; i++) {
        if (tweet.entities.urls[i].expanded_url) text = text.replace(tweet.entities.urls[i].url, tweet.entities.urls[i].expanded_url); // /g ?
      }
    }

    // replace media with url to actual image (or thing?)
    if (tweet.entities.media && tweet.entities.media.length) {
      for (i = 0; i < tweet.entities.media.length; i++) {
        if (tweet.entities.media[i].media_url || tweet.entities.media[i].expanded_url) text = text.replace(tweet.entities.media[i].url, tweet.entities.media[i].media_url ? tweet.entities.media[i].media_url : tweet.entities.media[i].expanded_url); // /g ?
      }
    }

  }
  return text;
}


function filterThumbnails(data){
	var instagrams = [];
	data.forEach(function(item){
		instagrams.push({
			imgUrl:item.images.low_resolution.url, 
			txt: augmentTxt(item.caption.text), 
			type: 'instagram', 
			imgSize: randomSize(),
			link: item.link,
			user: item.caption.from.username
		});
	});
	return instagrams;
}

function filterTwitterText(tweets){
	var tweetText = [];
	var updatedText;
	tweets.forEach(function(item){
		if (item.entities.media){
			tweetText.push({
				imgUrl: item.entities.media[0].media_url,
				txt: reduceTxt(item.text),
			 	type: 'instagram',
			 	imgSize: randomSize(),
			 	link: item.entities.media[0].url,
			 	user: item.user.screen_name
			});
		}else{
			updatedText = improveLinks(item);
			tweetText.push({
				txt: augmentTxt(updatedText),
			 	type: 'tweet',
			 	user: item.user.screen_name
			});
		}
	});
	return tweetText;
}

function getNewContent(res, req){
	var instagramRequest = new Promise(function(resolve,reject){
    instagram.tags.recent({
		  name: 'eight17',
		  complete: function(data){
		    var instagrams = filterThumbnails(data.slice(0,8));
		    resolve(instagrams);
		  }
		});
	});

	var twitterRequest = new Promise(function(resolve,reject){
		client.get('search/tweets', {
			'q':'#eight17',
			'count': '10'
			}, function(error, tweets, response){
		  if (!error) {
		  	var tweetText = filterTwitterText(tweets.statuses);
		    resolve(tweetText);
		  }
		});
	});

	Promise.all([instagramRequest, twitterRequest]).then(function(arrayOfResults) {
		var contentFeed = randomiseContent(arrayOfResults);
	  res.render('index', {data: {instagrams: arrayOfResults[0], tweets: arrayOfResults[1], random: contentFeed}});
	});
}

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
	getNewContent(res, req);
});

module.exports = router;
