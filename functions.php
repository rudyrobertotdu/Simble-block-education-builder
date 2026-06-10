<?php

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
	}
	add_action('admin_enqueue_scripts', 'load_backend_scripts');
	
	function education_register_post_types() {

		register_post_type('education-careers', array( //CARRERAS
			'labels' => array(
				'name'           => __('Programa de estudios'),
				'all_items'      => __('Todos los programas de estudios'),
				'singular_name'  => __('Programa de estudios'),
				'add_new'        => __('Nuevo programa de estudios'),
				'add_new_item'   => __('Añadir nuevo programa de estudios'),
				'edit_item'      => __('Editar programa de estudios'),
				'featured_image' => __('Imagen destacada del programa de estudios')
			),
			'public'      => true,
			'has_archive' => true,
			'menu_icon'   => 'dashicons-welcome-learn-more',
			'rewrite'     => ['slug' => 'programas-estudio'],
			'supports'    => array('title', 'thumbnail', 'editor')
		));

		register_post_type('education-news', array( //NOTICIAS
			'labels' => array(
				'name'           => __('Noticias'),
				'all_items'      => __('Todas las noticias'),
				'singular_name'  => __('Noticia'),
				'add_new'        => __('Nueva noticia'),
				'add_new_item'   => __('Añadir nueva noticia'),
				'edit_item'      => __('Editar noticia'),
				'featured_image' => __('Imagen destacada de la noticia')
			),
			'public'      => true,
			'has_archive' => true,
			'menu_icon'   => 'dashicons-welcome-widgets-menus',
			'rewrite'     => ['slug' => 'noticias'],
			'supports'    => array('title', 'editor', 'thumbnail')
		));

		register_post_type('education-events', array( //EVENTOS
			'labels' => array(
				'name'           => __('Eventos'),
				'all_items'      => __('Todos los eventos'),
				'singular_name'  => __('Evento'),
				'add_new'        => __('Nuevo evento'),
				'add_new_item'   => __('Añadir nuevo evento'),
				'edit_item'      => __('Editar evento'),
				'featured_image' => __('Imagen destacada del evento')
			),
			'public'      => true,
			'has_archive' => true,
			'menu_icon'   => 'dashicons-megaphone',
			'rewrite'     => ['slug' => 'eventos'],
			'supports'    => array('title', 'editor', 'thumbnail')
		));

		register_post_type('education-documents', array( //TRANSPARENCIA DOCUMENTOS
			'labels' => array(
				'name'           => __('Pagina de transparencia'),
				'all_items'      => __('Todas las paginas de transparencia'),
				'singular_name'  => __('Pagina de transparencia'),
				'add_new'        => __('Nueva pagina de transparencia'),
				'add_new_item'   => __('Añadir nueva pagina de transparencia'),
				'edit_item'      => __('Editar pagina de transparencia')
			),
			'public'      => true,
			'has_archive' => true,
			'menu_icon'   => 'dashicons-media-spreadsheet',
			'rewrite'     => ['slug' => 'transparencia'],
			'supports'    => array('title', 'editor')
		));
	}
	add_action('init', 'education_register_post_types');

	function education_add_meta_boxes() {

		// $id // $title // $callback // $page // $context // $priority
		add_meta_box('education-career-data', 'DATOS DEL PROGRAMA DE ESTUDIOS', 'render_career_data_metabox', 'education-careers', 'normal', 'high');

		add_meta_box('education-career-data', 'ARCHIVOS ADJUNTOS', 'render_transparency_files_metabox', 'education-documents', 'normal', 'high');
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
			<button id="add-files"type="button">Añadir documentos</button>
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

				/*fileFrame = wp.media.frames.fileFrame = wp.media({
					frame: 'post',
					state: 'insert',
					multiple: multipleType
				});*/

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
					if (!!multipleType) { //Force to convert in true or false

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
		//var_dump($post);
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
<?php
		$link_video = get_post_meta($post->ID, '_career-link-video', true);
?>
		<div class="uix-field">
			<label for="">Link de video:</label>
			<div style="display: flex; align-items: center;">
				<i class="fa fa-globe fa-2x" style="margin-right: 4px"></i>
				<input type="text" name="career-link-video" value="<?php echo $link_video; ?>" style="flex-grow: 1">
			</div>
		</div>
		<br>
	    <div class="uix-field">
			<label for="">Ambito laboral:</label>
		</div>
		<div class="editor-9">
    		<div style="display: flex; gap: 10px; padding-block: 10px">
    		    <button data-target="file" type="button"><i class="fa fa-file-pdf-o"></i>PDF</button>
    		</div>
    		<div>
    		    <div class="panel" data-name="editor">
                    <textarea name="career-ambito-laboral"><?php echo ($ambito_laboral = get_post_meta($post->ID, '_career-ambito-laboral', true)); ?></textarea>
                </div>
            </div>
        </div>
        <script>
            (function($) {
                
                var edit1 = document.querySelector('.editor-9');
                var btn = edit1.querySelector('[data-target="file"]');
                
                var $editor = new Simditor({
    					textarea: document.querySelector('textarea[name=career-ambito-laboral]'),
    					toolbar: [
    						'bold',
    						'italic',
    						'ul',
    						'ol',
    						'alignment',
    						'table'
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
            
            		/*fileFrame = wp.media.frames.fileFrame = wp.media({
            			frame: 'post',
            			state: 'insert',
            			multiple: multipleType
            		});*/
            
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
            			if (!!multipleType) { //Force to convert in true or false
            
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
            	    
            	    //$(edit1).find('.');
            	    openLibrary(function(file) {
            	        
            	        //$(edit1).find('.panel[data-name="file"] iframe').get(0).src = file.url;
            	        $editor.setValue($editor.getValue() + '<iframe style="display: block; width: 100%; height: 300px" src="'+ normalizeUrl(file.url) +'"></iframe>');
            	    }, false);
            	});
                /*$(edit1).find('button').on('click', function() {
                    
                    var target = $(this).data('target');
                    
                    $(edit1).find('.panel:not([data-name="'+target+'"])').css('display', 'none');
                    $(edit1).find('.panel[data-name="'+target+'"]').css('display', 'block');
                });*/
            })(jQuery);
        </script>
<?php
		/*$ambito_laboral = get_post_meta($post->ID, '_career-ambito-laboral', true);

		wp_editor(htmlspecialchars($ambito_laboral), 'career-ambito-laboral', [
			'textarea_name' => 'career-ambito-laboral',
			'textarea_rows' => 10,
			'media_buttons' => false,
			'editor_height' => 200,
			'quicktags' => false
		]);*/
?>
		<br>
		<div class="uix-field">
			<label for="">Perfil de egresado:</label>
		</div>
		<div class="editor-7">
    		<div style="display: flex; gap: 10px; padding-block: 10px">
    		    <button data-target="file" type="button"><i class="fa fa-file-pdf-o"></i>PDF</button>
    		</div>
    		<div>
    		    <div class="panel" data-name="editor">
                    <textarea name="career-perfil-egresado"><?php echo ($perfil_egresado = get_post_meta($post->ID, '_career-perfil-egresado', true)); ?></textarea>
                </div>
            </div>
        </div>
        <script>
            (function($) {
                
                var edit1 = document.querySelector('.editor-7');
                var btn = edit1.querySelector('[data-target="file"]');
                
                var $editor = new Simditor({
    					textarea: document.querySelector('textarea[name=career-perfil-egresado]'),
    					toolbar: [
    						'bold',
    						'italic',
    						'ul',
    						'ol',
    						'alignment',
    						'table'
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
            
            		/*fileFrame = wp.media.frames.fileFrame = wp.media({
            			frame: 'post',
            			state: 'insert',
            			multiple: multipleType
            		});*/
            
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
            			if (!!multipleType) { //Force to convert in true or false
            
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
            	    
            	    //$(edit1).find('.');
            	    openLibrary(function(file) {
            	        
            	        //$(edit1).find('.panel[data-name="file"] iframe').get(0).src = file.url;
            	        $editor.setValue($editor.getValue() + '<iframe style="display: block; width: 100%; height: 300px" src="'+ normalizeUrl(file.url) +'"></iframe>');
            	    }, false);
            	});
                /*$(edit1).find('button').on('click', function() {
                    
                    var target = $(this).data('target');
                    
                    $(edit1).find('.panel:not([data-name="'+target+'"])').css('display', 'none');
                    $(edit1).find('.panel[data-name="'+target+'"]').css('display', 'block');
                });*/
            })(jQuery);
        </script>
		<br>
		<div class="uix-field">
			<label for="">Certificaciones:</label>
		</div>
		<div class="editor-6">
    		<div style="display: flex; gap: 10px; padding-block: 10px">
    		    <!--<button data-target="editor" data-active type="button"><i class="fa fa-file-text-o"></i>Texto</button>-->
    		    <button data-target="file" type="button"><i class="fa fa-file-pdf-o"></i>PDF</button>
    		</div>
    		<div>
    		    <div class="panel" data-name="editor">
<?php
                    
                    /*wp_editor(htmlspecialchars($certificaciones), 'career-certificaciones', [
                    	'textarea_name' => 'career-certificaciones',
                    	'textarea_rows' => 10,
                    	'media_buttons' => false,
                    	'editor_height' => 200,
                    	'quicktags' => false
                    ]);*/
?>
                    <textarea name="career-certificaciones"><?php echo ($certificaciones = get_post_meta($post->ID, '_career-certificaciones', true)); ?></textarea>
                </div>
                <!--<div class="panel" data-name="file" style="display: none">
                    <iframe src="" style="display: block; width: 100%"></iframe>
                </div>-->
            </div>
        </div>
        <script>
            
            (function($) {
                
                var edit1 = document.querySelector('.editor-6');
                var btn = edit1.querySelector('[data-target="file"]');
                
                var $editor = new Simditor({
    					textarea: document.querySelector('textarea[name=career-certificaciones]'),
    					toolbar: [
    						'bold',
    						'italic',
    						'ul',
    						'ol',
    						'alignment',
    						'table'
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
            
            		/*fileFrame = wp.media.frames.fileFrame = wp.media({
            			frame: 'post',
            			state: 'insert',
            			multiple: multipleType
            		});*/
            
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
            			if (!!multipleType) { //Force to convert in true or false
            
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
            	    
            	    //$(edit1).find('.');
            	    openLibrary(function(file) {
            	        
            	        //$(edit1).find('.panel[data-name="file"] iframe').get(0).src = file.url;
            	        $editor.setValue($editor.getValue() + '<iframe style="display: block; width: 100%; height: 300px" src="'+ normalizeUrl(file.url) +'"></iframe>');
            	    }, false);
            	});
                /*$(edit1).find('button').on('click', function() {
                    
                    var target = $(this).data('target');
                    
                    $(edit1).find('.panel:not([data-name="'+target+'"])').css('display', 'none');
                    $(edit1).find('.panel[data-name="'+target+'"]').css('display', 'block');
                });*/
            })(jQuery);
        </script>
		<br>
		<div class="uix-field">
			<label for="">Plan de estudios:</label>
		</div>
		<div class="editor-1">
    		<div style="display: flex; gap: 10px; padding-block: 10px">
    		    <!--<button data-target="editor" data-active type="button"><i class="fa fa-file-text-o"></i>Texto</button>-->
    		    <button data-target="file" type="button"><i class="fa fa-file-pdf-o"></i>PDF</button>
    		</div>
    		<div>
    		    <div class="panel" data-name="editor">
<?php
            		$plan_estudios = get_post_meta($post->ID, '_career-plan-estudios', true);
            		
            		/*wp_editor(htmlspecialchars($plan_estudios), 'career-plan-estudios', [
            			'textarea_name' => 'career-plan-estudios',
            			'textarea_rows' => 10,
            			'media_buttons' => false,
            			'editor_height' => 200,
            			'quicktags' => false
            		]);*/
            		/*$content = $plan_estudios ? $plan_estudios->content : $plan_estudios;*/
?>
                    <textarea name="career-plan-estudios"><?php echo $plan_estudios; ?></textarea>
                </div>
                <!--<div class="panel" data-name="file" style="display: none">
                    <iframe src="" style="display: block; width: 100%"></iframe>
                </div>-->
            </div>
            <!--<input type="hidden" name="career-plan-estudios" value="">-->
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
    						'table'
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
            
            		/*fileFrame = wp.media.frames.fileFrame = wp.media({
            			frame: 'post',
            			state: 'insert',
            			multiple: multipleType
            		});*/
            
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
            			if (!!multipleType) { //Force to convert in true or false
            
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
            	    
            	    //$(edit1).find('.');
            	    openLibrary(function(file) {
            	        
            	        //$(edit1).find('.panel[data-name="file"] iframe').get(0).src = file.url;
            	        $editor.setValue($editor.getValue() + '<iframe style="display: block; width: 100%; height: 300px" src="'+ normalizeUrl(file.url) +'"></iframe>');
            	    }, false);
            	});
                /*$(edit1).find('button').on('click', function() {
                    
                    var target = $(this).data('target');
                    
                    $(edit1).find('.panel:not([data-name="'+target+'"])').css('display', 'none');
                    $(edit1).find('.panel[data-name="'+target+'"]').css('display', 'block');
                });*/
            })(jQuery);
        </script>
		<br>
		<div class="uix-field">
			<label for="">Horario de clases:</label>
		</div>
		<div class="editor-2">
    		<div style="display: flex; gap: 10px; padding-block: 10px">
    		    <!--<button data-target="editor" data-active type="button"><i class="fa fa-file-text-o"></i>Texto</button>-->
    		    <button data-target="file" type="button"><i class="fa fa-file-pdf-o"></i>PDF</button>
    		</div>
    		<div>
    		    <div class="panel" data-name="editor">
<?php
                    $horario = get_post_meta($post->ID, '_career-horario-clases', true);
                    
                    /*$horario = get_post_meta($post->ID, '_career-horario-clases', true);
                    wp_editor(htmlspecialchars($horario), 'career-horario-clases', [
                        'textarea_name' => 'career-horario-clases',
                        'textarea_rows' => 10,
                        'media_buttons' => false,
                        'editor_height' => 200,
                        'quicktags' => false
                    ]);*/
?>
		            <textarea name="career-horario-clases"><?php echo $horario; ?></textarea>
                </div>
            </div>
        </div>
        <script>
            (function($) {
                
                var edit1 = document.querySelector('.editor-2');
                var btn = edit1.querySelector('[data-target="file"]');
                
                var $editor = new Simditor({
					textarea: document.querySelector('textarea[name=career-horario-clases]'),
					toolbar: [
						'bold',
						'italic',
						'ul',
						'ol',
						'alignment',
						'table'
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
            
            		/*fileFrame = wp.media.frames.fileFrame = wp.media({
            			frame: 'post',
            			state: 'insert',
            			multiple: multipleType
            		});*/
            
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
            			if (!!multipleType) { //Force to convert in true or false
            
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
            	    
            	    //$(edit1).find('.');
            	    openLibrary(function(file) {
            	        
            	        //$(edit1).find('.panel[data-name="file"] iframe').get(0).src = file.url;
            	        $editor.setValue($editor.getValue() + '<iframe style="display: block; width: 100%; height: 300px" src="'+ normalizeUrl(file.url) +'"></iframe>');
            	    }, false);
            	});
                /*$(edit1).find('button').on('click', function() {
                    
                    var target = $(this).data('target');
                    
                    $(edit1).find('.panel:not([data-name="'+target+'"])').css('display', 'none');
                    $(edit1).find('.panel[data-name="'+target+'"]').css('display', 'block');
                });*/
            })(jQuery);
        </script>
		<br>
		<div class="uix-field">
			<label for="">Matricula:</label>
		</div>
        <div class="editor-3">
    		<div style="display: flex; gap: 10px; padding-block: 10px">
    		    <!--<button data-target="editor" data-active type="button"><i class="fa fa-file-text-o"></i>Texto</button>-->
    		    <button data-target="file" type="button"><i class="fa fa-file-pdf-o"></i>PDF</button>
    		</div>
    		<div>
    		    <div class="panel" data-name="editor">
<?php
                    $matricula = get_post_meta($post->ID, '_career-matricula', true);
                    
                    /*$horario = get_post_meta($post->ID, '_career-horario-clases', true);
                    wp_editor(htmlspecialchars($horario), 'career-horario-clases', [
                        'textarea_name' => 'career-horario-clases',
                        'textarea_rows' => 10,
                        'media_buttons' => false,
                        'editor_height' => 200,
                        'quicktags' => false
                    ]);*/
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
						'table'
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
            
            		/*fileFrame = wp.media.frames.fileFrame = wp.media({
            			frame: 'post',
            			state: 'insert',
            			multiple: multipleType
            		});*/
            
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
            			if (!!multipleType) { //Force to convert in true or false
            
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
			<label for="">Oficio de Autorización:</label>
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
						'table'
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
            
            		/*fileFrame = wp.media.frames.fileFrame = wp.media({
            			frame: 'post',
            			state: 'insert',
            			multiple: multipleType
            		});*/
            
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
            			if (!!multipleType) { //Force to convert in true or false
            
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
		/*wp_editor(htmlspecialchars($matricula), 'career-matricula', [
			'textarea_name' => 'career-matricula',
			'textarea_rows' => 10,
			'media_buttons' => false,
			'editor_height' => 200,
			'quicktags' => false
		]);*/
	}

	add_action('add_meta_boxes', 'education_add_meta_boxes');

	function save_post_education_career($post_id) {

		if (!empty($_POST['career-ambito-laboral'])) {

			$data1 = $_POST['career-ambito-laboral'];
			update_post_meta($post_id, '_career-ambito-laboral', $data1);
		}

		if (!empty($_POST['career-perfil-egresado'])) {

			$data2 = $_POST['career-perfil-egresado'];
			update_post_meta($post_id, '_career-perfil-egresado', $data2);
		}

		if (!empty($_POST['career-link-video'])) {

			$data3 = $_POST['career-link-video'];
			update_post_meta($post_id, '_career-link-video', $data3);
		}

		if (!empty($_POST['career-certificaciones'])) {

			$data4 = $_POST['career-certificaciones'];
			update_post_meta($post_id, '_career-certificaciones', $data4);
		}
	    if (!empty($_POST['career-plan-estudios'])) {

			$data5 = $_POST['career-plan-estudios'];
			update_post_meta($post_id, '_career-plan-estudios', $data5);
		}
		if (!empty($_POST['career-horario-clases'])) {

			$data6 = $_POST['career-horario-clases'];
			update_post_meta($post_id, '_career-horario-clases', $data6);
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

	function save_post_education_document($post_id) {

		if (!empty($_POST['transparency_documents'])) {
			//_log('savee');
			update_post_meta($post_id, '_transparency_documents', json_encode($_POST['transparency_documents']));
		}
	}
	add_action('save_post_education-documents', 'save_post_education_document');
	function my_login_logo() {
?>
        <link href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;500;700&display=swap" rel="stylesheet">
        <style type="text/css">
            #login h1 a, .login h1 a {
                
                background-image: url(<?php echo get_stylesheet_directory_uri(); ?>/img/5_150x150.png);
                /*background-image: url(https://edukate.pe/tru3-iestpmgp/wp-content/uploads/2022/09/logo-MGP.png);*/
                height: 150px;
                width: 150px;
                background-size: contain;
                background-repeat: no-repeat;
                padding-bottom: 22px;
                position: relative;
            }
            #login h1 a::after {
                content: 'IESTP "Laredo"';
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
            /*background-image: url(https://edukate.pe/tru3-iestpmgp/wp-content/uploads/2022/09/logo-MGP.png) !important;*/
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
    //hook into the administrative header output
    add_action('wp_before_admin_bar_render', 'wpb_custom_logo');
?>