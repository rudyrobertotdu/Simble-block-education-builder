<?php
/**
 * index.php
 *
 * Archivo raíz de plantilla (fallback) del tema.
 * Propósito:
 * - Renderizar el header y el contenido principal con ayuda de `Blocks_Editor`
 * - Sirve como punto de entrada cuando no existe una plantilla más específica
 *
 * Interacciones:
 * - Usa `Blocks_Editor::get_template('content')` para delegar el renderizado
 */
get_header(); ?>
<main>
	<?php echo Blocks_Editor::get_template('content'); ?>
</main>
<?php get_footer(); ?>