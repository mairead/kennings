var express = require('express');
var router = express.Router();
var instagram = require('instagram-node-lib');
//var ig = require('instagram-node').instagram();
var Twitter = require('twitter');
require("native-promise-only");

instagram.set('client_id', 'b0a36a7bba44441fa73993fd09143663');
instagram.set('client_secret', '8d714a8a57e54749a02d028ba0548e93');

instagram.set('redirect_uri', '/');

//ig.use({ client_id: 'b0a36a7bba44441fa73993fd09143663',client_secret: '8d714a8a57e54749a02d028ba0548e93' });

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
	//console.log("b4 hash", text);
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

	
function stripSymbols(text){
	return text.replace("&amp;", "&");
}

function augmentTxt(text){
	text = stripHashtags(text);
	text = stripSymbols(text);
	//text = addLinks(text);
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
	
	tweets.forEach(function(item){
		if (item.entities.media){
			tweetText.push({
				imgUrl: item.entities.media[0].media_url,
				txt: augmentTxt(item.text),
			 	type: 'instagram',
			 	imgSize: randomSize(),
			 	link: item.entities.media[0].url,
			 	user: item.user.screen_name
			});
		}else{
			tweetText.push({
				txt: augmentTxt(item.text),
			 	type: 'tweet',
			 	user: item.user.screen_name
			});

		}
	});
	return tweetText;
}

function getNewContent(res, req){
	var instagramRequest = new Promise(function(resolve,reject){


  // return null;


		// ig.tag_media_recent('eight17', function(err, medias, pagination, remaining, limit) {
		// 	console.log(medias)
		// });
		// ig.tag('eight17', function(err, result, remaining, limit) {
		// 	console.log("results", result)
		// });
    instagram.tags.recent({
		  name: 'eight17',
		  complete: function(data){
		  	// console.log(data);
		    var instagrams = filterThumbnails(data.slice(0,3));
		    resolve(instagrams);
		  }
		});
	});

	var twitterRequest = new Promise(function(resolve,reject){
		client.get('search/tweets', {
			'q':'#eight17',
			'count': '10'
			// 'since_id': 
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

	instagram.oauth.ask_for_access_token({
    request: req,
    response: res,
    redirect: '/', // optional
    complete: function(params, response){
    	console.log("complete?", params)
    	// console.log("oauth complete",params, response);
      params['access_token'];
      console.log("params",params['access_token'])
      // params['user']
      response.writeHead(200, {'Content-Type': 'text/plain'});
      // or some other response ended with
      response.end();
    },
    error: function(errorMessage, errorObject, caller, response){
      // errorMessage is the raised error message
      // errorObject is either the object that caused the issue, or the nearest neighbor
      // caller is the method in which the error occurred
      response.writeHead(406, {'Content-Type': 'text/plain'});
      // or some other response ended with
      response.end();
    }
  });
});




module.exports = router;
