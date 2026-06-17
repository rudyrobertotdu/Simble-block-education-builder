<?php
/**
 * page.php
 *
 * Plantilla genérica para páginas (`page`).
 * Propósito:
 * - Delegar el renderizado de contenido al sistema de bloques mediante
 *   `Blocks_Editor::get_template('content')` para mantener consistencia
 *   entre páginas y otras secciones.
 */
get_header(); ?>
<main>
	<?php echo Blocks_Editor::get_template('content'); ?>
</main>
<?php get_footer(); ?>