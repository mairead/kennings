
var userImgs = document.querySelectorAll('.user-imgs');
imagesLoaded( userImgs, function() {
	var container = document.querySelector('#masonry-layout');
	var msnry = new Masonry( container, {
	  // options
	  columnWidth: 148,
	  itemSelector: '.user-item',
	  gutter: 24
	});
});





