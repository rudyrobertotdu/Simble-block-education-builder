<?php
	class Blocks_Editor {

		private static $server_blocks = [];
		private $path = '';
		private $ver = '1.0';

		public function __construct() {

			$this->ver = '1.'. rand(10, 9999);
			$this->path = get_template_directory_uri() .'/classes/blocks-editor';

			add_filter('style_loader_src', function($src, $handle) {

				_log('src handle '. $handle. ' '. $src);
				if ($handle == 'google-fonts') {

					$src = urldecode($src);
					$src = preg_replace('/\[[^\]]*\]/', '', $src);
					//$src = urlencode($src);
				}

				return $src;
			}, 0, 2);

			add_action('wp_enqueue_scripts', [$this, 'load_frontend_scripts']);
			add_action('admin_enqueue_scripts', [$this, 'load_backend_scripts']);

			add_action('wp_ajax_blocks-editor-request', [$this, 'handle_request']);
			add_action('wp_ajax_nopriv_blocks-editor-request', [$this, 'handle_request']);

			add_action('wp_ajax_blocks_editor_render_shortcode', [$this, 'ajax_render_shortcode']);
			add_action('wp_ajax_nopriv_blocks_editor_render_shortcode', [$this, 'ajax_render_shortcode']);

			add_action('admin_post_blocks-editor-request', [$this, 'handle_request']);
			add_action('admin_post_nopriv_blocks-editor-request', [$this, 'handle_request']);


			/*Ejecutar justo antes de renderizar los soportes - Remueve algunos metaboxes*/
			//add_action('edit_form_top', [$this, 'remove_post_supports']);

			/*Añadir items personalizados al sidebar menu del administrador*/
			add_action('admin_menu', [$this, 'add_admin_menu_items']);
			
			/*Oculta la barra del administrador cuando se esta logueado en el frontend*/
			//add_filter('show_admin_bar', [$this, 'hide_admin_bar_frontend']);
			
			add_filter('use_block_editor_for_post', '__return_false', 10);

			add_action('init', function() {

				add_rewrite_rule('^blocks-edit/?$', 'index.php?blocks-edit-mode=1', 'top');
				//flush_rewrite_rules();
			});

			/*Remueve los mensajes de actualizacion*/
			add_action('admin_head', function() {
				
				remove_action('admin_notices', 'update_nag', 3);
				remove_action('admin_notices', 'maintenance_nag', 10);
			});
			
			add_filter('query_vars', function($vars) {

				$vars[] = 'blocks-edit-mode';
				$vars[] = 'post-type';
				$vars[] = 'post-name'; //page-name
				$vars[] = 'post-template';

				return $vars;
			});
			add_action('pre_get_posts', function($wp_query) {

				/*function str_starts_with($haystack, $needle) {
					return $haystack[0] === $needle[0] ? strncmp($haystack, $needle, strlen($needle)) === 0 : false;
				}*/

				$is_tags = (function() use ($wp_query) {

					$all_props = get_object_vars($wp_query); //get_class_vars
					$tags_props = array_filter($all_props, function($prop) {

						return str_starts_with($prop, 'is_');

					}, ARRAY_FILTER_USE_KEY);

					return $tags_props;
				})();

				if (get_query_var('blocks-edit-mode')) {

					$post_type = get_query_var('post-type') ?? 'post';
					$post_name = get_query_var('post-name');
					$post_template = get_query_var('post-template') ?? 'single';

					if ($post_template == '404') {

						//$wp_query->set('pagename', get_query_var('page-name'));

						$wp_query->set_404();
						$wp_query->set('p', -1);

						$wp_query->is_home = false;
						$wp_query->is_singular = true;

						//$qv['p'] = -1;
						//$qv['post_type'] = 'any';
						//$qv['name'] = '--';

					} else if ($post_template == 'archive') {

						$wp_query->set('post_type', $post_type);

						$wp_query->is_home = false;
						$wp_query->is_archive = true;

					} else if ($post_template == 'singular') {

						if ($post_name !== '') {

							$wp_query->set('name', $post_name);
						} else {

							$wp_query->set('p', -1);

							add_filter('the_posts', function($posts) {

								_log('empty posts');
								_log($posts);

								return $this->create_fake_post();
							});
						}

						$wp_query->set('post_type', $post_type);

						$wp_query->is_home = false;
						$wp_query->is_singular = true;
						$wp_query->is_single = true;
					}
					//$wp_query->is_home = false;
				}

			});

			/*add_filter('template_include', [$this, 'filter_template_include']); <----*/

			add_filter('request', function($qv) {


				/*if (isset($qv['blocks-edit-mode'])) {

					_log('isset blocks-edit-mode page-name ->'. get_query_var('page-name'));

					$post_template = $qv['post-template'] ?? 'single';

					if ($post_template == '404') {

						$qv['p'] = -1;
						$qv['name'] = '--';
						//$qv['post_type'] = 'any';

					} else {

						$qv['pagename'] = $qv['page-name'];
					}
					//$wp_query->set('pagename', get_query_var('page-name'));
					//$wp_query->is_home = false;
				}*/
				return $qv;
			});
			//apply_filters( 'request', $this->query_vars )

			add_filter('posts_request', function($sql) {

				_log('blocks-editor - filter : posts_request -> print request sql');
				_log($sql);
				return $sql;
			});

			$this->init();
		}

		protected function init() {

			$db = new WP_Database();

			$table_specificity = "CREATE TABLE IF NOT EXISTS `wp_blocks_editor_specificity` (
				`ID` int(11) NOT NULL AUTO_INCREMENT,
				`post_page` varchar(50) NOT NULL,
				`post_type` varchar(100) NOT NULL,
				`post_name` varchar(100) NOT NULL,
				`template_id` varchar(10) NOT NULL,
				PRIMARY KEY (`ID`)
			) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;";

			/*$table_templates = "CREATE TABLE IF NOT EXISTS `wp_blocks_templates` (
				`ID` int(11) NOT NULL AUTO_INCREMENT,
				`template_name` varchar(50) NOT NULL,
				`template_section` varchar(20) NOT NULL,
				`template_structure` text NOT NULL,
				`template_html` text NOT NULL,
				PRIMARY KEY (`ID`)
			) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=1;";*/

			/*wp_blocks_editor_templates*/
			$table_templates = "CREATE TABLE IF NOT EXISTS `wp_blocks_editor_templates` (
				`ID` int(11) NOT NULL AUTO_INCREMENT,
				`template_name` varchar(50) NOT NULL,
				`template_section` varchar(20) NOT NULL,
				`template_structure` text NOT NULL,
				`template_html` text NOT NULL,
				`template_config` text NOT NULL,
				`template_blocks` text NOT NULL,
				PRIMARY KEY (`ID`)
			) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=1;";

			$table_blocks_beta = "CREATE TABLE IF NOT EXISTS `wp_blocks_editor_beta` (
				`ID` int(11) NOT NULL AUTO_INCREMENT,
				`blocks_name` varchar(50) NOT NULL,
				`blocks_structure` text NOT NULL,
				`blocks_html` text NOT NULL,
				PRIMARY KEY (`ID`)
			) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=1;";

			$db->query($table_templates);
			$db->query($table_specificity);
			$db->query($table_blocks_beta);
		}

		public function load_frontend_scripts() {

			wp_enqueue_style('blocks-editor_google-fonts', 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Source+Sans+Pro:wght@300;400;600&family=Lato:wght@300;400;700&family=Open+Sans:wght@300;400;500;600&family=Albert+Sans:wght@400;500;600;700&family=Montserrat:wght@300;400;500;600&family=Roboto+Flex:wght@400;500;600&family=Poppins:wght@300;400;500&family=Rubik:wght@300;400;500;600&family=Arimo:wght@400;500;600&display=swap', [], null);
			
			wp_enqueue_style('blocks-editor_slick', $this->path .'/lib/slick/slick.css', [], $this->ver);
			wp_enqueue_style('blocks-editor_slick-theme', $this->path .'/lib/slick/slick-theme.css', [], $this->ver);
			wp_enqueue_script('blocks-editor_slick', $this->path .'/lib/simple-lightbox/simple-lightbox.min.js', ['jquery'], $this->ver, false);

			wp_enqueue_style('blocks-editor_light', $this->path .'/lib/simple-lightbox/simple-lightbox.min.css', [], $this->ver);
			wp_enqueue_style('blocks-editor_slick-theme', $this->path .'/lib/lib/simple-lightbox/demo.css', [], $this->ver);
			wp_enqueue_script('blocks-editor_light-js', $this->path .'/lib/slick/slick.min.js', ['jquery'], $this->ver, false);


			wp_enqueue_style('blocks-editor_blocks', $this->path .'/css/_blocks.css', [], $this->ver);
			wp_enqueue_style('blocks-editor_theme', $this->path .'/css/_theme.css', [], $this->ver);
			wp_enqueue_style('blocks-editor_font-awesome', $this->path .'/css/font-awesome/font-awesome.css', false, $this->ver);

			wp_enqueue_script('blocks-editor_frontend', $this->path .'/js/_frontend.js', ['jquery'], $this->ver, true);
		}

		public function load_backend_scripts($hook) {

			$hook_parts = explode('_page_', $hook);
			$menu_slug = array_pop($hook_parts);

			/*Se le coloca null en el ultimo parametro para evitar que al pasar por la funcion _css_href de class.wp-styles.php se le añada el argumento "ver" y por lo tanto se modifique la url borrandole los parametros con nombres repetidos como family*/
			//wp_enqueue_style('blocks-editor_google-fonts', 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Source+Sans+Pro:wght@300;400;600&family=Lato:wght@300;400;700&family=Open+Sans:wght@300;400;500;600&display=swap', [], null);
			wp_enqueue_style('blocks-editor_google-fonts', 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Source+Sans+Pro:wght@300;400;600&family=Lato:wght@300;400;700&family=Open+Sans:wght@300;400;500;600&family=Albert+Sans:wght@400;500;600;700&family=Montserrat:wght@300;400;500;600&family=Roboto+Flex:wght@400;500;600&family=Poppins:wght@300;400;500&family=Rubik:wght@300;400;500;600&family=Arimo:wght@400;500;600&display=swap', [], null);

			wp_enqueue_style('blocks-editor_font-awesome', $this->path .'/css/font-awesome/font-awesome.css', false, $this->ver);

			wp_enqueue_style('blocks-editor_slick', $this->path .'/lib/slick/slick.css', [], $this->ver);
			wp_enqueue_style('blocks-editor_slick-theme', $this->path .'/lib/slick/slick-theme.css', [], $this->ver);
			wp_enqueue_script('blocks-editor_slick', $this->path .'/lib/slick/slick.min.js', ['jquery'], $this->ver, false);

			if ($menu_slug == 'create-template' || $menu_slug == 'edit-template') {

				wp_enqueue_style('blocks-editor', $this->path .'/css/blocks-editor.css', [], $this->ver);
			}

			if ($menu_slug == 'blocks-editor-beta') {
				
				wp_enqueue_media();
				/*AQUI VAN LOS SCRIPTS (ORIGIN)*/
				wp_enqueue_script('blocks-editor_main', $this->path .'/js/main-block_.js', ['jquery'], $this->ver, false); //Test
				wp_enqueue_script('blocks-editor_blocks', $this->path .'/js/blocks-editor_.js', ['jquery'], $this->ver, false);
				wp_enqueue_style('blocks-editor', $this->path .'/css/block-editor_.css', [], $this->ver);
			}

			if ($menu_slug == 'blocks-editor-v2') {

				wp_enqueue_media();
				//wp_enqueue_style('blocks-editor', $this->path .'/css/block-editor_.css', [], $this->ver);
				wp_enqueue_style('blocks-editor_blocks', $this->path .'/css/blocks_.css', [], $this->ver);
				wp_enqueue_script('blocks-editor_blocks', $this->path .'/js/blocks_.js', ['jquery'], $this->ver, true);
				wp_enqueue_script('blocks-editor-editor', $this->path .'/js/editor_.js', ['jquery'], $this->ver, true);
			}

			if ($menu_slug == 'blocks-editor' || $menu_slug == 'list-blocks-templates' || $menu_slug == 'blocks-template' || $menu_slug == 'site-templates') {

				wp_enqueue_media();

				wp_enqueue_style('simditor-styles', $this->path .'/lib/simditor/css/simditor.css', false, $this->ver);
				wp_enqueue_script('simditor-module-scripts', $this->path .'/lib/simditor/js/module.js', array('jquery'), $this->ver, false);
				wp_enqueue_script('simditor-hotkeys-scripts', $this->path .'/lib/simditor/js/hotkeys.js', array('jquery'), $this->ver, false);
				wp_enqueue_script('simditor-scripts', $this->path .'/lib/simditor/js/simditor.js', array('jquery'), $this->ver, false);

				wp_enqueue_style('blocks-editor_uix', $this->path .'/lib/uix/uix.css', [], $this->ver);
				wp_enqueue_script('blocks-editor_uix_scripts', $this->path .'/lib/uix/uix.js', ['jquery'], $this->ver, false);

				wp_enqueue_style('blocks-editor_blocks', $this->path .'/css/_blocks.css', [], $this->ver);
				wp_enqueue_script('blocks-editor_blocks', $this->path .'/js/_blocks.js', [], $this->ver, true);

				wp_enqueue_style('blocks-editor-styles', $this->path .'/css/_editor.css', [], $this->ver);
				wp_enqueue_script('blocks-editor-scripts', $this->path .'/js/_editor.js', [], $this->ver, true);

				wp_enqueue_script('blocks-editor-start', $this->path .'/js/_start.js', [], $this->ver, true);

				wp_localize_script('blocks-editor-scripts', 'editor_vars', [
					'editor_path' => $this->path,
					'ajax_url' => admin_url('admin-ajax.php')
				]);
				wp_localize_script('blocks-editor_uix_scripts', 'uix_vars', [
					'nav_menus' => wp_get_nav_menus()
				]);
			}

			$id = (function() {

				//$db = new WP_Database();
				//$result = $db->query("SELECT * FROM wp_blocks_beta ORDER BY ID DESC LIMIT 1");
				
				//return $result[0];
			})();

			/*AQUI VAN LOS SCRIPTS (PLACE)*/

			wp_localize_script('blocks-editor_blocks', 'js_vars', [
				'admin_url' => admin_url('admin.php'),
				'blocks_structure' => $id
			]);
			wp_localize_script('blocks-editor_main', 'editor_vars', [
				'editor_path' => $this->path
			]);
			wp_enqueue_style('simditor-styles', $this->path .'/lib/simditor/css/simditor.css', false, $this->ver);
			wp_enqueue_script('simditor-module-scripts', $this->path .'/lib/simditor/js/module.js', array('jquery'), $this->ver, false);
			wp_enqueue_script('simditor-hotkeys-scripts', $this->path .'/lib/simditor/js/hotkeys.js', array('jquery'), $this->ver, false);
			wp_enqueue_script('simditor-scripts', $this->path .'/lib/simditor/js/simditor.js', array('jquery'), $this->ver, false);
			//wp_enqueue_style('blocks_editor-admin', $this->path .'/css/blocks-editor-ui.css', [], $this->ver);
		}

		public function handle_request() {

			$db = new WP_Database();
			// Accept handler and data via POST or GET (admin-post.php may send via GET)
			$data = $_REQUEST['data'] ?? [];
			$handler = $_REQUEST['handler'] ?? null;

			switch ($handler) {

				case 'create-template':

					$data = $_POST['data'];

					$specificity_id = '';

					$template_id = $db->insert('blocks_templates', [
						'template_name' => $data['template_name'],
						'template_section' => $data['template_section']
					]);

					if ($template_id) {

						$specificity_id = $db->insert('blocks_specificity', [
							'template_id' => $template_id,
							'post_page' => $data['post_page'],
							'post_type' => $data['post_type']
						]);
					}

					($template_id && $specificity_id && wp_send_json_success(['id' => $template_id, 'section' => $_POST['section']])) || wp_send_json_error('Error desconocido');

				break;
				
				case 'save-blocks':

					/*wp_send_json_success($_POST);
					return false;*/

					if (!$data['blocks_id']) {

						$response = $db->insert('blocks_beta', [
							'blocks_name' => $data['blocks_name'] ?? 'Nombres',
							'blocks_structure' => stripslashes($data['blocks_structure']),
							'blocks_html' => stripslashes($data['blocks_html'])
						]);

					} else {

						$response = $db->update('blocks_beta', [
							'blocks_structure' => stripslashes($data['blocks_structure']),
							'blocks_html' => stripslashes($data['blocks_html'])
						], [
							'ID' => $data['blocks_id']
						]);
					}

					echo $response;
					wp_die();

				break;

				/*case 'create-blocks-template':

					$template_id = $db->insert('blocks_templates', [
						'template_name' => $data['template_name'],
						'template_section' => $data['template_section']
					]);

				break;*/

				case 'create-blocks-template':

					/*_log('CREATE');
					_log($data);*/

					// TEMPORARY LOG: record incoming template_html for debugging persistence issues
					if (isset($data['template_html'])) {
						$tpl_in = $data['template_html'];
						$len = is_string($tpl_in) ? strlen($tpl_in) : 0;
						_log('[TEMP] create-blocks-template incoming template_html length: '. $len);
						// log a snippet (max 2000 chars) to avoid huge logs
						_log('[TEMP] snippet: '. substr(is_string($tpl_in) ? $tpl_in : '', 0, 2000));
					} else {
						_log('[TEMP] create-blocks-template incoming template_html: <not set>');
					}

					// Normalize and sanitize shortcode contents inside the submitted HTML
					if (isset($data['template_html']) && is_string($data['template_html'])) {
						$raw_html = stripslashes($data['template_html']);
						$processed_html = $raw_html;
						libxml_use_internal_errors(true);
						$dom = new \DOMDocument();
						// Wrap fragment to ensure valid HTML
						$dom->loadHTML('<?xml encoding="utf-8" ?><div>' . $processed_html . '</div>');
						$xpath = new \DOMXPath($dom);
						$nodes = $xpath->query("//*[@data-block='shortcode' or contains(concat(' ', normalize-space(@class), ' '), ' shortcode ')]");
						if ($nodes && $nodes->length) {
							foreach ($nodes as $node) {
								$text = trim($node->textContent);
								// remove surrounding brackets and whitespace
								$inner = trim($text);
								$inner = trim($inner, "[] \t\n\r");
								if ($inner === '') {
									$new = '';
								} else {
									// Ensure wrapped in single brackets
									$new = '[' . $inner . ']';
									// Replace dangerous characters with spaces (keep letters, numbers, underscore, hyphen, brackets and whitespace)
									$new = preg_replace('/[^\p{L}\p{N}_\-\[\]\s]/u', ' ', $new);
									// collapse multiple spaces
									$new = preg_replace('/\s+/', ' ', $new);
									$new = trim($new);
									// ensure brackets remain
									if ($new !== '' && $new[0] !== '[') $new = '[' . $new . ']';
								}
								// replace node content with sanitized literal
								while ($node->firstChild) $node->removeChild($node->firstChild);
								$node->appendChild($dom->createTextNode($new));
							}
						}
						// extract inner HTML of wrapper div
						$wrapper = $dom->getElementsByTagName('div')->item(0);
						$innerHTML = '';
						if ($wrapper) {
							foreach ($wrapper->childNodes as $child) {
								$innerHTML .= $dom->saveHTML($child);
							}
						}
						$data['template_html'] = $innerHTML;
						_log('[TEMP] create-blocks-template processed template_html length: ' . strlen($data['template_html']));
					}

					if ($data['template_id'] == '0') {

						$template_id = $db->insert('blocks_editor_templates', [
							'template_name' => $data['template_name'],
							'template_section' => $data['template_section'],
							'template_structure' => stripslashes($data['template_structure']),
							'template_html' => stripslashes($data['template_html']),
						]);

						if ($template_id) {

							$db->insert('blocks_editor_specificity', [
								'post_page' => $data['post_page'],
								'post_type' => $data['post_type'],
								'post_name' => $data['post_name'],
								'template_id' => $template_id
							]);
						}

						wp_redirect(admin_url("admin.php?page=blocks-template&action=update&id=$template_id"));
						exit;

					} else {

						// Update template main fields and structure
						$tpl_id = intval($data['template_id']);
						$db->update('blocks_editor_templates', [
							'template_name' => $data['template_name'] ?? '',
							'template_section' => $data['template_section'] ?? '',
							'template_structure' => stripslashes($data['template_structure'] ?? ''),
							'template_html' => stripslashes($data['template_html'] ?? '')
						], [
							'ID' => $tpl_id
						]);

						// Update specificity (if exists) otherwise insert
						$spec_rows = $db->fetch('blocks_editor_specificity', 'template_id = '. $tpl_id, 'ID');
						if (!empty($spec_rows)) {
							$db->update('blocks_editor_specificity', [
								'post_page' => $data['post_page'] ?? '',
								'post_type' => $data['post_type'] ?? '',
								'post_name' => $data['post_name'] ?? ''
							], [ 'template_id' => $tpl_id ]);
						} else {
							$db->insert('blocks_editor_specificity', [
								'post_page' => $data['post_page'] ?? '',
								'post_type' => $data['post_type'] ?? '',
								'post_name' => $data['post_name'] ?? '',
								'template_id' => $tpl_id
							]);
						}

						wp_redirect(admin_url("admin.php?page=blocks-template&action=update&id={$tpl_id}"));
						exit;
					}

				break;

				case 'render-server-block':

					$callback = self::$server_blocks[$_POST['name']]['server_render_callback']($_POST['settings']);
					echo $callback;

					wp_die();
				break;

				case 'delete-blocks-template':

					$template_id = intval($_REQUEST['template_id'] ?? 0);
					if ($template_id <= 0) {
						wp_die('Invalid template id');
					}

					// Verify nonce
					$nonce = $_REQUEST['nonce'] ?? '';
					if (!wp_verify_nonce($nonce, 'delete_blocks_template_'. $template_id)) {
						wp_die('Nonce verification failed');
					}

					// Capability check
					if (!current_user_can('edit_posts')) {
						wp_die('Insufficient permissions');
					}

					// Delete specificity then template
					$db = new WP_Database();
					$db->query("DELETE FROM {$db->prfx}blocks_editor_specificity WHERE template_id = " . $template_id);
					$db->query("DELETE FROM {$db->prfx}blocks_editor_templates WHERE ID = " . $template_id);

					wp_redirect(admin_url('admin.php?page=site-templates'));
					exit;

				break;



				default:
				break;
			}
		}

		public function ajax_render_shortcode() {

			if (!current_user_can('edit_posts')) {
				echo 'Permission denied';
				wp_die();
			}

			$shortcode = wp_unslash($_POST['shortcode'] ?? '');
			$shortcode = trim($shortcode);

			if ($shortcode === '') {
				echo '';
				wp_die();
			}

			echo do_shortcode($shortcode);
			wp_die();
		}

		public static function parse_template($template) {

			return preg_replace_callback('/\[\[(.*)\]\]/', function($matches) {
			    
				$data = json_decode($matches[1], true);
				$html = self::$server_blocks[$data['element']]['server_render_callback'](
					$data['params'] ?? $data['settings']
				);

				return $html;

			}, $template);
		}
		public static function get_template($section) {

			/*$db = new WP_Database();
			$template = $db->fetch('blocks_editor_templates', 'ID = 1', 'ID, template_html');

			return $template[0]['template_html'];*/

			if (!$section)
				return false;

			$db = new WP_Database();

			// current page
			$template = $post_type = $page_name = '';

			if (is_singular()) {

				$template = 'single';
				$post_type = get_queried_object()->post_type;
				$page_name = get_queried_object()->post_name;

			} else if (is_post_type_archive()) {

				$template = 'archive';
				$post_type = get_queried_object()->name;

			} else if (is_tax()) {

				$template = 'taxonomy';
				$post_type = reset(get_taxonomies(['name' => get_queried_object()->taxonomy], 'objects'))->object_type[0];
			}

			$query_str = 
				"SELECT
					et.ID, 
					et.template_name, 
					et.template_section, 
					et.template_html, 
					ec.post_page,
					ec.post_type, 
					ec.post_name 
				FROM {$db->prfx}blocks_editor_templates et 
				JOIN {$db->prfx}blocks_editor_specificity ec ON et.ID = ec.template_id 
				WHERE et.template_section = '". $section ."' AND (ec.post_type = '' OR ec.post_type = '". $post_type. "') AND (ec.post_page = '". $template ."' OR ec.post_page = 'all') AND (ec.post_name = '". $page_name ."' OR ec.post_name = '')";
			$tpl_html = $db->query($query_str);

			_log('tpl html');
			_log($tpl_html);
			_log($template);
			_log($page_name);
			_log($post_type);
			
			if (!empty($tpl_html)){
				$parsed = self::parse_template($tpl_html[0]['template_html']);
				// Process WordPress shortcodes present in the template HTML
				return do_shortcode($parsed);
			} else {
				return 'vacio';
			}
			//return $tpl_html[0]['template_html'];
			//return json_decode($tpl_areas[0]['layout_areas'], true);
		}
		
		public function add_folded_admin_menu() {
		    
            add_filter("admin_body_class", "my_folded_menu", 10, 1);
            
            function my_folded_menu($classes) {
                
                return $classes." folded";
            }
		}
		
		public function add_admin_menu_items() {

			add_menu_page('Editor de sitio', 'Editor de sitio', 'activate_plugins', 'blocks-editor', [$this, 'render_blocks_editor_view'], 'dashicons-layout');
			 
			/*add_submenu_page('blocks-editor', 'Crear plantilla', 'Crear plantilla', 'activate_plugins', 'create-blocks-template', [$this, 'render_create_template_view']); //render_edit_blocks_page
			add_submenu_page('blocks-editor', 'Listar plantillas', 'Listar plantillas', 'activate_plugins', 'list-blocks-templates', [$this, 'render_blocks_templates_list_view']); //render_edit_blocks_page*/

			$template_editor = add_submenu_page(null, 'Editar plantilla', 'Editar plantilla', 'activate_plugins', 'blocks-template', [$this, 'render_blocks_template_view']); // design-section
			add_action('load-'. $template_editor, [$this, 'add_folded_admin_menu']); //add action when this subpage loads
			
			add_submenu_page('blocks-editor', 'Plantillas del sitio', 'Plantillas del sitio', 'activate_plugins', 'site-templates', [$this, 'render_blocks_templates_list_view']); // design-section
		}
		public function render_create_template_view() {

			include 'views/blocks-create-template.php';
		}
		public function render_blocks_editor_view() { //Main

			include 'views/blocks-editor.php';
		}

		public function render_blocks_templates_list_view() {

			include 'views/blocks-template-list.php';
		}

		public function render_blocks_template_view() {

			include 'views/blocks-template.php';
		}

		public static function register_server_block($name, $config) {

			self::$server_blocks[$name] = $config;
		}
	}
require_once 'blocks.php';