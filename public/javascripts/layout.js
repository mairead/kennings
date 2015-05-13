
var userImgs = document.querySelectorAll('.user-imgs');
imagesLoaded( userImgs, function() {
	var container = document.querySelector('#masonry-layout');
	var msnry = new Masonry( container, {
	  // options
	  columnWidth: 140,
	  itemSelector: '.user-item',
	  gutter: 20
	});
});

document.addEventListener("DOMContentLoaded", function(event) { 
	var itemTitle = document.querySelectorAll('.caption');

	//regex help from Remy
	//https://github.com/remy/twitterlib/blob/master/twitterlib.js#L81
	function addLinks(text){
		text = text.replace(/[a-z]+:\/\/([a-z0-9-_]+\.[a-z0-9-_:~\+#%&\?\/.=]+[^:\.,\)\s*$])/ig, function(m, link) {
      return '<a title="' + m + '" href="' + m + '">' + ((link.length > 36) ? link.substr(0, 35) + '&hellip;' : link) + '</a>';
    })
	 	return text;
	}

	//dodgy foreach hack
	//https://css-tricks.com/snippets/javascript/loop-queryselectorall-matches/
	[].forEach.call(itemTitle, function(v){
		v.innerHTML = addLinks(v.innerHTML);
	});

	//mapz
	function initialize() {
    var mapOptions = {

      center: { lat: 51.5739982, lng: -0.0513886},
      zoom: 15,
      maptypecontrol :false,
      mapTypeId: google.maps.MapTypeId.SATELLITE
    };

    var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
	}
  google.maps.event.addDomListener(window, 'load', initialize);

  var showBtn = document.getElementById('show-route');
  var routeLayer = document.getElementById('route-layer');
  
  var showRoute = true;
  routeLayer.style.opacity = "0.8";

  showBtn.addEventListener("click", toggleRouteLayer, false);

  function toggleRouteLayer(){
	  if(showRoute){
	  	showRoute = false;
	  	routeLayer.style.opacity = "0";
	  	routeLayer.style.zIndex = "-1";
	  	showBtn.innerHTML = "<button>Show route</button>";
	  }else{
	  	routeLayer.style.opacity = "0.8";
	  	routeLayer.style.zIndex = "2";
	  	showRoute = true;
	  	showBtn.innerHTML = "<button>Show map</button>";
	  }
  };

});