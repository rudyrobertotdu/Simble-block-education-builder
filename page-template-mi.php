<?php
/**
 * page-template-mi.php
 *
 * Template Name: Mi Plantilla
 *
 * Plantilla de página personalizada que incluye el template part
 * `template-parts/plantillas/mi-plantilla.php`.
 * Propósito:
 * - Actuar como wrapper de presentación para la plantilla reutilizable
 * - Mantener la separación entre el archivo de plantilla y el template part
 *
 * Notas:
 * - No realiza lógica, solo carga la parte `mi-plantilla` y delega footer/header
 */
/*
Template Name: Mi Plantilla
*/
get_header();
?>
<main id="main" class="site-main">
  <?php get_template_part('template-parts/plantillas/mi-plantilla'); ?>
</main>
<?php
get_footer();
