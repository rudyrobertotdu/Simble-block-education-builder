<?php get_header(); ?>
<main> 
	<style>
		.tabs {
			display: flex;
			flex-direction: column;
		}
		.tabs .tab-header {
			display: flex;
			align-items: flex-start;
			justify-content: flex-start;
		}
		.tabs .tab {
			border: none;
			background: none;
			padding: 12px 14px;
			border: 1px solid;
			background: #efefef;
			color: #848484;
			color: #676767;
			border-radius: 8px 8px 0 0;
			font-size: 17px;
			font-family: Open Sans;
			cursor: pointer;
			outline: none;
			border-color: #b6b6b6;
			border-color: #a1a1a1;
		}
		.tabs .tab[data-active] {
			background: #a12c2f;
			background: var(--text-color);
			border-color: var(--text-color);
			color: #fff;
		}
		.tabs-body .tab-panel:not(:first-child) {
			display: none;
		}
		.tabs-body .tab-panel {
			min-height: 250px;
			padding: 30px;
			background: #ebebeb;
			background: #fff;
			position: relative;
			overflow: hidden;
			font-family: Open Sans;
			font-size: 15px;
			line-height: 1.5;
			color: #6a6a6a;
		}
		.tab-panel[data-name=perfil]::before {
			position: absolute;
			content: "\f0c0";
			font: normal normal normal 14px/1 FontAwesome;
			color: #95959545;
			top: calc(100% - 280px);
			right: 20px;
			font-size: 280px;
		}
		.tab-panel[data-name=ambito]::before {
			position: absolute;
			content: "\f013";
			font: normal normal normal 14px/1 FontAwesome;
			color: #95959545;
			top: calc(100% - 280px);
			right: 20px;
			font-size: 280px;
		}
		.tab-panel[data-name=certificaciones]::before {
			position: absolute;
			content: "\f19d";
			font: normal normal normal 14px/1 FontAwesome;
			color: #95959545;
			top: calc(100% - 280px);
			right: 20px;
			font-size: 280px;
		}
		h1 {
			color: #fff;
		}
		.post-content * {
            font-family: Open Sans;
            font-family: 'Roboto Flex';
            font-family: 'Source Sans Pro';
            font-size: 18px;
            color: #6d6d6d;
		}
		h1 {
			font-family: Roboto Flex;
			font-size: 40px;
		}
		.post-content p {
		    text-align: justify !important;
		    margin: 0 0 10px 0;
		}
		.tabs.style-1 .tab {
		    border-radius: 8px;
		}
		.tabs.style-1 .tab-panel {
		    border-radius: 8px;
		}
		.tabs.style-1 .tabs-body {
		    margin-top: 8px;
		}
		.tabs .tab-panel  * {
            font-family: 'Source Sans Pro';
            font-size: 18px;
            color: #6d6d6d;
            text-align: justify;
		}
		.tabs .tab-panel p {
		    margin: 0 0 15px;
		}
		.tabs .tab-panel p:last-child {
		    margin-bottom: 0px;
		}
		@media (max-width: 768px) {
		    
		    .tabs .tabs-heading {
		        display: flex;
		        overflow-x: auto;
		        gap: 6px;
		    }
		    .tabs .tabs-heading .tab {
		        flex-shrink: 0;
		        min-width: 37vw;
		    }
		    .tabs .tab-panel {
		        padding: 20px;
		    }
		}
	</style>
	<?php the_post(); ?>
	<section class="no-padding-y" style="min-height: 100px; background-image: url(<?php echo get_the_post_thumbnail_url(get_the_ID()); ?>); background-size: cover; background-position: center; position: relative;">
		<div class="overlay" style="position: absolute; inset: 0; background-color: rgba(0, 0, 0, 0.3)"></div>
		<div class="content" style="align-items: flex-start; justify-content: center; height: 300px; position: relative;">
			<h1 class=""><?php echo get_the_title(); ?></h1>
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
	<section class="">
		<div class="content">
			<div class="columns" data-block="columns">
				<div class="column" data-block="column">
					<div class="image" data-block="image">
						<img src="<?php echo get_the_post_thumbnail_url(get_the_ID()); ?>" alt="" style="width: 100%; height: auto; display: block; border-radius: 8px">
					</div>
				</div>
				<div class="column" data-block="column" style="display: flex; align-items: center;">
					<div class="post-content">
						<?php the_content(); ?>
					</div>
				</div>
			</div>
		</div>
	</section>
	<section class="dark-bg">
		<div class="content">
			<div class="tabs style-1">
				<div class="tabs-heading">
					<button class="tab" data-target="perfil" data-active>Perfil de egreso</button>
					<button class="tab" data-target="ambito">Ámbito laboral</button>
					<button class="tab" data-target="certificaciones">Certificaciones</button>
					<button class="tab" data-target="plan-estudios">Plan de estudios</button>
					<button class="tab" data-target="horario-clases">Horario de clases</button>
					<button class="tab" data-target="matricula">Matrícula</button>
					<button class="tab" data-target="oficio">Oficio de autorización</button>
				</div>
				<div class="tabs-body">
					<div class="tab-panel" data-name="perfil">
						<?php echo get_post_meta(get_the_ID(), '_career-perfil-egresado', true); ?>
					</div>
					<div class="tab-panel" data-name="ambito">
						<?php echo get_post_meta(get_the_ID(), '_career-ambito-laboral', true); ?>
					</div>
					<div class="tab-panel" data-name="certificaciones">
						<?php echo get_post_meta(get_the_ID(), '_career-certificaciones', true); ?>
					</div>
					<div class="tab-panel" data-name="plan-estudios">
						<?php echo get_post_meta(get_the_ID(), '_career-plan-estudios', true); ?>
					</div>
					<div class="tab-panel" data-name="horario-clases">
						<?php echo get_post_meta(get_the_ID(), '_career-horario-clases', true); ?>
					</div>
					<div class="tab-panel" data-name="matricula">
						<?php echo get_post_meta(get_the_ID(), '_career-matricula', true); ?>
					</div>
					<div class="tab-panel" data-name="oficio">
						<?php echo get_post_meta(get_the_ID(), '_oficio-autorizacion', true); ?>
					</div>
				</div>
			</div>
		</div>
		<script>
			(function($) {

				let $tabs = $('.tabs');
				let $tabsButtons = $('button.tab');
				let $tabsPanels = $tabs.find('.tab-panel');

				$tabsButtons.on('click', function() {

					var target = this.dataset.target;
					
					var $panel = $tabs[0].querySelector(`.tab-panel[data-name=${target}]`);
					var $tabsS = $tabs.find(`.tab:not([data-target=${target}])`);
					var $siblings = $tabs.find(`.tab-panel:not([data-name=${target}])`);

					$siblings.css('display', 'none');
					$tabsS.removeAttr('data-active', '');
					$(this).attr('data-active', '');
					$panel.style.display = 'block';

					console.log($siblings);
				});
			})(jQuery);
		</script>
	</section>
</main>
<?php get_footer(); ?>