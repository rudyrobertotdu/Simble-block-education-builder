<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="icon" type="image/x-icon" href="/wp-content/themes/educacion-editor/img/5_150x150.png">
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title><?php wp_title('|', true, 'right'); bloginfo('name'); ?></title>
	<?php wp_head(); ?>
	<style>
		.hero {
			background-image: url(<?php echo get_template_directory_uri(). '/img/hero2.jpg'; ?>);
			background-image: url(/wp-content/themes/educacion-editor/img/5_150x150.png);
			min-height: 180px;
			background-position: center;
			background-size: cover;
		}
		.hero h2 {
			color: #fff;
			font-size: 45px;
		}
		.page-hero {
		    position: relative;
		    display: flex;
		    flex-direction: column;
		    background-image: url(<?php echo get_template_directory_uri(). '/img/page-hero.jpeg'; ?>);
		    background-image: url(/wp-content/themes/educacion-editor/img/page-hero.jpeg);
			min-height: 250px;
			background-position: center;
			background-size: cover;
		}
		.page-hero::before {
		    content: '';
		    position: absolute;
		    inset: 0;
		    background: rgba(0, 0, 0, 0.4);
		}
		.page-hero .content {
		    flex-grow: 1;
		    justify-content: center;
		}
		.page-hero .heading {
		    margin: 0;
		    font-size: clamp(20px, 3vw, 30px);
		}
		.page-hero .heading :is(h1, h2, h3, h4, h5, h6) {
		    color: #fff;
		    font-size: 38px;
		}
		@media (max-width: 768px) {
		    .page-hero .content {
		        width: 100%;
		    }
		}
	</style>
</head>
<body>
	<header>
		<?php echo Blocks_Editor::get_template('header'); ?>
	</header>