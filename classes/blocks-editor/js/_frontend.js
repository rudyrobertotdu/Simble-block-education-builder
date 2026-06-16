$ = jQuery;
$('.images-slider_slides').on('init', function($slider, $currentSlide, $$) {
		
	let $slide = $($currentSlide.$slides.get($currentSlide.currentSlide));
	console.log($slide);
	$slide.get(0).classList.add('active-slide');
});
$('.images-slider_slides').slick({
    autoplay: true,
    autoPlaySpeed: 2000
});
$('.images-slider_slides').on('afterChange', function($slider, $currentSlide, $$) {
    
	let $slide = $($currentSlide.$slides.get($currentSlide.currentSlide));
	$slide.get(0).classList.add('active-slide');
});
$('.images-slider_slides').on('beforeChange', function($slider, $currentSlide, $nextSlide) {
    
	let $slide = $($currentSlide.$slides.get($nextSlide));
	$slide.get(0).classList.remove('active-slide');
});
$('.posts-grid_slider').slick({autoplay: true, autoplaySpeed: 2000 });
$('.images-carousel .carousel-slider').slick({
    autoplay: true,
    autoPlaySpeed: 1000,
    slidesToShow: 4,
    responsive: [{
		breakpoint: 768,
		settings: {
			slidesToShow: 2
		}
	}]
});
$('.section-experiencias .testimonials-slider').slick({
    autoplay: true,
	autoplaySpeed: 3000,
	centerMode: true,
	centerPadding: '300px',
	slidesToShow: 1,
	responsive: [{
		breakpoint: 768,
		settings: {
			centerPadding: '0px',
			centerMode: true,
		}
	}]
});

(function($) {

	let $navigation = $('.navigation'),
	    $navMenu = $('.navigation .navigation-menu'),
		$navToggler = $('.navigation .navigation-toggler'),
		$navMask = document.createElement('div');
		isOpen = false;

	$navMask.className = 'mask';

	$navMask.addEventListener('click', function() {
	    
	    isOpen = false;
	    
		$navMenu.css('left', '-100%');
		this.remove();
	});
	
	$navMenu.find('ul').prev('a').on('click', function(evt) {

		evt.preventDefault();
		evt.stopPropagation();

		if (window.innerWidth < 992) {

			$(this).next('ul').slideToggle(250);
			return false;
		}
	});
	$navToggler.on('click', function() {

		if (isOpen) {

			isOpen = false;
			$navMenu.css('left', '-100%');
		} else {

			isOpen = true;
			$navMenu.before($navMask);
			$navMenu.css('left', '0');
		}
	})
})(jQuery);

var gallery = new SimpleLightbox('.images-gallery .images a', {});