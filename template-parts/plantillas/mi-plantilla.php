<?php
/**
 * template-parts/plantillas/mi-plantilla.php
 *
 * Template part reutilizable para la sección "Mi Plantilla".
 * Responsabilidad:
 * - Renderizar el título y el contenido del post dentro de una sección
 * - Ser incluida por `page-template-mi.php` para separar markup y lógica
 *
 * Flujo:
 * - `page-template-mi.php` carga este template part con `get_template_part()`
 * - Este archivo itera el loop de WordPress para mostrar el contenido
 */
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
