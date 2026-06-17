<?php
/**
 * archive-education-careers.php
 *
 * Archivo de archivo para el custom post type `education-careers`.
 * Propósito:
 * - Mostrar programas de estudio en un layout de tarjetas
 * - Utiliza estilos inline para controlar la presentación localmente
 */
get_header(); ?>

<?php if ( have_posts() ) : ?>
<style>
    article {
        display: flex;
        flex-direction: column;
        gap: 15px;
        border-radius: 8px;
        border: 1px solid #bebebe;
        margin-bottom: 14px;
        overflow: hidden;
    }
    article .entry-header {
        min-width: 0;
        flex-grow: 1;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        display: flex;
        align-items: center;
        justify-content: center;
        aspect-ratio: 4 / 1;
        flex-shrink: 0;
        min-height: 0;
        flex-grow: 0;
        padding: 10px;
        background: var(--text-color);
    }
    article .entry-header i {
        color: #fff;
    }
    article .entry-content {
        padding: 12px;
        display: flex;
        flex-direction: column;
        flex-grow: 1;
    }
    article .button {
        margin-top: auto;
    }
    article i {
        color: var(--text-color);
    }
    article img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }
    article .entry-title {
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    article .description {
        text-align: center;
        font-family: Roboto Flex;
        font-size: 18px;
        color: #656565;
        margin-bottom: 10px;
    }
    article a {
        text-decoration: none;
        color: #515151;
        font-family: Roboto Flex;
        font-size: 18px;
    }
    h1  {
        font-family: Roboto Flex;
        color: #fff;
        font-size: 40px;
    }
    h2  {
        font-family: Roboto Flex;
        color: #383838;
        font-size: 18px;
        margin-top: 0;
        text-align: center;
    }
    .button a {
        display: block;
        font-size: 16px;
        text-align: center;
        font-size: 16px;
    }
    .documents-page-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        grid-gap: 20px
    }
    @media screen and (max-width: 768px) {
        .documents-page-grid {
            display: grid;
            grid-template-columns: repeat(1, 1fr);
            grid-gap: 20px
        }
    }
</style>
    <section class="no-padding-y" style="min-height: 100px; background-image: url(<?php echo get_template_directory_uri() .'/img/edu-banner.jpg'; ?>); background-size: cover; background-position: center; position: relative;">
		<div class="overlay" style="position: absolute; inset: 0; background-color: rgba(0, 0, 0, 0.3)"></div>
		<div class="content" style="align-items: flex-start; justify-content: center; height: 300px; position: relative;">
			<h1 class="">PROGRAMAS DE ESTUDIO</h1>
		</div>
	</section>
	<section class="theme-bg no-padding-y">
		<div class="content">
		    <?php
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
		    ?>
		</div>
	</section>
	<section style="z-index: 1; position: relative;" class="careers-list">
	    <div class="content">
	        <div class="call-to-action-group" data-block="call-to-action-group" style="--columns-number:3;"><div class="call-to-action" data-block="call-to-action">
			<div class="cta-image">
				<img src="https://edukate.pe/otz21-iestpo/wp-content/uploads/2022/08/agropecuar-2020_01_27_221544@2x.jpg" alt="" width="626" height="417">
				<div class="overlay"></div>
			</div>
			<div class="cta-content">
				<h2 class="title">Producción Agropecuaria</h2>
				<a class="button" href="https://edukate.pe/otz21-iestpo/programas-estudio/produccion-agropecuaria/">VER MÁS</a>
			</div>
		 </div><div class="call-to-action" data-block="call-to-action">
			<div class="cta-image">
				<img src="https://edukate.pe/otz21-iestpo/wp-content/uploads/2022/08/contabilidad-una-aproximacion-conceptual.jpg" alt="" width="900" height="400">
				<div class="overlay"></div>
			</div>
			<div class="cta-content">
				<h2 class="title">Contabilidad</h2>
				<a class="button" href=" https://edukate.pe/otz21-iestpo/programas-estudio/contabilidad/">VER MÁS</a>
			</div>
		 </div><div class="call-to-action" data-block="call-to-action">
			<div class="cta-image">
				<img src="https://edukate.pe/otz21-iestpo/wp-content/uploads/2022/08/tecnica-enfermeria-1.jpg" alt="" width="1600" height="900">
				<div class="overlay"></div>
			</div>
			<div class="cta-content">
				<h2 class="title">Enfermería Técnica</h2>
				<a class="button" href="https://edukate.pe/otz21-iestpo/programas-estudio/enfermeria-tecnica/">VER MÁS</a>
			</div>
		 </div></div>
        </div>
    </section>
<?php endif; ?>
<?php get_footer(); ?>
