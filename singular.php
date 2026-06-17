<?php
/**
 * singular.php
 *
 * Plantilla genérica para vistas singulares. Delegamos la composición del
 * contenido a `Blocks_Editor::get_template()` para ofrecer una experiencia
 * de edición centralizada.
 */
get_header(); ?>
<main>
	<?php Blocks_Editor::get_template(); ?>
</main>
<?php get_footer(); ?>