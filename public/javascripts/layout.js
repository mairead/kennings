
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
	console.log(itemTitle);
	function addLinks(text){
		console.log("b4 link", text);
		text = text.replace(/[a-z]+:\/\/([a-z0-9-_]+\.[a-z0-9-_:~\+#%&\?\/.=]+[^:\.,\)\s*$])/ig, function(m, link) {
      return '<a title="' + m + '" href="' + m + '">' + ((link.length > 36) ? link.substr(0, 35) + '&hellip;' : link) + '</a>';
    })
	 	return text;
	}

	[].forEach.call(itemTitle, function(v){
		console.log(v)
		v.innerHTML = addLinks(v.innerHTML);
	})

});