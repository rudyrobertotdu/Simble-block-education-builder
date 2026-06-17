<?php
/**
 * blocks.php
 *
 * Registro de bloques "server-side" que exponen callbacks PHP para ser
 * renderizados desde el servidor. Cada bloque registrado aquí devuelve
 * HTML ya procesado por PHP (útil para listados, menús y componentes
 * dependientes de consultas a la base de datos).
 *
 * Responsabilidad:
 * - Registrar `navigation`, `posts-grid`, `breadcrumb` y otros bloques
 *   con `Blocks_Editor::register_server_block`
 * - Mantener la lógica de renderizado que requiere acceso a DB o WP APIs
 */
Blocks_Editor::register_server_block('navigation', [
		'server_render_callback' => function($settings) {

			_log($settings);

			if ($settings['menuID']) {
				
				$menu_args = [
					'menu' => $settings['menuID'],
					'theme_location' => 'header-menu',
					'container' => 'ul',
					'menu_class' => 'menu-item-list',
					'echo' => false
				];

				$nav_menu = wp_nav_menu($menu_args);

			} else {
				$nav_menu = '<div style="display: flow-root"><h1>No selecciono un menu</h1></div>';
			}
			return $nav_menu;
		}
	]);
	Blocks_Editor::register_server_block('posts-grid', [
		'server_render_callback' => function($settings) {

			if ($settings['postType']) {
				
				$db = new WP_Database();
				$posts = $db->query("SELECT thumb.ID AS thumb_ID, thumb.guid AS thumb_url, post.post_ID, post.post_title, post.post_name, post.post_date, post.post_excerpt
				FROM {$db->prfx}posts AS thumb
				RIGHT JOIN (
					SELECT ID AS post_ID, post_title, post_name, post_date, post_excerpt, meta_value AS thumb_id
					FROM {$db->prfx}posts
					LEFT JOIN {$db->prfx}postmeta ON ID = post_id AND meta_key = '_thumbnail_id'
					WHERE post_type = 'education-news' AND post_status = 'publish'
				) AS post 
				ON post.thumb_id = thumb.ID ORDER BY post.post_date DESC");

				$count = 1;
				$length = count($posts);
				$post_html = ""; 
				$uri = get_template_directory_uri(); 
				$path = $uri .'/classes/blocks-editor';
				$slider_html = "";
				$format = get_option('date_format');
				$type = 'noticias';

				foreach ($posts as $key => $post) {

					$date = mysql2date($format, $post['post_date']);
					$link = home_url() . (($type == 'page' || $type == 'post') ? '' : '/'. $type) .'/'. $post['post_name'];
					$thumb = $post['thumb_url'] ?: $path .'/img/image-placeholder.jpg';

					$post_html .= 
						"<a class='post' style='display: block; text-decoration: none; background-image: url($thumb); background-size: cover; background-position: center;' href='$link'>
							<!--<div class='overlay'><img src='{$thumb}'/></div>-->
							<!--<div class='content'>-->
								<div class='date'>
									<i class='fa fa-calendar'></i><span>$date</span>
								</div>
								<div class='title'>{$post['post_title']}</div>
							<!--</div>-->
						</a>";

					if ($count % 4 == 0 || $count == $length) {

						$slider_html .= "<div class='posts-grid_slide'><div class='posts-list'>$post_html</div></div>"; // Se envuelve en un div extra porque el plugin slick cambia la propiedad display del item del slider a inline-block
						$post_html = "";
					}
					$count++;
				}

				return $slider_html;
			} else {
				$nav_menu = '<div style="display: flow-root"><h1>No selecciono un menu</h1></div>';
			}
			return $nav_menu;
		}
	]);
	Blocks_Editor::register_server_block('breadcrumb', [
		'server_render_callback' => function($settings) {

			$here_text        = __( '' );
			$home_link        = home_url('/');
			$home_text        = __( 'Home' );
			$link_before      = '<span typeof="v:Breadcrumb">';
			$link_after       = '</span>';
			$link_attr        = ' rel="v:url" property="v:title"';
			$link             = $link_before . '<a' . $link_attr . ' href="%1$s">%2$s</a>' . $link_after;
			$delimiter        = '<i class="fa fa-chevron-right"></i>';              // Delimiter between crumbs
			$before           = '<span class="current">'; // Tag before the current crumb
			$after            = '</span>';                // Tag after the current crumb
			$page_addon       = '';                       // Adds the page number if the query is paged
			$breadcrumb_trail = '';
			$category_links   = '';

			$wp_the_query   = $GLOBALS['wp_the_query'];
			$queried_object = $wp_the_query->get_queried_object();

			if ( is_singular() ) {
			    $post_object = sanitize_post( $queried_object );

			    $title          = apply_filters( 'the_title', $post_object->post_title );
			    $parent         = $post_object->post_parent;
			    $post_type      = $post_object->post_type;
			    $post_id        = $post_object->ID;
			    $post_link      = $before . $title . $after;
			    $parent_string  = '';
			    $post_type_link = '';

			    if ( 'post' === $post_type ) 
			    {
			        $categories = get_the_category( $post_id );
			        if ( $categories ) {
			            $category  = $categories[0];
						$category_links = get_category_parents( $category, true, $delimiter );
			            $category_links = str_replace( '<a',   $link_before . '<a' . $link_attr, $category_links );
			            $category_links = str_replace( '</a>', '</a>' . $link_after,             $category_links );
			        }
			    }

			    if ( !in_array( $post_type, ['post', 'page', 'attachment'] ) )
			    {
			        $post_type_object = get_post_type_object( $post_type );
			        $archive_link     = esc_url( get_post_type_archive_link( $post_type ) );

			        $post_type_link   = sprintf( $link, $archive_link, $post_type_object->labels->singular_name );
			    }

			    if ( 0 !== $parent ) 
			    {
			        $parent_links = [];
			        while ( $parent ) {
			            $post_parent = get_post( $parent );

			            $parent_links[] = sprintf( $link, esc_url( get_permalink( $post_parent->ID ) ), get_the_title( $post_parent->ID ) );

			            $parent = $post_parent->post_parent;
			        }

			        $parent_links = array_reverse( $parent_links );

			        $parent_string = implode( $delimiter, $parent_links );
			    }

			    if ( $parent_string ) {
			        $breadcrumb_trail = $parent_string . $delimiter . $post_link;
			    } else {
			        $breadcrumb_trail = $post_link;
			    }

			    if ( $post_type_link )
			        $breadcrumb_trail = $post_type_link . $delimiter . $breadcrumb_trail;

			    if ( $category_links )
			        $breadcrumb_trail = $category_links . $breadcrumb_trail;
			}

			if( is_archive() )
			{
			    if (    is_category()
			         || is_tag()
			         || is_tax()
			    ) {
			        $term_object        = get_term( $queried_object );
			        $taxonomy           = $term_object->taxonomy;
			        $term_id            = $term_object->term_id;
			        $term_name          = $term_object->name;
			        $term_parent        = $term_object->parent;
			        $taxonomy_object    = get_taxonomy( $taxonomy );
			        $current_term_link  = $before . $taxonomy_object->labels->singular_name . ': ' . $term_name . $after;
			        $parent_term_string = '';

			        if ( 0 !== $term_parent )
			        {
			            $parent_term_links = [];
			            while ( $term_parent ) {
			                $term = get_term( $term_parent, $taxonomy );

			                $parent_term_links[] = sprintf( $link, esc_url( get_term_link( $term ) ), $term->name );

			                $term_parent = $term->parent;
			            }

			            $parent_term_links  = array_reverse( $parent_term_links );
			            $parent_term_string = implode( $delimiter, $parent_term_links );
			        }

			        if ( $parent_term_string ) {
			            $breadcrumb_trail = $parent_term_string . $delimiter . $current_term_link;
			        } else {
			            $breadcrumb_trail = $current_term_link;
			        }

			    } elseif ( is_author() ) {

			        $breadcrumb_trail = __( 'Author archive for ') .  $before . $queried_object->data->display_name . $after;

			    } elseif ( is_date() ) {
			        $year     = $wp_the_query->query_vars['year'];
			        $monthnum = $wp_the_query->query_vars['monthnum'];
			        $day      = $wp_the_query->query_vars['day'];

			        if ( $monthnum ) {
			            $date_time  = DateTime::createFromFormat( '!m', $monthnum );
			            $month_name = $date_time->format( 'F' );
			        }

			        if ( is_year() ) {

			            $breadcrumb_trail = $before . $year . $after;

			        } elseif( is_month() ) {

			            $year_link        = sprintf( $link, esc_url( get_year_link( $year ) ), $year );

			            $breadcrumb_trail = $year_link . $delimiter . $before . $month_name . $after;

			        } elseif( is_day() ) {

			            $year_link        = sprintf( $link, esc_url( get_year_link( $year ) ),             $year       );
			            $month_link       = sprintf( $link, esc_url( get_month_link( $year, $monthnum ) ), $month_name );

			            $breadcrumb_trail = $year_link . $delimiter . $month_link . $delimiter . $before . $day . $after;
			        }

			    } elseif ( is_post_type_archive() ) {

			        $post_type        = $wp_the_query->query_vars['post_type'];
			        $post_type_object = get_post_type_object( $post_type );

			        $breadcrumb_trail = $before . $post_type_object->labels->singular_name . $after;

			    }
			}   

			if ( is_search() ) {
			    $breadcrumb_trail = __( 'Search query for: ' ) . $before . get_search_query() . $after;
			}

			if ( is_404() ) {
			    $breadcrumb_trail = $before . __( 'Error 404' ) . $after;
			}

			if ( is_paged() ) {
			    $current_page = get_query_var( 'paged' ) ? get_query_var( 'paged' ) : get_query_var( 'page' );
			    $page_addon   = $before . sprintf( __( ' ( Page %s )' ), number_format_i18n( $current_page ) ) . $after;
			}

			$breadcrumb_output_link  = '';
			$breadcrumb_output_link .= '<div class="breadcrumb">';

			if (is_home() || is_front_page()) {
			    if ( is_paged() ) {
			        $breadcrumb_output_link .= $here_text . $delimiter;
			        $breadcrumb_output_link .= '<a href="' . $home_link . '">' . $home_text . '</a>';
			        $breadcrumb_output_link .= $page_addon;
			    }
			} else {
			    $breadcrumb_output_link .= $here_text;
			    $breadcrumb_output_link .= '<a href="' . $home_link . '" rel="v:url" property="v:title">' . $home_text . '</a>';
			    $breadcrumb_output_link .= $delimiter;
			    $breadcrumb_output_link .= $breadcrumb_trail;
			    $breadcrumb_output_link .= $page_addon;
			}
			$breadcrumb_output_link .= '</div><!-- .breadcrumbs -->';

			return $breadcrumb_output_link;
		}
	]);
?>