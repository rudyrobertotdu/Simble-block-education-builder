<?php
// Template part: mi-plantilla
?>
<section class="mi-plantilla">
  <div class="container">
    <?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
      <h1><?php the_title(); ?></h1>
      <div class="entry-content">
        <?php the_content(); ?>
      </div>
    <?php endwhile; endif; ?>
  </div>
</section>
