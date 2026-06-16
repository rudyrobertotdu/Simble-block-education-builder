	<footer style="border-top: 8px solid var(--primary-color)">
	    <?php echo Blocks_Editor::get_template('footer'); ?>
	</footer>
	<template id="tpl">
    	<section class="theme-bg no-padding-y">
    		<div class="content">
    	        <div class="bread">
    	    <?php
    	    if (!function_exists('get_breadcrumbs')) {
    	        function get_breadcrumbs() {
    	            
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
                
                    if ( is_singular() ) 
                    {
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
                    if (    is_home()
                         || is_front_page()
                    ) {
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
                echo get_breadcrumbs();
    	    }
    	    ?>
    	</div>
    	    </div>
    	</section>
    </template>
	<script>
	
	    var $ph = document.querySelector('.page-hero');
	    
	    if ($ph) {
	        
	        var $s = document.querySelector('main .section');
	        var $b = document.querySelector('#tpl');
	        
	        $s.insertAdjacentHTML('afterend', $b.content.firstElementChild.outerHTML);
	    }
	</script>
	<?php wp_footer(); ?>
</body>
</html>