<?php get_header(); ?>

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
        font-size: 16px;
        color: #656565;
        margin-bottom: 10px;
    }
    article a {
        text-decoration: none;
        color: #515151;
        font-family: Roboto Flex;
        font-size: 18px;
    }
    .documents-page-grid h1  {
        font-family: Roboto Flex;
        color: #fff;
        font-size: 40px;
    }
    .documents-page-grid h2  {
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
        grid-template-columns: repeat(3, 1fr);
        grid-gap: 20px
    }
    @media screen and (max-width: 768px) {
        .documents-page-grid {
            display: grid;
            grid-template-columns: repeat(1, 1fr);
            grid-gap: 20px
        }
    }
    .hero :is(h1, h2, h3, h4, h5, h6) {
        color: #fff;
        font-size: 38px;
    }
    .hero :is(h1, h2) {
        text-transform: lowercase !important;
        padding: 0;
    }
    .hero :is(h1, h2):first-letter {
        text-transform: uppercase;
    }
</style>
    <section class="no-padding-y hero" style="min-height: 100px; background-image: url(<?php echo get_template_directory_uri() .'/img/biblio-indiana.jpg'; ?>); background-size: cover; background-position: center; position: relative;">
		<div class="overlay" style="position: absolute; inset: 0; background-color: rgba(0, 0, 0, 0.3)"></div>
		<div class="content" style="align-items: flex-start; justify-content: center; height: 300px; position: relative;">
			<h1 style="text-transform: uppercase; font-family: Roboto Flex; font-size: 40px; color: #fff"><?php the_title(); ?></h1>
		</div>
	</section>
	<section class="theme-bg no-padding-y">
		<div class="content">
		    <?php
		        function get_breadcrumbs() {
		            
                    // Set variables for later use
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
                
                    /** 
                     * Set our own $wp_the_query variable. Do not use the global variable version due to 
                     * reliability
                     */
                    $wp_the_query   = $GLOBALS['wp_the_query'];
                    $queried_object = $wp_the_query->get_queried_object();
                
                    // Handle single post requests which includes single pages, posts and attatchments
                    if ( is_singular() ) 
                    {
                        /** 
                         * Set our own $post variable. Do not use the global variable version due to 
                         * reliability. We will set $post_object variable to $GLOBALS['wp_the_query']
                         */
                        $post_object = sanitize_post( $queried_object );
                
                        // Set variables 
                        $title          = apply_filters( 'the_title', $post_object->post_title );
                        $parent         = $post_object->post_parent;
                        $post_type      = $post_object->post_type;
                        $post_id        = $post_object->ID;
                        $post_link      = $before . $title . $after;
                        $parent_string  = '';
                        $post_type_link = '';
                
                        if ( 'post' === $post_type ) 
                        {
                            // Get the post categories
                            $categories = get_the_category( $post_id );
                            if ( $categories ) {
                                // Lets grab the first category
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
                
                        // Get post parents if $parent !== 0
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
                
                        // Lets build the breadcrumb trail
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
                
                    // Handle archives which includes category-, tag-, taxonomy-, date-, custom post type archives and author archives
                    if( is_archive() )
                    {
                        if (    is_category()
                             || is_tag()
                             || is_tax()
                        ) {
                            // Set the variables for this section
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
                                // Get all the current term ancestors
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
                            // Set default variables
                            $year     = $wp_the_query->query_vars['year'];
                            $monthnum = $wp_the_query->query_vars['monthnum'];
                            $day      = $wp_the_query->query_vars['day'];
                
                            // Get the month name if $monthnum has a value
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
                
                    // Handle the search page
                    if ( is_search() ) {
                        $breadcrumb_trail = __( 'Search query for: ' ) . $before . get_search_query() . $after;
                    }
                
                    // Handle 404's
                    if ( is_404() ) {
                        $breadcrumb_trail = $before . __( 'Error 404' ) . $after;
                    }
                
                    // Handle paged pages
                    if ( is_paged() ) {
                        $current_page = get_query_var( 'paged' ) ? get_query_var( 'paged' ) : get_query_var( 'page' );
                        $page_addon   = $before . sprintf( __( ' ( Page %s )' ), number_format_i18n( $current_page ) ) . $after;
                    }
                
                    $breadcrumb_output_link  = '';
                    $breadcrumb_output_link .= '<div class="breadcrumb">';
                    if (    is_home()
                         || is_front_page()
                    ) {
                        // Do not show breadcrumbs on page one of home and frontpage
                        if ( is_paged() ) {
                            $breadcrumb_output_link .= $here_text . $delimiter;
                            $breadcrumb_output_link .= '<a href="' . $home_link . '">' . $home_text . '</a>';
                            $breadcrumb_output_link .= $page_addon;
                        }
                    } else {
                        //$breadcrumb_output_link .= $here_text . $delimiter;
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
	<section style="z-index: 1; position: relative;">
	    <div class="content">
	        <div class="heading" data-block="heading">
	            <h2>Sistemas de información</h2>
	        </div>
	        <div class="documents-page-grid" style="margin-bottom: 18px">
        		<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
                	<header class="entry-header">
                	    <?php
                	        $link = get_permalink();
                	    ?>
                	    <i class="fa fa-laptop fa-3x"></i>
                	</header>
                	<div class="entry-content">
                	    <div>
                	        <h2>REGISTRA - Sistema de Información de Gestión Académica</h2>
                	    </div>
                	    <div class="description">
                	        Apoyo a la gestión académica de los institutos de educación superior que permite gestionar los procesos de admisión, matrícula y evaluaciones de estudiantes.
                	    </div>
                	    <div class="button" data-block="button">
                	        <a class="link" href="https://registra.minedu.gob.pe/" target="_blank">Ingresar al sistema</a>
                	    </div>
                	</div>
                </article>
                <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
                	<header class="entry-header">
                	    <?php
                	        $link = get_permalink();
                	    ?>
                	    <i class="fa fa-laptop fa-3x"></i>
                	</header>
                	<div class="entry-content">
                	    <div>
                	        <h2>TITULA - Sistema de Información de Grados y Títulos</h2>
                	    </div>
                	    <div class="description">
                	        Registro de grados y títulos de los institutos de educación superior que permite su posterior incorporación en el Registro Nacional de Certificados, Grados y Títulos a cargo del Ministerio de Educación, en el marco de la Ley N.° 30512, Ley de Institutos y Escuelas de Educación Superior y de la Carrera Pública de sus Docentes.
                	    </div>
                	    <div class="button" data-block="button">
                	        <a class="link" href="https://titula.minedu.gob.pe/" target="_blank">Ingresar al sistema</a>
                	    </div>
                	</div>
                </article>
                <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
                	<header class="entry-header">
                	    <?php
                	        $link = get_permalink();
                	    ?>
                	    <i class="fa fa-laptop fa-3x"></i>
                	</header>
                	<div class="entry-content">
                	    <div>
                	        <h2>CONECTA - Sistema de seguimiento de egresados</h2>
                	    </div>
                	    <div class="description">
                	        Sistema de información sobre los egresados de los Institutos de Educación Superior Tecnológica e Institutos de Educación Superior relacionado a su trayectoria e inserción laboral en cumplimiento de la Ley N.° 30512, Ley de Institutos y Escuelas de Educación Superior y de la Carrera Pública de sus Docentes.
                	    </div>
                	    <div class="button" data-block="button">
                	        <a class="link" href="https://conecta.minedu.gob.pe/" target="_blank">Ingresar al sistema</a>
                	    </div>
                	</div>
                </article>
    	    </div>
    	    <div class="heading" data-block="heading">
	            <h2>Consulta de títulos</h2>
	        </div>
	        <div class="paragraph" data-block="paragraph" style="margin-bottom: 18px">
	            <div class="content">
	                <p style="text-align: justify">Aquí podrás consultar los títulos de institutos de educación superior que figuran en el Registro Nacional de Certificados, Grados y Títulos a cargo del Ministerio de Educación, creado a partir de noviembre de 2015 en el marco de la Ley N.° 30512, Ley de Institutos y Escuelas de Educación Superior y de la Carrera Pública de sus Docentes.</p>
	            </div>
	        </div>
    	    <div class="button">
    	        <a class="link" href="https://titulosinstitutos.minedu.gob.pe/" target="_blank" style="font-size: 18px"><i class="fa fa-search" style="margin-right: 6px"></i><span>Consulta de titulo</span></a>
    	    </div>
        </div>
    </section>
<?php endif; ?>
<?php get_footer(); ?>
