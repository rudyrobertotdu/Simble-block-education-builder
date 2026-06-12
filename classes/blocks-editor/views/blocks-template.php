<?php
	$action = $_GET['action'] ?? 'create';
	$database = new WP_Database();
	$template_id = intval($_GET['id'] ?? 0);

	// Obtener template principal
	$tpl_rows = $database->fetch('blocks_editor_templates', 'ID = '. $template_id, 'ID, template_name, template_section, template_structure, template_html');
	$template = empty($tpl_rows) ? null : $tpl_rows[0];

	// Obtener especificidad (post_page, post_type, post_name)
	$spec_rows = $database->fetch('blocks_editor_specificity', 'template_id = '. $template_id, 'post_page, post_type, post_name');
	$specificity = empty($spec_rows) ? ['post_page'=>'', 'post_type'=>'', 'post_name'=>''] : $spec_rows[0];

	// For legacy code compatibility
	$structure = $template ? [$template] : [];
?>
<div class="uix-page blocks-editor">
	<div class="uix-page-header">
		<h2 class="page-title"><?php echo ($action == 'create' ? 'Crear plantilla' : 'Actualizar plantilla'); ?></h2>
		<div style="display: flex; column-gap: 8px">
	    <?php
	        //$user = wp_get_current_user();
	        //if ($user->user_nicename == 'edu_admin'):
	    ?>
			<button id="show-blocks" class="button">
				<i class="fa fa-cubes"></i>
				<span class="text">Bloques</span>
			</button>
			<button id="edit-settings" class="button">
				<i class="fa fa-cog"></i>
				<span class="text">Ajustes</span>
			</button>
		<?php
		    //endif;
		?>
			<form id="template-form" action="<?php echo esc_url( admin_url('admin-post.php') ); ?>" method="POST">
				<input type="hidden" name="action" value="blocks-editor-request">
				<input type="hidden" name="handler" value="create-blocks-template">
				<input type="hidden" name="data[template_id]" value="<?php echo $_GET['id'] ?? '0'; ?>">
				<input type="hidden" name="data[template_name]" value="">
				<input type="hidden" name="data[template_section]" value="">
				<input type="hidden" name="data[template_structure]" value="">
				<input type="hidden" name="data[template_html]" value="">
				<input type="hidden" name="data[post_page]" value="">
				<input type="hidden" name="data[post_type]" value="">
				<input type="hidden" name="data[post_name]" value="">
				<button type="submit" class="uix-button button save">
					<i class="icon fa fa-save" style="margin-right: 2px;"></i>
					<span class="text"><?php echo ($action == 'create' ? 'Guardar' : 'Actualizar'); ?></span>
				</button>
			</form>
		</div>
		<!--<a href="<?php //echo admin_url('?page=blocks-template&action=create'); ?>" class="uix-button button save">
			<i class="icon fa fa-save" style="margin-right: 2px;"></i>
			<span class="text">
				<?php //echo $action == 'create' ? 'Guardar' : 'Actualizar'; ?>
			</span>
		</a>-->
	</div>
	<div class="uix-page-body">
		<div class="uix-container blocks-container" style="min-width: 0; flex-grow: 1;">
			<div class="blocks-toolbar">
				<button class="" data-viewport-width="400px">
					<i class="fa fa-mobile"></i>
				</button>
				<button class="" data-viewport-width="700px">
					<i class="fa fa-tablet fa-rotate-90"></i>
				</button>
				<button class="" data-viewport-width="100%">
					<i class="fa fa-laptop"></i>
				</button>
			</div>
			<iframe class="blocks-viewport" allowfullscreen="true"></iframe>
		</div>
		<div class="uix-container blocks-sidebar">
		    <?php
    	        /*$user = wp_get_current_user();
    	        if ($user->user_nicename == 'edu_admin'):*/
    	    ?>
			<div class="blocks-list" style="display: grid;">
				<button class="button" style="aspect-ratio: 1 / 1" data-block="image">
					<i class="block-icon fa fa-file-image-o"></i>
					<p class="block-name">Imagen</p>
				</button>
				<button class="button" style="aspect-ratio: 1 / 1" data-block="image-box">
					<i class="block-icon fa fa-file-image-o"></i>
					<p class="block-name">Caja de Imagen</p>
				</button>
				<button class="button" style="aspect-ratio: 1 / 1" data-block="icon-box">
					<i class="block-icon fa fa-file-image-o"></i>
					<p class="block-name">Caja de Icono</p>
				</button>
				<button class="button" style="aspect-ratio: 1 / 1" data-block="icons-list">
					<i class="block-icon fa fa-file-image-o"></i>
					<p class="block-name">Lista de Iconos</p>
				</button>
				<button class="button" style="aspect-ratio: 1 / 1" data-block="images-carousel">
					<i class="block-icon fa fa-file-image-o"></i>
					<p class="block-name">Carousel</p>
				</button>
				<button class="button" style="aspect-ratio: 1 / 1" data-block="images-slider">
					<i class="block-icon fa fa-file-image-o"></i>
					<p class="block-name">Slider</p>
				</button>
				<button class="button" style="aspect-ratio: 1 / 1" data-block="image-box-group">
					<i class="block-icon fa fa-file-image-o"></i>
					<p class="block-name">Grupo de Caja de Imagen</p>
				</button>
				<button class="button" style="aspect-ratio: 1 / 1" data-block="icon-box-group">
					<i class="block-icon fa fa-file-image-o"></i>
					<p class="block-name">Grupo de Caja de Icono</p>
				</button>
				<!-- Botones adicionales extraídos de las plantillas -->
				<button class="button" style="aspect-ratio: 1 / 1" data-block="images-slider">
					<i class="block-icon fa fa-image"></i>
					<p class="block-name">Slider de Imágenes</p>
				</button>
				<button class="button" style="aspect-ratio: 1 / 1" data-block="images-gallery">
					<i class="block-icon fa fa-th-large"></i>
					<p class="block-name">Galería de Imágenes</p>
				</button>
				<button class="button" style="aspect-ratio: 1 / 1" data-block="heading">
					<i class="block-icon fa fa-header"></i>
					<p class="block-name">Título</p>
				</button>
				<button class="button" style="aspect-ratio: 1 / 1" data-block="paragraph">
					<i class="block-icon fa fa-paragraph"></i>
					<p class="block-name">Párrafo</p>
				</button>
				<button class="button" style="aspect-ratio: 1 / 1" data-block="shortcode">
					<i class="block-icon fa fa-code"></i>
					<p class="block-name">Shortcode</p>
				</button>
				<button class="button" style="aspect-ratio: 1 / 1" data-block="columns">
					<i class="block-icon fa fa-columns"></i>
					<p class="block-name">Columnas</p>
				</button>
				<button class="button" style="aspect-ratio: 1 / 1" data-block="call-to-action-group">
					<i class="block-icon fa fa-bullhorn"></i>
					<p class="block-name">Grupo Llamada a la Acción</p>
				</button>
				<button class="button" style="aspect-ratio: 1 / 1" data-block="posts-grid">
					<i class="block-icon fa fa-th"></i>
					<p class="block-name">Grid de Posts</p>
				</button>
				<button class="button" style="aspect-ratio: 1 / 1" data-block="navigation">
					<i class="block-icon fa fa-navicon"></i>
					<p class="block-name">Navegación</p>
				</button>
				<button class="button" style="aspect-ratio: 1 / 1" data-block="testimonials">
					<i class="block-icon fa fa-quote-left"></i>
					<p class="block-name">Testimonios</p>
				</button>
				<button class="button" style="aspect-ratio: 1 / 1" data-block="contact-form">
					<i class="block-icon fa fa-envelope"></i>
					<p class="block-name">Formulario de Contacto</p>
				</button>

				<button class="button" style="aspect-ratio: 1 / 1" data-block="seccion">
					<i class="block-icon fa fa-th-large"></i>
					<p class="block-name">Sección</p>
				</button>
			</div>
			<?php
			    //else:
			?>
			<div>
			    <h2>Haga click en el botón <i class="fa fa-wrench"></i> de un bloque</h2>
			</div>
			<?php
			    //endif;
			?>
			<div class="blocks-controls" style="display: none;">
				<div class="header" style="display: flex; align-items: center; justify-content: space-between; padding: 8px; border-bottom: 1px solid #a1a1a1">
					<p class="block-name" style="font-weight: bold; text-transform: uppercase; font-size: 15px; margin: 0"></p>
					<button class="button show-blocks">
						<i class="fa fa-cubes"></i>
					</button>
				</div>
				<div class="tabs">
					<div class="tab-header">
						<div class="tab" data-target="general" data-active>
							<i class="fa fa-pencil fa-1x"></i>
							<p>General</p>
						</div>
						<div class="tab" data-target="styles">
							<i class="fa fa-eyedropper fa-1x"></i>
							<p>Estilos</p>
						</div>
					</div>
					<div class="tab-body tab-content">
						<div class="tab-panel" data-name="general"></div>
						<div class="tab-panel" data-name="styles" style="display: none"></div>
					</div>
				</div>
			</div>
			<div class="blocks-data" style="display: none">
				<div class="" style="border-bottom: 1px solid #dadada; padding: 0 10px">
					<h2 style="font-family: Rubik; font-size: 15px">AJUSTES DE PLANTILLA</h2>
				</div>
				<div style="padding: 10px 10px">
						<div class="uix-field">
							<label for="">Nombre de plantilla</label>
							<input type="text" name="data[template_name]" value="<?php echo esc_attr($template['template_name'] ?? ''); ?>">
						</div>
						<div class="uix-field">
							<label for="">Seccion de plantilla</label>
							<select name="data[template_section]" id="">
								<option value="header" <?php echo (isset($template['template_section']) && $template['template_section'] == 'header') ? 'selected' : ''; ?>>Encabezado de pagina</option>
								<option value="content" <?php echo (isset($template['template_section']) && $template['template_section'] == 'content') ? 'selected' : ''; ?>>Contenido de pagina</option>
								<option value="footer" <?php echo (isset($template['template_section']) && $template['template_section'] == 'footer') ? 'selected' : ''; ?>>Pie de pagina</option>
							</select>
						</div>
						<div class="uix-field">
							<label for="">Pagina de publicacion (Post Template)</label>
							<?php
								$post_page_opts = [
									'' => '-- Ninguno --',
									'all' => 'all (Todas)',
									'single' => 'single (Singular)',
									'archive' => 'archive (Archivo)',
									'taxonomy' => 'taxonomy (Taxonomía)',
									'404' => '404 (Página 404)'
								];
							?>
							<select name="data[post_page]">
								<?php foreach ($post_page_opts as $val => $label): ?>
									<option value="<?php echo esc_attr($val); ?>" <?php echo (isset($specificity['post_page']) && $specificity['post_page'] === $val) ? 'selected' : ''; ?>><?php echo esc_html($label); ?></option>
								<?php endforeach; ?>
							</select>
						</div>
						<div class="uix-field">
							<label for="">Tipo de publicacion (Post Type)</label>
							<?php
								// Include main types 'post', 'page' and 'attachment'
								$post_types = [ 'post' => 'Post', 'page' => 'Page', 'attachment' => 'Attachment' ];
							?>
							<select name="data[post_type]">
								<option value="">-- Todas las tipos --</option>
								<?php foreach ($post_types as $pt_name => $label): ?>
									<option value="<?php echo esc_attr($pt_name); ?>" <?php echo (isset($specificity['post_type']) && $specificity['post_type'] === $pt_name) ? 'selected' : ''; ?>><?php echo esc_html($label); ?></option>
								<?php endforeach; ?>
							</select>
						</div>
					<div class="uix-field">
						<?php

							$db = new WP_Database();
							$pages = $db->fetch("posts", "post_type IN ('page') AND post_status = 'publish'", "ID, post_name, post_title");
						?>
						<label for="">Nombre de publicacion (Post Name)</label>
						<select name="data[post_name]" id="">
							<option value="">--Todas las paginas--</option>
							<?php
								foreach ($pages as $key => $page):
							?>
							<option class="" value="<?php echo $page['post_name'] ?>" <?php echo (isset($specificity['post_name']) && $specificity['post_name'] == $page['post_name']) ? 'selected' : ''; ?>><?php echo $page['post_title']; ?></option>
							<?php
								endforeach;
							?>
						</select>
					</div>
					<div class="uix-field">
						<button class="button" id="load-template" style="width: 100%; display: block;">Cargar plantilla predeterminada</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
