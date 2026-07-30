<?php

/**
 * functions.php
 *
 * Punto central de inicialización del tema: registra post types, colabora
 * con la inicialización del editor de bloques (`Blocks_Editor`) y define
 * utilidades auxiliares como `_log()`.
 *
 * Responsabilidades:
 * - Registrar tipos de contenido personalizado (`education-*`)
 * - Iniciar la clase `Blocks_Editor` que administra el editor propio
 * - Encolar scripts del admin relacionados con el editor
 */

if (!function_exists('_log')) {

		function _log($log) {

			if (true === WP_DEBUG) {
				if (is_array($log) || is_object($log)) {

					error_log(print_r($log, true));
				} else {

					error_log($log);
				}
			}
		}
	}

	require_once(__DIR__ .'/classes/wp-database/database.php');
	require_once(__DIR__ .'/classes/blocks-editor/blocks-editor.php');
    
	// Inicializa el editor de bloques del tema. Blocks_Editor se encarga de
	// registrar tablas, endpoints y scripts necesarios.
	new Blocks_Editor();

	register_nav_menus([
		'header-menu' => 'Menu de cabecera'
	]);

	add_theme_support('post-thumbnails');

	add_action('wp_dashboard_setup', function() {

		remove_action('welcome_panel', 'wp_welcome_panel');
		remove_meta_box('dashboard_primary', 'dashboard', 'side');
	});
	
	function load_backend_scripts($hook) {
	    
	    $ver = '1.0';
	    $path = get_template_directory_uri() .'/classes/blocks-editor';
	    
        $hook_parts = explode('_page_', $hook);
        $menu_slug = array_pop($hook_parts);
        
        wp_enqueue_style('simditor-styles', $path .'/lib/simditor/css/simditor.css', false, $ver);
        wp_enqueue_script('simditor-module-scripts', $path .'/lib/simditor/js/module.js', array('jquery'), $ver, false);
        wp_enqueue_script('simditor-hotkeys-scripts', $path .'/lib/simditor/js/hotkeys.js', array('jquery'), $ver, false);
        wp_enqueue_script('simditor-scripts', $path .'/lib/simditor/js/simditor.js', array('jquery'), $ver, false);
        wp_add_inline_script('simditor-scripts', "if (typeof Simditor !== 'undefined') { Simditor.locale = 'en-US'; } if (typeof Uploader !== 'undefined') { Uploader.locale = 'en-US'; } if (typeof Module !== 'undefined') { Module.locale = 'en-US'; }");
	}
	add_action('admin_enqueue_scripts', 'load_backend_scripts');
	
	function education_register_post_types() {

		register_post_type('education-careers', array(
			'labels' => array(
				'name'           => __('Capacitaciones'),
				'all_items'      => __('Todas las capacitaciones'),
				'singular_name'  => __('Capacitaciones'),
				'add_new'        => __('Nueva capacitación'),
				'add_new_item'   => __('Añadir nueva capacitación'),
				'edit_item'      => __('Editar capacitación'),
				'featured_image' => __('Imagen destacada de la capacitación')
			),
			'public'      => true,
			'show_in_menu' => true,
			'has_archive' => true,
			'menu_icon'   => 'dashicons-welcome-learn-more',
			'rewrite'     => ['slug' => 'capacitaciones'],
			'taxonomies'  => array('career_category'),
			'supports'    => array('title', 'thumbnail', 'editor')
		));

		register_post_type('education-diploma', array(
			'labels' => array(
				'name'           => __('Diplomados'),
				'all_items'      => __('Todos los diplomados'),
				'singular_name'  => __('Diplomados'),
				'add_new'        => __('Nuevo diplomado'),
				'add_new_item'   => __('Añadir nuevo diplomado'),
				'edit_item'      => __('Editar diplomado'),
				'featured_image' => __('Imagen destacada del diplomado')
			),
			'public'      => true,
			'show_in_menu' => true,
			'has_archive' => true,
			'menu_icon'   => 'dashicons-awards',
			'rewrite'     => ['slug' => 'diplomados'],
			'supports'    => array('title', 'thumbnail', 'editor')
		));

		register_post_type('education-specializa', array(
			'labels' => array(
				'name'           => __('Especializaciones'),
				'all_items'      => __('Todas las especializaciones'),
				'singular_name'  => __('Especializaciones'),
				'add_new'        => __('Nueva especialización'),
				'add_new_item'   => __('Añadir nueva especialización'),
				'edit_item'      => __('Editar especialización'),
				'featured_image' => __('Imagen destacada de la especialización')
			),
			'public'      => true,
			'show_in_menu' => true,
			'has_archive' => true,
			'menu_icon'   => 'dashicons-welcome-learn-more',
			'rewrite'     => ['slug' => 'especializaciones'],
			'supports'    => array('title', 'thumbnail', 'editor')
		));

		register_post_type('education-news', array(
			'labels' => array(
				'name'           => __('Noticias'),
				'all_items'      => __('Todas las noticias'),
				'singular_name'  => __('Noticias'),
				'add_new'        => __('Nueva noticia'),
				'add_new_item'   => __('Añadir nueva noticia'),
				'edit_item'      => __('Editar noticia'),
				'featured_image' => __('Imagen destacada de la noticia')
			),
			'public'      => true,
			'show_in_menu' => true,
			'has_archive' => true,
			'menu_icon'   => 'dashicons-welcome-widgets-menus',
			'rewrite'     => ['slug' => 'noticias'],
			'supports'    => array('title', 'editor', 'thumbnail')
		));

		register_post_type('education-documents', array(
			'labels' => array(
				'name'           => __('Pagina de transparencia'),
				'all_items'      => __('Todas las paginas de transparencia'),
				'singular_name'  => __('Pagina de transparencia'),
				'add_new'        => __('Nueva pagina de transparencia'),
				'add_new_item'   => __('Añadir nueva pagina de transparencia'),
				'edit_item'      => __('Editar pagina de transparencia')
			),
			'public'      => true,
			'show_in_menu' => true,
			'has_archive' => true,
			'menu_icon'   => 'dashicons-media-spreadsheet',
			'rewrite'     => ['slug' => 'transparencia'],
			'supports'    => array('title', 'editor')
		));

		register_post_type('education-books', array(
			'labels' => array(
				'name'           => __('Libros'),
				'all_items'      => __('Todos los libros'),
				'singular_name'  => __('Libros'),
				'add_new'        => __('Nuevo libro'),
				'add_new_item'   => __('Añadir nuevo libro'),
				'edit_item'      => __('Editar libro'),
				'featured_image' => __('Imagen destacada del libro')
			),
			'public'      => true,
			'show_in_menu' => true,
			'has_archive' => true,
			'menu_icon'   => 'dashicons-book',
			'rewrite'     => ['slug' => 'libros'],
			'supports'    => array('title', 'editor', 'thumbnail')
		));

		
	}
	add_action('init', 'education_register_post_types');

	function education_register_taxonomies() {
		$labels = array(
			'name'              => __('Categorías de capacitaciones'),
			'singular_name'     => __('Categoría de capacitación'),
			'search_items'      => __('Buscar categorías'),
			'all_items'         => __('Todas las categorías'),
			'parent_item'       => __('Categoría superior'),
			'parent_item_colon' => __('Categoría superior:'),
			'edit_item'         => __('Editar categoría'),
			'update_item'       => __('Actualizar categoría'),
			'add_new_item'      => __('Añadir nueva categoría'),
			'new_item_name'     => __('Nombre de nueva categoría'),
			'menu_name'         => __('Categorías de capacitación'),
		);

		register_taxonomy('career_category', array('education-careers'), array(
			'hierarchical'      => true,
			'labels'            => $labels,
			'show_ui'           => true,
			'show_admin_column' => true,
			'show_in_nav_menus' => true,
			'query_var'         => true,
			'meta_box_cb'       => 'education_career_category_meta_box',
			'rewrite'           => array('slug' => 'categorias-capacitaciones'),
		));
	}
	add_action('init', 'education_register_taxonomies');

	function education_career_category_meta_box($post) {
		if (!taxonomy_exists('career_category')) {
			return;
		}

		$selected_terms = wp_get_object_terms($post->ID, 'career_category', array('fields' => 'ids'));
		if (is_wp_error($selected_terms)) {
			$selected_terms = array();
		}
		?>
		<div id="taxonomy-career_category" class="categorydiv">
			<div id="career_category-all" class="tabs-panel">
				<ul id="career_categorychecklist" class="categorychecklist form-no-clear">
					<?php
					wp_terms_checklist(
						$post->ID,
						array(
							'taxonomy'      => 'career_category',
							'selected_cats' => $selected_terms,
							'checked_ontop' => false,
						)
					);
					?>
				</ul>
			</div>
		</div>
		<?php
	}

	function education_add_meta_boxes() {

		add_meta_box('education-career-data', 'DATOS DEL PROGRAMA DE ESTUDIOS', 'render_career_data_metabox', 'education-careers', 'normal', 'high');
		
		add_meta_box('education-diploma-data', 'DATOS DEL DIPLOMADO', 'render_career_data_metabox', 'education-diploma', 'normal', 'high');

		add_meta_box('education-specialization-data', 'DATOS DE LA ESPECIALIZACIÓN', 'render_career_data_metabox', 'education-specializa', 'normal', 'high');
		
		add_meta_box('education-document-attachments', 'ARCHIVOS ADJUNTOS', 'render_transparency_files_metabox', 'education-documents', 'normal', 'high');

		add_meta_box('education-book-attachments', 'ARCHIVOS ADJUNTOS', 'render_transparency_files_metabox', 'education-books', 'normal', 'high');

		add_meta_box('education-book-availability', 'DISPONIBILIDAD', 'render_book_availability_metabox', 'education-books', 'normal', 'high');

		add_meta_box('education-book-data', 'DATOS DEL LIBRO', 'render_book_data_metabox', 'education-books', 'normal', 'high');
	}

	function render_book_availability_metabox($post) {
		$availability = get_post_meta($post->ID, '_book_availability', true);
		// Por defecto, al crear un nuevo post queremos que esté disponible.
		if ($availability === '' || $availability === null) {
			$availability = 'available';
		}
		$checked = ($availability === 'available');
		?>
		<div class="uix-field">
			<label style="display:flex; align-items:center; gap:8px;">
				<input type="checkbox" id="book-available" name="book_availability" value="available" <?php checked( $checked ); ?> />
				<span>Disponible</span>
			</label>
		</div>
		<?php
	}

	function render_book_data_metabox($post) {
		$isbn = get_post_meta($post->ID, '_book_isbn', true);
		$isbn_url = get_post_meta($post->ID, '_book_isbn_url', true);
		$purchase_link = get_post_meta($post->ID, '_book_purchase_link', true);
		?>
		<style>
			.uix-field {
				margin-bottom: 16px;
			}
			.uix-field label {
				display: block;
				font-weight: 600;
				font-size: 14px;
				margin-bottom: 6px;
			}
			.uix-field input[type="text"],
			.uix-field input[type="url"] {
				width: 100%;
				max-width: 100%;
				padding: 8px;
				font-size: 14px;
				border: 1px solid #b4b4b4;
				border-radius: 4px;
				box-sizing: border-box;
			}
			.uix-field input[type="text"]:focus,
			.uix-field input[type="url"]:focus {
				border-color: #0073aa;
				outline: none;
				box-shadow: 0 0 0 2px rgba(0, 115, 170, 0.2);
			}
		</style>
		<div class="uix-field">
			<label for="book-isbn">ISBN:</label>
			<input type="text" id="book-isbn" name="book_isbn" value="<?php echo esc_attr($isbn); ?>" placeholder="Ej: 978-84-1234567-8" />
		</div>
		<div class="uix-field">
			<label for="book-isbn-url">URL del ISBN (opcional):</label>
			<input type="url" id="book-isbn-url" name="book_isbn_url" value="<?php echo esc_attr($isbn_url); ?>" placeholder="Ej: https://www.isbn.org/..." />
		</div>
		<div class="uix-field">
			<label for="book-purchase-link">Link de compra:</label>
			<input type="url" id="book-purchase-link" name="book_purchase_link" value="<?php echo esc_attr($purchase_link); ?>" placeholder="Ej: https://www.amazon.com/..." />
		</div>
		<?php
	}
	function render_transparency_files_metabox($post) {

		$docs_ids = get_post_meta($post->ID, '_transparency_documents', true);
		$documents = '[]';

		if ($docs_ids) {

			$docs_ids = json_decode($docs_ids);
			$docs_ids = implode(', ', $docs_ids);

			$database = new WP_Database();
			$documents = json_encode($database->fetch('posts', "ID IN ($docs_ids)", 'ID, post_name'));
		}
?>
		<div class="">
			<div>
				<ul class="files"></ul>
			</div>
			<button id="add-files" type="button">Añadir documentos</button>

		</div>
		
		<script>

			var files = JSON.parse('<?php echo $documents ?>');
			var $files = document.querySelector('.files');

			function createSingleFile(name, id) {

				let $li = document.createElement('li');
				$li.style.cssText = 'display: flex';
				$li.innerHTML = `<div><i class="fa fa-pdf-o"></i> ${name}<input type="hidden" name="transparency_documents[]" value="${id}"></div>`;
				let $btn = document.createElement('button');
				$btn.innerHTML = '<i class="fa fa-trash"></i>';
				$btn.title = 'Borrar';

				$btn.addEventListener('click', function() {
					$li.remove();
				});
				$li.append($btn);
				return $li;
			}
			function insertCallback(files) {

				console.log(files);

				for (let file of files) {

					console.log(file);
					$files.append(createSingleFile(file.title, file.id));
				}
			}
			function openLibrary(insertCallback, isMultiple) {

				var $self = this,
					multipleType = isMultiple || false, fileFrame, image_data, images;

				var normalizeUrl = function(url) {
					if (typeof url !== 'string') {
						return url;
					}
					if (url.indexOf(location.origin) === 0) {
						return url.replace(location.origin, '');
					}
					if (/^https?:\/\//.test(url)) {
						try {
							var _u = new URL(url);
							return (_u.pathname || '') + (_u.search || '') + (_u.hash || '');
						} catch (e) {
							return url.replace(/^https?:\/\/[^/]+/, '');
						}
					}
					return url;
				};

				if (undefined !== fileFrame) {

					fileFrame.open();
					return;
				}

				console.log(multipleType);

				fileFrame = wp.media({
					multiple: multipleType,
					library: {
						type: ['application']
					},
					button: {
						text: 'Seleccionar archivos'
					}
				});

				var image = {};

				fileFrame.on('select', function() {

					var selection = fileFrame.state().get('selection');
					if (!!multipleType) { 

						var images = [];

						selection.map(function(attachment) {
							var image = attachment.toJSON();
							if (image && typeof image.url === 'string') {
								image.url = normalizeUrl(image.url);
							}
							images.push(image);
						});

						insertCallback(images);
					} else {

						var image = selection.first().toJSON();
						if (image && typeof image.url === 'string') {
							image.url = normalizeUrl(image.url);
						}
						insertCallback(image);
					}
				});

				var i = fileFrame.open();
			}

			var $buttonAddFiles = document.querySelector('#add-files');

			$buttonAddFiles.addEventListener('click', function() {
				openLibrary(insertCallback, true);
			});

			(function($, fs){

				if (fs.length) {
					for (let file of fs) {

						$files.append(createSingleFile(file.post_name, file.ID));
					}
				}
			})(jQuery, files);
		</script>
<?php
	}

	function render_career_data_metabox($post) {
?>
		<style>
			.uix-field label {
				display: block;
				font-weight: 600;
				font-size: 15px;
				margin-bottom: 6px;
			}
			.simditor iframe {
			    border: 1px solid #b4b4b4;
			}
		</style>

		<br>
		<div class="uix-field">
			<label for="">Temario:</label>
		</div>
		<div class="editor-1">
    		<div style="display: flex; gap: 10px; padding-block: 10px">
    		    <button data-target="file" type="button"><i class="fa fa-file-pdf-o"></i>PDF</button>
    		</div>
    		<div>
    		    <div class="panel" data-name="editor">
<?php
            		$plan_estudios = get_post_meta($post->ID, '_career-plan-estudios', true);
            		
?>
                    <textarea name="career-plan-estudios"><?php echo $plan_estudios; ?></textarea>
                </div>
            </div>
        </div>
        <script>
            
            (function($) {
                
                var edit1 = document.querySelector('.editor-1');
                var btn = edit1.querySelector('[data-target="file"]');
                
                var $editor = new Simditor({
    					textarea: document.querySelector('textarea[name=career-plan-estudios]'),
						toolbar: [
    						'bold',
    						'italic',
    						'ul',
    						'ol',
    						'alignment',
    						'table',
							'link',
							'image'
    					],
    					allowedTags: ['p', 'table', 'iframe'],
    					allowedAttributes: {iframe: ['src', 'style']},
    					allowedStyles: {
    					    iframe: ['width', 'height']
    					}
    				});
				
                function openLibrary(insertCallback, isMultiple) {

            		var $self = this,
            			multipleType = isMultiple || false, fileFrame, image_data, images;
            
				var normalizeUrl = function(url) {
					if (typeof url !== 'string') {
						return url;
					}
					if (url.indexOf(location.origin) === 0) {
						return url.replace(location.origin, '');
					}
					if (/^https?:\/\//.test(url)) {
						try {
							var _u = new URL(url);
							return (_u.pathname || '') + (_u.search || '') + (_u.hash || '');
						} catch (e) {
							return url.replace(/^https?:\/\/[^/]+/, '');
						}
					}
					return url;
				};

            		if (undefined !== fileFrame) {
            
            			fileFrame.open();
            			return;
            		}
            
            		console.log(multipleType);

            		fileFrame = wp.media({
            			multiple: multipleType,
            			library: {
            				type: ['image', 'application']
            			},
            			button: {
            				text: 'Insertar imagen'
            			}
            		});
            
            		var image = {};
            
            		fileFrame.on('select', function() {
            
            			var selection = fileFrame.state().get('selection');
            			if (!!multipleType) {
            
            				var images = [];
            
            				selection.map(function(attachment) {
						var image = attachment.toJSON();
						if (image && typeof image.url === 'string') {
							image.url = normalizeUrl(image.url);
						}
						images.push(image);
					});
            
            				insertCallback(images);
            			} else {
            
            				var image = selection.first().toJSON();
						if (image && typeof image.url === 'string') {
							image.url = normalizeUrl(image.url);
						}
						insertCallback(image);
            			}
            		});
            
            		var i = fileFrame.open();
            	}
            	$(btn).on('click', function() {
            	    
            	    openLibrary(function(file) {
            	        
            	        $editor.setValue($editor.getValue() + '<iframe style="display: block; width: 100%; height: 300px" src="'+ normalizeUrl(file.url) +'"></iframe>');
            	    }, false);
            	});
            })(jQuery);
        </script>
		<br>
		<div class="uix-field">
			<label for="">Matricula:</label>
		</div>
        <div class="editor-3">
    		<div style="display: flex; gap: 10px; padding-block: 10px">
    		    <button data-target="file" type="button"><i class="fa fa-file-pdf-o"></i>PDF</button>
    		</div>
    		<div>
    		    <div class="panel" data-name="editor">
<?php
                    $matricula = get_post_meta($post->ID, '_career-matricula', true);
                    
?>
		            <textarea name="career-matricula"><?php echo $matricula; ?></textarea>
                </div>
            </div>
        </div>
        <script>
            (function($) {
                
                var edit1 = document.querySelector('.editor-3');
                var btn = edit1.querySelector('[data-target="file"]');
                
                var $editor = new Simditor({
					textarea: document.querySelector('textarea[name=career-matricula]'),
					toolbar: [
						'bold',
						'italic',
						'ul',
						'ol',
						'alignment',
						'table',
						'link',
						'image'
					],
					allowedTags: ['p', 'table', 'iframe'],
					allowedAttributes: {iframe: ['src', 'style']},
					allowedStyles: {
					    iframe: ['width', 'height']
					}
				});
				
                function openLibrary(insertCallback, isMultiple) {

            		var $self = this,
            			multipleType = isMultiple || false, fileFrame, image_data, images;
            
				var normalizeUrl = function(url) {
					if (typeof url !== 'string') {
						return url;
					}
					if (url.indexOf(location.origin) === 0) {
						return url.replace(location.origin, '');
					}
					if (/^https?:\/\//.test(url)) {
						try {
							var _u = new URL(url);
							return (_u.pathname || '') + (_u.search || '') + (_u.hash || '');
						} catch (e) {
							return url.replace(/^https?:\/\/[^/]+/, '');
						}
					}
					return url;
				};

            		if (undefined !== fileFrame) {
            
            			fileFrame.open();
            			return;
            		}
            
            		console.log(multipleType);
            
            		fileFrame = wp.media({
            			multiple: multipleType,
            			library: {
            				type: ['image', 'application']
            			},
            			button: {
            				text: 'Insertar imagen'
            			}
            		});
            
            		var image = {};
            
            		fileFrame.on('select', function() {
            
            			var selection = fileFrame.state().get('selection');
            			if (!!multipleType) {
            
            				var images = [];
            
            				selection.map(function(attachment) {
						var image = attachment.toJSON();
						if (image && typeof image.url === 'string') {
							image.url = normalizeUrl(image.url);
						}
						images.push(image);
					});
            
            				insertCallback(images);
            			} else {
            
            				var image = selection.first().toJSON();
						if (image && typeof image.url === 'string') {
							image.url = normalizeUrl(image.url);
						}
						insertCallback(image);
            			}
            		});
            
            		var i = fileFrame.open();
            	}
            	$(btn).on('click', function() {
            	    
            	    openLibrary(function(file) {
            	        
            	        $editor.setValue($editor.getValue() + '<iframe style="display: block; width: 100%; height: 300px" src="'+ normalizeUrl(file.url) +'"></iframe>');
            	    }, false);
            	});
            	
            })(jQuery);
        </script>
        <br>
        <div class="uix-field">
			<label for="">Resolución de Autorización:</label>
		</div>
        <div class="editor-10">
    		<div style="display: flex; gap: 10px; padding-block: 10px">
    		    <button data-target="file" type="button"><i class="fa fa-file-pdf-o"></i>PDF</button>
    		</div>
    		<div>
    		    <div class="panel" data-name="editor">
                    <?php $oficio = get_post_meta($post->ID, '_oficio-autorizacion', true); ?>
		            <textarea name="oficio-autorizacion"><?php echo $oficio; ?></textarea>
                </div>
            </div>
        </div>
        <script>
            (function($) {
                
                var edit1 = document.querySelector('.editor-10');
                var btn = edit1.querySelector('[data-target="file"]');
                
                var $editor = new Simditor({
					textarea: document.querySelector('textarea[name=oficio-autorizacion]'),
					toolbar: [
						'bold',
						'italic',
						'ul',
						'ol',
						'alignment',
						'table',
						'link',
						'image'
					],
					allowedTags: ['p', 'table', 'iframe'],
					allowedAttributes: {iframe: ['src', 'style']},
					allowedStyles: {
					    iframe: ['width', 'height']
					}
				});
				
                function openLibrary(insertCallback, isMultiple) {

            		var $self = this,
            			multipleType = isMultiple || false, fileFrame, image_data, images;
            
				var normalizeUrl = function(url) {
					if (typeof url !== 'string') {
						return url;
					}
					if (url.indexOf(location.origin) === 0) {
						return url.replace(location.origin, '');
					}
					if (/^https?:\/\//.test(url)) {
						try {
							var _u = new URL(url);
							return (_u.pathname || '') + (_u.search || '') + (_u.hash || '');
						} catch (e) {
							return url.replace(/^https?:\/\/[^/]+/, '');
						}
					}
					return url;
				};

            		if (undefined !== fileFrame) {
            
            			fileFrame.open();
            			return;
            		}
            
            		console.log(multipleType);
            
            		fileFrame = wp.media({
            			multiple: multipleType,
            			library: {
            				type: ['image', 'application']
            			},
            			button: {
            				text: 'Insertar imagen'
            			}
            		});
            
            		var image = {};
            
            		fileFrame.on('select', function() {
            
            			var selection = fileFrame.state().get('selection');
            			if (!!multipleType) {
            
            				var images = [];
            
            				selection.map(function(attachment) {
						var image = attachment.toJSON();
						if (image && typeof image.url === 'string') {
							image.url = normalizeUrl(image.url);
						}
						images.push(image);
					});
            
            				insertCallback(images);
            			} else {
            
            				var image = selection.first().toJSON();
						if (image && typeof image.url === 'string') {
							image.url = normalizeUrl(image.url);
						}
						insertCallback(image);
            			}
            		});
            
            		var i = fileFrame.open();
            	}
            	
            	$(btn).on('click', function() {
            	    
            	    openLibrary(function(file) {
            	        
            	        $editor.setValue($editor.getValue() + '<iframe style="display: block; width: 100%; height: 300px" src="'+ normalizeUrl(file.url) +'"></iframe>');
            	    }, false);
            	});
            	
            })(jQuery);
        </script>
<?php
	}

	add_action('add_meta_boxes', 'education_add_meta_boxes');

	function save_post_education_career($post_id) {

	    if (!empty($_POST['career-plan-estudios'])) {

			$data5 = $_POST['career-plan-estudios'];
			update_post_meta($post_id, '_career-plan-estudios', $data5);
		}

		if (!empty($_POST['career-matricula'])) {

			$data7 = $_POST['career-matricula'];
			update_post_meta($post_id, '_career-matricula', $data7);
		}
		if (!empty($_POST['oficio-autorizacion'])) {

			$data8 = $_POST['oficio-autorizacion'];
			update_post_meta($post_id, '_oficio-autorizacion', $data8);
		}
	}

	add_action('save_post_education-careers', 'save_post_education_career');
	add_action('save_post_education-diploma', 'save_post_education_career');
	add_action('save_post_education-specializa', 'save_post_education_career');

	function save_post_education_document($post_id) {

		// Guardado de archivos de transparencia.
		// Si el campo existe en el POST lo guardamos (incluso si está vacío).
		if (isset($_POST['transparency_documents'])) {
			$docs = $_POST['transparency_documents'];
			// Normalizar: quitar valores vacíos y reindexar
			if (is_array($docs)) {
				$docs = array_values(array_filter($docs, function($v) { return $v !== '' && $v !== null; }));
			} else {
				$docs = array();
			}
			update_post_meta($post_id, '_transparency_documents', json_encode($docs));
		} else {
			// Si el campo no viene en el POST significa que el usuario borró todos
			// los inputs en el editor; eliminamos la meta para reflejarlo.
			delete_post_meta($post_id, '_transparency_documents');
		}

		// Guardado de disponibilidad para libros de educación.
		if (isset($_POST['book_availability'])) {
			$availability = sanitize_text_field($_POST['book_availability']);
			if (!in_array($availability, ['available', 'unavailable'], true)) {
				$availability = 'available';
			}
			update_post_meta($post_id, '_book_availability', $availability);
		} else {
			// Si la casilla no viene en el POST significa que el usuario la
			// desmarcó; guardamos explícitamente el estado "unavailable"
			// para que el valor no vuelva al comportamiento por defecto al
			// renderizar la metabox.
			update_post_meta($post_id, '_book_availability', 'unavailable');
		}

		// Guardado de datos del libro (ISBN, URL ISBN, Link de compra).
		if (isset($_POST['book_isbn'])) {
			$isbn = sanitize_text_field($_POST['book_isbn']);
			if (!empty($isbn)) {
				update_post_meta($post_id, '_book_isbn', $isbn);
			} else {
				delete_post_meta($post_id, '_book_isbn');
			}
		}
		if (isset($_POST['book_isbn_url'])) {
			$isbn_url = esc_url_raw($_POST['book_isbn_url']);
			if (!empty($isbn_url)) {
				update_post_meta($post_id, '_book_isbn_url', $isbn_url);
			} else {
				delete_post_meta($post_id, '_book_isbn_url');
			}
		}
		if (isset($_POST['book_purchase_link'])) {
			$purchase_link = esc_url_raw($_POST['book_purchase_link']);
			if (!empty($purchase_link)) {
				update_post_meta($post_id, '_book_purchase_link', $purchase_link);
			} else {
				delete_post_meta($post_id, '_book_purchase_link');
			}
		}
	}
	add_action('save_post_education-documents', 'save_post_education_document');
	add_action('save_post_education-books', 'save_post_education_document');
	function my_login_logo() {
?>
        <link href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;500;700&display=swap" rel="stylesheet">
        <style type="text/css">
            #login h1 a, .login h1 a {
                
                background-image: url(<?php echo get_stylesheet_directory_uri(); ?>/img/5_150x150.png);
                height: 150px;
                width: 150px;
                background-size: contain;
                background-repeat: no-repeat;
                padding-bottom: 22px;
                position: relative;
            }
            #login h1 a::after {
                content: 'C.P.P.E "SABER-CLAIP"';
                width: 100%;
                text-align: center;
                position: absolute;
                line-height: 1.2;
                font-weight: 500;
                font-family: Ubuntu;
                font-size: 18px;
                left: 0;
                bottom: 0;
                color: #414141;
                text-indent: 0;
            }
            #login .button-primary {
                background: #3a8307;
                border-color: #3a8307;
            }
        </style>
