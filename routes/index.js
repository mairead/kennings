var express = require('express');
var router = express.Router();
var instagram = require('instagram-node-lib');

instagram.set('client_id', 'b0a36a7bba44441fa73993fd09143663');
instagram.set('client_secret', '8d714a8a57e54749a02d028ba0548e93');


function filterThumbnails(data){
	var images = [];

	data.forEach(function(item){
		images.push(item.images.thumbnail.url);
	})
	return images;
}


/* GET home page. */
router.get('/', function(req, res, next) {

	instagram.tags.recent({
	  name: 'Eight17',
	  complete: function(data){
	    console.log(data)
	    var instagrams = filterThumbnails(data);
	    //strip out unwanted data here
	    res.render('index', {instagrams: instagrams});
	  }
	});

  
});

module.exports = router;