<script>
	var dbBlocksStructure = <?php echo (empty($structure) ? '[]' : $structure[0]['template_structure']); ?>
</script>
<script>
	(function($) {
		//template-blocks-settings

		let $settingsBtn = $('#edit-settings');
		let $showBlocksBtn = $('#show-blocks');
		let $showBlocksBtn2 = $('.show-blocks');
		let $blocksDataPanel = $('.blocks-data');
		let $blocksControlsPanel = $('.blocks-controls');
		let $blocksListPanel = $('.blocks-list');
		let $tabs = $('.tabs');
		let $tabsButtons = $tabs.find('.tab');
		let $tabsPanels = $tabs.find('.tab-panel');
		let $tabGeneral = $tabs.find('[data-name="general"]');
		let $tabStyles = $tabs.find('[data-name="styles"]');
		let $mediaButtons = $('.blocks-toolbar button');
		let $blocksViewport = $('.blocks-viewport');

		console.log($mediaButtons);
		$mediaButtons.on('click', function() {

			$blocksViewport.get(0).style.width = this.dataset['viewportWidth'];
		});

		$settingsBtn.on('click', function() {

			$blocksDataPanel.get(0).style.display = 'block';
			$blocksListPanel.get(0).style.display = 'none';
			$blocksControlsPanel.get(0).style.display = 'none';
		});

		$showBlocksBtn.on('click', function() {

			$blocksDataPanel.get(0).style.display = 'none';
			$blocksListPanel.get(0).style.display = 'grid';
			$blocksControlsPanel.get(0).style.display = 'none';
		});

		$showBlocksBtn2.on('click', function() {

			$blocksDataPanel.get(0).style.display = 'none';
			$blocksListPanel.get(0).style.display = 'grid';
			$blocksControlsPanel.get(0).style.display = 'none';
		});

		// Reactivar: insertar bloque al hacer click en la lista de bloques (mapeo seguro data-block -> clase)
		$('.blocks-list').on('click', 'button[data-block]', function() {

			let data = this.dataset.block || '';
			if (!data) return;



			// Helper: render canvas safely (checks iframe/document availability)
			function renderCanvas() {
				try {
					var vp = BlocksEditor.$editorBlocksViewport;
					if (vp && vp.contentDocument && vp.contentDocument.body && BlocksEditor.$editorDocument) {
						vp.contentDocument.body.innerHTML = '';
						vp.contentDocument.body.appendChild(BlocksEditor.$editorDocument.getEditBlock());
						BlocksEditor.$editorDocument.editBlock();
						BlocksEditor.$editorDocument.renderBlock();
						return true;
					}
				} catch (e) {
					console.warn('renderCanvas error', e);
				}
				return false;
			}

			const map = {
				'image': 'Image',
				'image-box': 'ImageBox',
				'icon-box': 'IconBox',
				'icons-list': 'IconsList',
				'images-carousel': 'ImagesCarousel',
				'images-slider': 'ImagesSlider',
				'image-box-group': 'ImageBoxGroup',
				'icon-box-group': 'IconBoxGroup',
				'seccion': 'Section'
			};

			let className = map[data] || data.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');

			console.log('blocks-list click:', { data, className, hasBlocksEditor: typeof BlocksEditor !== 'undefined', editorDoc: (typeof BlocksEditor !== 'undefined' ? !!BlocksEditor.$editorDocument : null) });

			const insertBlock = () => {
				if (typeof BlocksEditor === 'undefined' || !BlocksEditor.$editorDocument) {
					console.warn('BlocksEditor no está listo para insertar bloques.');
					return;
				}

				console.log('insertBlock: inserting', className, 'target:', BlocksEditor.selectedBlock || 'root');

				// Determinar destino: bloque seleccionado (si existe) o documento raíz
				let target = BlocksEditor.selectedBlock || BlocksEditor.$editorDocument;
				try {
					if (target && typeof target.addBlockItems === 'function') {
						target.addBlockItems({type: className, settings: {}, html: ''});
					} else if (target && Array.isArray(target.items)) {
						// fallback: insertar directamente en el array de items
						target.items.push(BlocksEditor.create(className, {}, ''));
					} else {
						BlocksEditor.$editorDocument.addBlockItems({type: className, settings: {}, html: ''});
					}

					// Re-renderizar el canvas para reflejar cambios (safe)
					if (!renderCanvas()) console.warn('Editor viewport no listo para renderizar (insertBlock)');

					// Mostrar controles del último bloque añadido solo si no insertamos dentro
					// de la sección actualmente seleccionada (para no abrir el panel automáticamente)
					try {
						let list = (target && target.items && target.items.length) ? target.items : BlocksEditor.$editorDocument.items;
						let last = list[list.length - 1];
						// No abrir automáticamente el panel de edición si:
						// - insertamos dentro de la sección actualmente seleccionada
						// - insertamos en el documento raíz (fuera de una sección)
						// - estamos insertando una nueva sección
						if (last && last.showControls && BlocksEditor.selectedBlock !== target && target !== BlocksEditor.$editorDocument && className !== 'Section') {
							last.showControls();
						}
					} catch (e) { /* no crítico */ }
				} catch (e) {
					console.error('Error al insertar bloque en target:', e);
				}
			};

			if (typeof BlocksEditor === 'undefined' || !BlocksEditor.$editorDocument) {
				let attempts = 0;
				let t = setInterval(() => {
					if (typeof BlocksEditor !== 'undefined' && BlocksEditor.$editorDocument) {
						clearInterval(t);
						insertBlock();
						return;
					}
					if (++attempts > 50) { clearInterval(t); console.warn('Timeout esperando BlocksEditor'); }
				}, 100);
			} else {
				insertBlock();
			}
		});





		$('#template-form').on('submit', function(e) {
		    
		    try {
		        
    			let $tplHTML = $(this).find("input[name='data[template_html]']"),
    				$tplStructure = $(this).find("input[name='data[template_structure]']"),
    				$tplName = $('.blocks-data').find("input[name='data[template_name]']"),
					$tplSection = $('.blocks-data').find("select[name='data[template_section]']"),
					$postPage = $('.blocks-data').find("input[name='data[post_page]'], select[name='data[post_page]']"),
					$postType = $('.blocks-data').find("input[name='data[post_type]'], select[name='data[post_type]']"),
					$postName = $('.blocks-data').find("select[name='data[post_name]']"),
    				$formPostPage = $(this).find("input[name='data[post_page]']"),
    				$formPostType = $(this).find("input[name='data[post_type]']"),
    				$formPostName = $(this).find("input[name='data[post_name]']");
    				$formTplName = $(this).find("input[name='data[template_name]']"),
    				$formTplSection = $(this).find("input[name='data[template_section]']");
    
    			console.log(this);
    			console.log($tplHTML);
    			console.log($tplStructure);
    
    			$formPostPage.val($postPage.val());
    			$formPostType.val($postType.val());
    			$formPostName.val($postName.val());
    			$formTplName.val($tplName.val());
    			$formTplSection.val($tplSection.val());
				$tplName.val($tplName.val());
				$tplSection.val($tplSection.val());
				// Debug: inspect saved HTML for shortcodes
				try {
					// EXTRA DEBUG: log each Shortcode block state before serialization
					try {
						console.log('[BlocksEditor][Save] items settings snapshot:', BlocksEditor.$editorDocument.items.map(b => ({ type: b.constructor.name, settings: b.settings })) );
						// collect DOM-based info for shortcode blocks
						let scNodes = [];
						try {
							const clone = BlocksEditor.$editorDocument.getBlock().cloneNode(true);
							clone.querySelectorAll('[data-block="shortcode"]').forEach(n => {
								scNodes.push({ attr: n.getAttribute('data-shortcode'), text: (n.textContent||'').trim().slice(0,200) });
							});
						} catch (e) {
							console.warn('Could not clone DOM for shortcode inspection', e);
						}
						console.log('[BlocksEditor][Save] shortcode DOM snapshot:', scNodes);
					} catch (e) { console.warn('Shortcode pre-save snapshot failed', e); }

					const saved = BlocksEditor.$editorDocument.getSaveBlock().outerHTML;
					console.log('[BlocksEditor][Save] savedHTML length:', saved.length, 'snippet:', saved.slice(0,200));
					$tplHTML.val(saved);
				} catch (e) {
					console.error('Error serializing save block:', e);
					$tplHTML.val('');
				}
    			$tplStructure.val(JSON.stringify([BlocksEditor.$editorDocument.saveConfig]));
    			
    			//throw new Error('The number is low');
    			
		    } catch (e) {
		        
		        $UI.dialog.alert(
		            'Error',
		            'A ocurrido un inconveniente al guardar, copie los detalles de este mensaje, recarge la pagina y contacte con el desarrollador: \n'+ e.message
		        );
		        return false;
		    }
			return true;
			//e.preventDefault();
			//console.log('Saving...', BlocksEditor);
		});

		$tabsButtons.on('click', function() {

			var target = this.dataset.target;
			console.log($tabs);
			var $panel = $tabs[0].querySelector(`.tab-panel[data-name=${target}]`);
			var $tabsS = $tabs.find(`.tab:not([data-target=${target}])`);
			var $siblings = $tabs.find(`.tab-panel:not([data-name=${target}])`);

			$siblings.css('display', 'none');
			$tabsS.removeAttr('data-active', '');
			$(this).attr('data-active', '');
			$panel.style.display = 'block';

			console.log($siblings);
		});
		$('#load-template').on('click', function() {

			let $tplSection = $('.blocks-data').find("select[name='data[template_section]']");
			let $tplPost = $('.blocks-data').find("select[name='data[post_name]']");

			if ($tplSection.val() == 'content') {

				BlocksEditor.$editorDocument = BlocksEditor.create('Canvas', {}, '');

				// Support legacy `parsedBlocks` (array) as the unnamed content template.
				// parsedBlocks2.content is an object keyed by post_name. Use selected post if available,
				// otherwise prefer explicit named templates or fallback to `parsedBlocks` if present.
				var contentTemplates = parsedBlocks2['content'] || {};
				var unnamedContent = (typeof parsedBlocks !== 'undefined' && Array.isArray(parsedBlocks)) ? parsedBlocks : null;
				var postKey = $tplPost.val();
				var selectedTemplates = null;
				if (postKey && contentTemplates[postKey]) {
					selectedTemplates = contentTemplates[postKey];
				} else {
					// Prefer explicit 'default-content' (copy of anonymous template),
					// otherwise prefer 'plana-docente', otherwise use the first key,
					// otherwise fallback to unnamed `parsedBlocks`.
					if (contentTemplates['default-content']) {
						selectedTemplates = contentTemplates['default-content'];
					} else if (contentTemplates['plana-docente']) {
						selectedTemplates = contentTemplates['plana-docente'];
					} else {
						var keys = Object.keys(contentTemplates);
						if (keys.length) {
							selectedTemplates = contentTemplates[keys[0]];
						} else if (unnamedContent) {
							// wrapped as an array of templates, use it directly
							selectedTemplates = unnamedContent;
						}
					}
				}

				console.log('load-template: section=', $tplSection.val(), 'postKey=', postKey);
				console.log('contentTemplates keys=', Object.keys(contentTemplates));
				console.log('selectedTemplates=', selectedTemplates);

				if (selectedTemplates && selectedTemplates[0] && selectedTemplates[0].items) {
					selectedTemplates[0].items.forEach(function(item, idx) {
						try {
							BlocksEditor.$editorDocument.addBlockItems([item]);
						} catch (e) {
							console.error('load-template: error adding content item', idx, item.type, e);
						}
					});
				}

					if (!renderCanvas()) console.warn('Editor viewport no listo para renderizar (load-template content)');
			
			} else {

				BlocksEditor.$editorDocument = BlocksEditor.create('Canvas', {}, '');

				var sectionTemplates = parsedBlocks2[$tplSection.val()];
				if (sectionTemplates && sectionTemplates[0] && sectionTemplates[0].items) {
					sectionTemplates[0].items.forEach(function(item, idx) {
						try {
							BlocksEditor.$editorDocument.addBlockItems([item]);
						} catch (e) {
							console.error('load-template: error adding section item', idx, item.type, e);
						}
					});
				}
				if (!renderCanvas()) console.warn('Editor viewport no listo para renderizar (load-template section)');
			}
		});

		// Auto-initialize an empty Canvas when creating a new template (action=create with no id)
		var pageAction = '<?php echo $action; ?>';
		var templateId = '<?php echo $_GET['id'] ?? '0'; ?>';
		if (pageAction === 'create' && (templateId === '' || templateId === '0')) {
			let attempts = 0;
			let t = setInterval(() => {
				if (typeof BlocksEditor !== 'undefined' && BlocksEditor.$editorBlocksViewport) {
					clearInterval(t);
					try {
						BlocksEditor.$editorDocument = BlocksEditor.create('Canvas', {}, '');
						BlocksEditor.$editorBlocksViewport.contentDocument.body.innerHTML = '';
						BlocksEditor.$editorBlocksViewport.contentDocument.body.appendChild(BlocksEditor.$editorDocument.getEditBlock());
						BlocksEditor.$editorDocument.editBlock();
						BlocksEditor.$editorDocument.renderBlock();
					} catch (e) {
						console.error('auto-init canvas error', e);
					}
				}
				if (++attempts > 50) { clearInterval(t); }
			}, 100);
		}
	})(jQuery);
</script>