<?php
    }
    add_action( 'login_enqueue_scripts', 'my_login_logo' );
    
    function wpb_custom_logo() {
?>
    <style type="text/css">
        #wpadminbar #wp-admin-bar-wp-logo > .ab-item .ab-icon:before {
            background-image: url(<?php echo get_stylesheet_directory_uri(); ?>/img/5_150x150.png) !important;
           background-position: 0 0;
            background-size: cover;
            color:rgba(0, 0, 0, 0);
        }
        #wpadminbar #wp-admin-bar-wp-logo>.ab-item {
        }
        #wpadminbar {
            background: #3a8307;
        }
        #wpadminbar #wp-admin-bar-wp-logo.hover > .ab-item .ab-icon {
            background-position: 0 0;
        }
    </style>
<?php
    }
    add_action('wp_before_admin_bar_render', 'wpb_custom_logo');

    function load_lightbox_scripts() {
        $ver = '2.9.0';
        $path = get_template_directory_uri() . '/classes/blocks-editor/lib/simple-lightbox';
        
        wp_enqueue_style('simple-lightbox-css', $path . '/simple-lightbox.min.css', false, $ver);
        wp_enqueue_script('simple-lightbox-js', $path . '/simple-lightbox.min.js', array('jquery'), $ver, true);
        
        wp_add_inline_script('simple-lightbox-js', "
            jQuery(document).ready(function($) {
                // Inicializar lightbox para imágenes con clase 'lightbox-image'
                var lightbox = new SimpleLightbox('.lightbox-image', {
                    animationSpeed: 250,
                    animationSlide: true,
                    scrollZoom: false,
                    showCounter: false,
                    captionsData: 'title'
                });
            });
        ");
    }
    add_action('wp_enqueue_scripts', 'load_lightbox_scripts');
?>