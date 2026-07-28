/**
 * _blocks.js
 *
 * Definiciones de clases que representan bloques editables en el editor
 * visual (Block, Canvas, Section, etc.).
 *
 * Propósito:
 * - Proveer la abstracción en memoria de la estructura de bloques
 * - Exponer métodos para renderizar el bloque en modo edición y en modo
 *   guardado (save)
 *
 * Interacción con el sistema:
 * - Se integran con `BlocksEditor` (global) y el DOM del editor para
 *   operaciones CRUD sobre bloques, renderizado en el iframe y persistencia
 *   a través de handlers AJAX.
 *
 * Notas:
 * - Este archivo supone la presencia de utilidades auxiliares como
 *   `$createUI` y del entorno global `editor_vars`/`ajaxurl`.
 */
Simditor.locale = 'en-US';
// editor path relative to site root (strip protocol+host if present)
var _editor_path_rel = (window.editor_path_relative) ? window.editor_path_relative : ((typeof editor_vars !== 'undefined' && editor_vars.editor_path) ? String(editor_vars.editor_path).replace(/^https?:\/\/[^/]+/, '') : '/wp-content/themes/educacion-editor/classes/blocks-editor');
class Block {
	
	// Static reference to main document for UI queries
	static mainDocument = document;

	$block = null;
	blockEdit = null;
	blockSave = null;
	blockName = '!?';
	blockTitle = '';
	blockHTML = '<div data-block=""></div>'; //in edit or save return a tag template literal ?
	blockElements = []; //Tal vez aca debe ir todos los selectores del bloque sean o no sean opcionales
	blockParts = []; //Tal vez cada vez que se acceda a esto se le tiene que devolver un nuevo elemento ?
	blockChildren = [];
	blockAttributes = {
		id: '',
		className: '',
		style: '',
		dataset: ''
	};
	blockAttributes = {
		id: '',
		style: '',
		class: '',
		data: ''
	};
	blockEdit = {};
	blockType = 'content';
	controls = {};
	settings = {};
	saveConfig = {};
	saveHTML = {};

	constructor() {
		//this.init();
	}
	init(settings, html, parent = null) {

		let elements = [];

		html && (this.blockHTML = html);

		elements.push({
			name: '$block',
			html: this.blockHTML,
			children: this.blockChildren
		});

		elements.concat(this.blockParts);

		for (let element of elements) {

			this[element.name] = this.create(element.html);
			this.blockEdit[element.name] = this[element.name]; //blockelements
			
			if (this[element.name].childElementCount && element.children.length) {
			    
				for (let children of element.children) {
				    
					this[children.name] = this[element.name].querySelector(children.selector);
					this.blockEdit[children.name] = this[children.name];
				}
			}
		}

		this.registerControls();
		this.setSettings(settings);
		this.initElementsAttributes();
		
		return this;
	}
	initElementsAttributes() {

		this.elementsAttrs = {};

		for (let element in this.blockEdit) {

			if (!this.blockEdit[element])
				continue;

			let attrs = this.blockEdit[element].getAttributeNames();
			this.elementsAttrs[element] = {};

			if (attrs.length) {

				this.elementsAttrs[element]['save'] = {};
				this.elementsAttrs[element]['edit'] = {};
				this.elementsAttrs[element]['value'] = {};

				for (let attr of attrs) {

					this.elementsAttrs[element]['value'][attr] = this.blockEdit[element].getAttribute(attr);
					//this.elementsAttrs[element][attr] = this.blockEdit[element].getAttribute(attr);
				}
			}
		}
	}
	applyElementAttributes(type, element, attrs) {

		for (let name in attrs)
			this.elementsAttrs[element][type][name] = attrs[name];
			//this.elementsAttrs[element][type][name] = this.elementsAttrs[element]['value'][attr];
	}
	getElementAttribute(element, attribute) {

		if (typeof attribute == 'string') {

			return this.elementsAttrs[element]['value'][attribute];
		} else {

			return this.elementsAttrs[element]['value'];
		}
	}
	setElementAttributes(type, element, attribute) {

		let $element = null;

		if (typeof element == 'string') {

			$element = this[element];

			if (typeof attribute == 'string') {

				if (!this.elementsAttrs[element])
					return;

				$element.setAttribute(attribute, this.elementsAttrs[element][type][attribute]);
			}
		} else {

			$element = element;
		}
	}
	editBlock() {
		return this.edit(this.settings);
	}
	renderBlock() {
		this.render({});
	}
	serverBlockRender($container, $placeholder) {

		var $placeholder = $placeholder || (function() {

			let $loader = document.createElement('div');

			$loader.style.cssText = 'display: flex; align-items: center; justify-content: center; padding: 10px';
			$loader.className = 'server-block-loader';
			$loader.innerHTML = '<i class="fa fa-refresh fa-spin fa-2x"></i>';

			return $loader;
		})();

		(($) => {

			$.ajax({
				url: ajaxurl,
				type: 'POST',
				data: {
					action: 'blocks-editor-request',
					handler: 'render-server-block',
					name: this.blockName,
					settings: this.settings
				},
				beforeSend: function() {

					$container.innerHTML = '';
					$container.append($placeholder);
				},
				success: function(response) {

					$placeholder.remove();
					$container.innerHTML = response;
					console.log(response);
				}
			});

		})(jQuery);
	}
	getBlock() {

		return this.$block;
	}
	getBlockElements(clone) {

		let $block = null,
			$elements = {},
			elements = [];

		$block = this.create(this.blockHTML);
		$elements = { $block };

		for (let child of this.blockChildren) {

			$elements[child.name] = $block.querySelector(child.selector ?? null);
		}

		return $elements;
	}
	getEditBlock() {

		let $block = this.edit(this.settings);

		$block.dataset.block = this.blockName;
		$block.prepend(this.createEditTools());
		if (this.isSelected) {
			$block.classList.add('block-selected');
		}
		return $block;
	}

	render() {

		// Initialize slider behaviour using Slick (same approach as ImagesSlider)
		try {
			if (this.$slider && this.$slider.slick) {
				jQuery(this.$slider).slick('unslick');
			}
			// Basic slider settings; adjust as needed
			jQuery(this.$slider).slick({
				slidesToShow: 1,
				slidesToScroll: 1,
				arrows: true,
				dots: true,
				adaptiveHeight: true
			});
		} catch (e) {
			console.warn('Testimonials.render: could not initialize slider', e);
		}

	}
	getEditBlock() {

		let $block = this.getBlock();

		$block.prepend(this.createEditTools());
		$block.setAttribute('data-block-type', this.blockType);
		$block.setAttribute('data-edit-mode', '');

		if (this.isSelected) {
			$block.classList.add('block-selected');
		}

		return $block;
	}
	getSaveBlock() { 
		this.saveConfig = {
			type: this.constructor.name,
			settings: this.settings
		};

		return this.save(this.settings);
	}
	createEditTools() {

		let $uiFrame = document.createElement('div');
		let $uiTools = document.createElement('div');
		let $uiBlockName = document.createElement('div');
		let uiTools = [
			{
				icon: 'fa fa-wrench',
				title: 'Editar bloque',
				handler: () => {
					console.log('Block edit handler called for:', this.blockName);
					this.showControls(); 
				}
			}
		]

		if (this.blockName === 'section' || this.constructor.name === 'Section' || this.blockName === 'column' || this.constructor.name === 'Column') {
			uiTools.push({
				icon: 'fa fa-hand-pointer-o',
				title: 'Seleccionar Sección',
				handler: () => {
					try {
						if (typeof BlocksEditor !== 'undefined') {
							if (BlocksEditor.selectedBlock === this) {
								this.$block && this.$block.classList.remove('block-selected');
								this.isSelected = false;
								BlocksEditor.selectedBlock = null;
								console.log('Bloque deseleccionado via botón:', this.blockName);
								return;
							}
							// Quitar selección previa (y limpiar su bandera)
							if (BlocksEditor.selectedBlock && BlocksEditor.selectedBlock.$block) {
								BlocksEditor.selectedBlock.$block.classList.remove('block-selected');
								BlocksEditor.selectedBlock.isSelected = false;
							}
							// Marcar este bloque como seleccionado
							BlocksEditor.selectedBlock = this;
							this.$block && this.$block.classList.add('block-selected');
							this.isSelected = true;
							console.log('Bloque seleccionado via botón:', this.blockName);
						} else {
							console.warn('BlocksEditor no disponible para selección');
						}
					} catch (e) {
						console.error('Error al seleccionar/deseleccionar bloque:', e);
					}
				}
			});
		}
		// Añadir botón 'Eliminar' para todos los bloques excepto el documento raíz (Canvas)
		if (this.blockName !== 'canvas' && this.constructor.name !== 'Canvas') {
			uiTools.push({
				icon: 'fa fa-trash',
				title: 'Eliminar bloque',
				handler: () => {
					try {
						if (!confirm('¿Eliminar este bloque? Esta acción no se puede deshacer.')) return;
						// Limpiar selección si se está eliminando el bloque seleccionado
						if (typeof BlocksEditor !== 'undefined' && BlocksEditor.selectedBlock === this) {
							BlocksEditor.selectedBlock = null;
							this.isSelected = false;
						}
						// Remover de la estructura en memoria y ajustar contadores de bloques padre
						let parentInstance = null;
						if (typeof BlocksEditor !== 'undefined' && typeof BlocksEditor.findParentInstance === 'function') {
							parentInstance = BlocksEditor.findParentInstance(this);
						}
						if (typeof BlocksEditor !== 'undefined' && typeof BlocksEditor.removeInstance === 'function') {
							BlocksEditor.removeInstance(this);
						}
						if (parentInstance && parentInstance.settings) {
							if (typeof parentInstance.settings.columns !== 'undefined') {
								parentInstance.applySettings({ columns: parentInstance.items.length }, true);
							}
							if (typeof parentInstance.settings.amount !== 'undefined') {
								parentInstance.applySettings({ amount: parentInstance.items.length }, true);
							}
						}
						// Remover del DOM
						if (this.$block && this.$block.parentNode) {
							this.$block.parentNode.removeChild(this.$block);
						}
						console.log('Bloque eliminado:', this.blockName);
					} catch (e) {
						console.error('Error al eliminar bloque:', e);
					}
				}
			});
		}

		$uiFrame.className = 'block-ui-frame';
		$uiTools.className = 'block-ui-tools';
		$uiBlockName.className = 'block-ui-name';

		$uiBlockName.textContent = this.blockTitle;

		$uiFrame.append($uiTools);
		$uiFrame.append($uiBlockName);

		for (let tool of uiTools) {

			let $toolButton = document.createElement('button');

			$toolButton.type = 'button';
			$toolButton.title = tool.title;
			$toolButton.innerHTML = `<i class="${tool.icon}"></i>`;
			$toolButton.className = 'block-ui-tool';
			$toolButton.addEventListener('click', function(e) {
				console.log('Button clicked:', tool);
				e.preventDefault();
				tool.handler();
			});

			$uiTools.append($toolButton);
		}

		return $uiFrame;
	}
	showControls() {
		console.log('showControls called, using Block.mainDocument');
		
		const mainDoc = Block.mainDocument;
		var $controlsPanel = mainDoc.querySelector('.blocks-controls');
		var $blocksListPanel = mainDoc.querySelector('.blocks-list');
		var $blocksDataPanel = mainDoc.querySelector('.blocks-data');
		var $blockName = mainDoc.querySelector('.header > .block-name');

		// Mark the controls panel with the currently edited block name
		try {
			if ($controlsPanel) {
				$controlsPanel.setAttribute('data-current-block', this.blockName);
			}
		} catch (e) { console.warn('Could not set current block attribute on controls panel', e); }
		var $tabGeneralPanel = mainDoc.querySelector('.tab-panel[data-name="general"]');
		var $tabStylesPanel = mainDoc.querySelector('.tab-panel[data-name="styles"]');
		
		console.log('DOM elements found:', {
			$controlsPanel: !!$controlsPanel,
			$tabGeneralPanel: !!$tabGeneralPanel,
			$tabStylesPanel: !!$tabStylesPanel
		});
		
		if (!$tabGeneralPanel) {
			console.error('Could not find .tab-panel[data-name="general"]');
			return;
		}
		
		var $formControls = null;
		/*var $tabContent =*/

		//$tabContent.innerHTML = '';
		$tabGeneralPanel.innerHTML = '';
		$tabStylesPanel.innerHTML = '';

		//if ($controlsPanel.style.display == 'none') {

		$controlsPanel.style.display = 'block';
		$blocksListPanel.style.display = 'none';
		$blocksDataPanel.style.display = 'none';

		$blockName.textContent = this.blockTitle;

		$formControls = $createUI({
			type: 'form',
			items: this.createControls('general'),
			renderTo: $tabGeneralPanel //si no se define no renderiza
		});
		$formControls = $createUI({
			type: 'form',
			items: this.createControls('styles'),
			renderTo: $tabStylesPanel //si no se define no renderiza
		});

		try {
			if (this.blockName !== 'canvas' && this.constructor.name !== 'Canvas') {
				var $delWrap = document.createElement('div');
				$delWrap.className = 'block-delete-wrap';
				$delWrap.style.cssText = 'padding:8px;border-top:1px solid #e1e1e1;margin-top:8px;text-align:left;';
				var $delBtn = document.createElement('button');
				$delBtn.type = 'button';
				$delBtn.className = 'button block-delete-button';
				$delBtn.textContent = 'Eliminar bloque';
				$delBtn.addEventListener('click', (ev) => {
					ev.preventDefault();
					if (!confirm('¿Eliminar este bloque? Esta acción no se puede deshacer.')) return;
					try {
						// Limpiar selección si se está eliminando el bloque seleccionado
						if (typeof BlocksEditor !== 'undefined' && BlocksEditor.selectedBlock === this) {
							BlocksEditor.selectedBlock = null;
							this.isSelected = false;
						}
						// Ajustar los contadores del padre antes de eliminar de la estructura
						let parentInstance = null;
						if (typeof BlocksEditor !== 'undefined' && typeof BlocksEditor.findParentInstance === 'function') {
							parentInstance = BlocksEditor.findParentInstance(this);
						}
						// Remover de la estructura en memoria
						if (typeof BlocksEditor !== 'undefined' && typeof BlocksEditor.removeInstance === 'function') {
							BlocksEditor.removeInstance(this);
						}
						if (parentInstance && parentInstance.settings) {
							if (typeof parentInstance.settings.columns !== 'undefined') {
								parentInstance.applySettings({ columns: parentInstance.items.length }, true);
							}
							if (typeof parentInstance.settings.amount !== 'undefined') {
								parentInstance.applySettings({ amount: parentInstance.items.length }, true);
							}
						}
						// Remover del DOM
						if (this.$block && this.$block.parentNode) {
							this.$block.parentNode.removeChild(this.$block);
						}
						// Cerrar panel de controles y mostrar lista de bloques
						if (mainDoc) {
							var $controlsPanel2 = mainDoc.querySelector('.blocks-controls');
							var $blocksListPanel2 = mainDoc.querySelector('.blocks-list');
							if ($controlsPanel2) $controlsPanel2.style.display = 'none';
							if ($blocksListPanel2) $blocksListPanel2.style.display = 'grid';
						}
						console.log('Bloque eliminado (desde General):', this.blockName);
					} catch (e) { console.error('Error al eliminar bloque (desde General):', e); }
				});
				$delWrap.appendChild($delBtn);
				$tabGeneralPanel.appendChild($delWrap);
			}
		} catch (e) { console.warn('No se pudo añadir el botón Eliminar bloque:', e); }

		console.log(this.controls, $formControls);

		// If editing a Paragraph block, expand the htmleditor area to allow horizontal scrolling
		setTimeout(function(){
			try {
				var controlsPanel = mainDoc.querySelector('.blocks-controls');
				if (controlsPanel && controlsPanel.getAttribute && controlsPanel.getAttribute('data-current-block') === 'paragraph') {
					var editorWrap = controlsPanel.querySelector('.simditor') || controlsPanel;
					var body = (editorWrap && (editorWrap.querySelector('.simditor-body') || editorWrap.querySelector('[contenteditable]'))) || controlsPanel.querySelector('textarea');
					if (body) {
						//body.style.whiteSpace = 'nowrap';
						//body.style.overflowX = 'auto';
						body.style.width = '300px';
					}
					var ta = controlsPanel.querySelector('textarea');
					if (ta) { ta.style.whiteSpace = 'nowrap'; ta.style.overflowX = 'auto'; ta.style.width = '1000px'; }
				}
			} catch (e) { console.warn('Could not expand paragraph editor area', e); }
		}, 80);
		////////////
	}
	createControls(name) {

		let controls = [];

		for (let prop in this.controls[name]) {

			this.controls[name][prop].value = this.settings[prop];

			if (this.controls[name][prop].type == 'repeater-2')
				this.controls[name][prop].store = this.settings[prop];

			controls.push(this.controls[name][prop]);
		}
		console.log(controls, this.controls);
		return controls;
	}
	applySettings(settings, render) {

		for (let prop in settings) {
			this.settings[prop] = settings[prop] ?? this.settings[prop];
		}

		if (render)
			this.edit(this.settings);
	}
	setSettings(settings, render) { //createSettings

		for (let key in this.controls) { //general, styles, etc
			for (let prop in this.controls[key]) {
				this.settings[prop] = settings[prop] ?? this.controls[key][prop].default;
			}
		}

		// For Section: derive checkbox values from classes string if present
		if (this.blockName === 'section') {
			let cls = (settings && settings.classes) ? settings.classes : this.settings.classes || '';
			cls = String(cls);
			this.settings.noPaddingY = cls.includes('no-padding-y') ? 'yes' : 'no';
			this.settings.xDirection = cls.includes('x-direction') ? 'yes' : 'no';
			this.settings.xItemsSpace = cls.includes('x-items-space') ? 'yes' : 'no';

			// Derive section variant and background from classes if not explicitly provided
			const variants = ['section-valores','section-why-choose-us','section-contact-us','section-plana-docente','section-campus','section-palabras','section-mision-vision','section-noticias-eventos','section-experiencias'];
			const bgs = ['dark-bg','gray-bg','red-bg','theme-bg'];
			const clsList = cls.split(/\s+/).filter(Boolean);
			const foundVariant = variants.find(v => clsList.includes(v)) || '';
			const foundBg = bgs.find(b => clsList.includes(b)) || '';
			this.settings.sectionVariant = (settings && typeof settings.sectionVariant !== 'undefined') ? settings.sectionVariant : (this.settings.sectionVariant || foundVariant);
			this.settings.sectionBg = (settings && typeof settings.sectionBg !== 'undefined') ? settings.sectionBg : (this.settings.sectionBg || foundBg);
		}
		if (render)
			this.edit(this.settings);
	}
	getSettings() {

		return this.settings;
	}
	create(html) {

		let $template = document.createElement('template');
		$template.innerHTML = html;

		return $template.content.firstElementChild;
	}
	createElements() {}
	createTemplates(template) {

		let $template = document.createElement('template');
		$template.innerHTML = template;

		return $template.content;
	}
	edit(settings) { //return dom element y luego asignarlo a la misma clase

		//this.setAttributes(this.$block, this.getBlockAttributes());
		this.setElementAttributes('edit', '$block', 'class');
		
		return this.$block;
	} //Template method
	save() {

		let {
			$block
		} = {};

		let blockSave = this.$block.cloneNode(true);
		blockSave.querySelector('.block-ui-frame').remove();

		//blockSave.querySelector('.block-edit-frame').remove();
		return blockSave;
	} //Template method
	render() {} //Template method
	getSettings() {}
	createControlsPanel() {

		let controls = [],
			controlsPanel = null;

		for (let control in this.controls) {

			controls.push(this.controls[control]);
		}
	}
	setControls(settings) {} //Optional future setttings params
	registerControls() {
	    
	    this.addControl('classes', 'styles', {
			type: 'tokenfield',
			label: 'CSS classes',
			default: '',
			listeners: {
				additem: ($this) => {
					//console.log('additem evt', $this.getValue());
					this.applySettings({ classes: $this.getValue() }, true);
				},
				removeitem: ($this) => {
					//console.log('removeitem evt', $this.getValue());
					this.applySettings({ classes: $this.getValue() }, true);
				}
			}
		});
		
		/*this.addControl('classes', 'styles', {
			type: 'textfield',
			label: 'CSS classes',
			default: '',
			listeners: {
				input: ($this, value) => {

					var string = $this.getValue().slice(-1);
					console.log(string);

					if (string == ' ') {

						console.log('iff');
						this.applySettings({ classes: $this.getValue().trim() }, true);
					} else {
						console.log('elsee');
					}
				}
			}
		});*/
	}
	addControl(name, tab = 'general', config) {

		let control = {};

		!tab && (tab = 'general');

		this.controls[tab] = this.controls[tab] ?? {};
		this.controls[tab][name] = {...config};
		//this.controls[name] = (({type, label, value}) => ({type, label, value}))(config);
	}
	addControlGroup() {
	}
	setAttributes($element, data) { //set attributes for speceific element

		for (let attribute of blockAttributes) {

		}
	}
	applyBlockAttributes() {

	}
	setStyles($element, data, isText) {

		let styles = '';

		if (Tools.isObject(data)) {

			for (let key in data) {
				styles += '';
			}
		}
		$element.cssText = 45;
	}
}
class ContainerBlock extends Block {

	blockName = '';
	blockTitle = '';
	blockHTML = '';
	blockType = 'container';
	name = '';
	title = '';
	html = '';
	items = [];
	innerBlocks = [];
	blockItems = [];

	addBlockItems(blocks) {

		if (!Array.isArray(blocks)) {
			blocks = [blocks];
		}

		for (let block of blocks) {

			//let $block = (new BlocksEditor.classes[block.type]()).init(block.settings, block.html);
			let $block = BlocksEditor.create(block.type, block.settings, block.html);

			if (block.items && block.items.length) {

				$block.addBlockItems(block.items);
			}
			this.items.push($block);
		}
	}
	editBlocksItems($container) {

		if (this.items && this.items.length > 0) {
			for (let block of this.items) { //.innerBlocks

				let $block = block.getEditBlock();

				if (!this.$block.contains($block)) {

					$container.append($block);
					block.render();
				}
			}
		}
	}
	editBlocksItems($container) {

		if (this.items && this.items.length > 0) {

			for (let block of this.items) { //.innerBlocks

				/*let $block = block.getEditBlock();*/
				let $block = block.getBlock().isConnected ? block.edit(block.settings) : block.getEditBlock();

				if (!$container.contains($block)) {

					$container.append($block);
					block.editBlock();
					block.renderBlock();
				}
			}
		}
	}
	saveBlocksItems($container) {

		this.saveConfig = {
			type: this.constructor.name,
			settings: this.settings,
			items: []
		}

		if (this.items && this.items.length > 0) {

			for (let block of this.items) { //.innerBlocks

				let $item = block.getSaveBlock();
				$container.append($item);

				//TEMP
				this.saveConfig.items.push(block.saveConfig);
			}
		}
	}
	addInnerBlocks($block) {

		this.items.push($block);		
	}
	setInnerBlock($block) {

		this.items.push($block);
	}
	getInnerBlocks($container) { //Bloques Items //renderItems //cambiar

		for (let block of this.items) { //.innerBlocks

			let $innerBlock = block.edit();

			if (!this.$block.contains($innerBlock)) {

				$container.append($innerBlock);
			}
		}
	}
	getSaveBlock() { /*Temporal*/

		/*return {
			type: this.constructor.name,
			//html: this.save(this.settings),
			settings: this.getSettings(),
		}*/
		/*this.saveConfig = {
			type: this.constructor.name,
			settings: this.settings,
			items: []
		};*/

		return this.save(this.settings);
	}
	/*save() {

		let $b = this.$block.cloneNode(true);
		$b.querySelector('.block-edit-frame').remove();
		$b.innerHTML = '';

		if (this.items.length) {
			for (let i = 0; i < this.items.length; i++) {
				console.log(this.items[i]);
				let $bl = this.items[i].save(this.items[i].settings);
				$b.append($bl);
			}
		}
		return $b;
	}*/
	renderInnerBlocks($container) {


		if (!this.items.length)
			return false;

		for (let block of this.items) { //.items .innerBlocks

			//let $innerBlock = block.edit(block.settings);
			let $item = block.getBlock();

			//(!this.$block.contains($item)) && $container.appendChild($item);
			(!$container.contains($item)) && $container.appendChild($item);
		}
	}
	getItems() {

		return this.items;
	}
}
class Canvas extends ContainerBlock {

	blockName = 'canvas';
	blockTitle = 'Documento';
	blockHTML = '<div class="canvas document" data-block="canvas"></div>';

	edit(settings) {

		//this.renderInnerBlocks(this.$block);
		//this.blockEditItems()
		this.editBlocksItems(this.$block);

		return this.$block;
	}
	save() {

		let {
			$block
		} = this.getBlockElements();

		//this.getSaveBlockItems($block);
		this.saveBlocksItems($block);

		return $block;
	}
}
class Section extends ContainerBlock {

	blockName = 'section';
	blockTitle = 'Sección';
	blockHTML = 
		`<div class="section" data-block="section">
			<div class="content"></div>
		 </div>`;
	blockChildren = [
		{ 
			name: '$content',
			selector: ':scope > :is(.content, .content-fluid)'
		}
	];

	registerControls() {

		this.addControl('isFluid', 'general', {
			type: 'combobox',
			label: 'Contenido fluido',
			store: [
				{ idx: 'no', name: 'Contenido no fluido' },
				{ idx: 'yes', name: 'Contenido fluido' }
			],
			valueKey: 'idx',
			displayKey: 'name',
			listeners: {
				select: (value) => {

					this.applySettings({ isFluid: value }, true);
				}
			},
			default: 'no'
		});

		// Section utility classes as checkboxes (implemented as combobox yes/no)
		this.addControl('noPaddingY', 'general', {
			type: 'combobox',
			label: 'No padding vertical',
			store: [ { idx: 'no', name: 'No' }, { idx: 'yes', name: 'Sí' } ],
			valueKey: 'idx',
			displayKey: 'name',
			default: 'no',
			listeners: {
				select: (value) => {
					// rebuild classes
					let classes = (this.settings.classes || '').split(/\s+/).filter(Boolean);
					classes = classes.filter(c => c !== 'no-padding-y');
					if (value === 'yes') classes.push('no-padding-y');
					this.applySettings({ classes: classes.join(' ').trim() }, true);
				}
			}
		});

		this.addControl('xDirection', 'general', {
			type: 'combobox',
			label: 'Dirección X',
			store: [ { idx: 'no', name: 'No' }, { idx: 'yes', name: 'Sí' } ],
			valueKey: 'idx',
			displayKey: 'name',
			default: 'no',
			listeners: {
				select: (value) => {
					let classes = (this.settings.classes || '').split(/\s+/).filter(Boolean);
					classes = classes.filter(c => c !== 'x-direction');
					if (value === 'yes') classes.push('x-direction');
					this.applySettings({ classes: classes.join(' ').trim() }, true);
				}
			}
		});

		this.addControl('xItemsSpace', 'general', {
			type: 'combobox',
			label: 'Espaciado X',
			store: [ { idx: 'no', name: 'No' }, { idx: 'yes', name: 'Sí' } ],
			valueKey: 'idx',
			displayKey: 'name',
			default: 'no',
			listeners: {
				select: (value) => {
					let classes = (this.settings.classes || '').split(/\s+/).filter(Boolean);
					classes = classes.filter(c => c !== 'x-items-space');
					if (value === 'yes') classes.push('x-items-space');
					this.applySettings({ classes: classes.join(' ').trim() }, true);
				}
			}
		});

			this.addControl('sectionVariant', 'general', {
				type: 'combobox',
				label: 'Tipo de sección',
				store: [
					{ idx: '', name: 'Por defecto' },
					{ idx: 'section-valores', name: 'Valores' },
					{ idx: 'section-why-choose-us', name: 'Why Choose Us' },
					{ idx: 'section-contact-us', name: 'Contacto' },
					{ idx: 'section-plana-docente', name: 'Plana docente' },
					{ idx: 'section-campus', name: 'Campus' },
					{ idx: 'section-palabras', name: 'Palabras' },
					{ idx: 'section-mision-vision', name: 'Misión y Visión' },
					{ idx: 'section-noticias-eventos', name: 'Noticias y Eventos' },
					{ idx: 'section-experiencias', name: 'Experiencias' }
				],
				valueKey: 'idx',
				displayKey: 'name',
				default: '',
				listeners: {
					select: (value) => {
						this.applySettings({ sectionVariant: value }, true);
					}
				}
			});

			this.addControl('sectionBg', 'general', {
				type: 'combobox',
				label: 'Fondo de sección',
				store: [
					{ idx: '', name: 'Por defecto' },
					{ idx: 'dark-bg', name: 'Fondo oscuro' },
					{ idx: 'gray-bg', name: 'Fondo gris' },
					{ idx: 'red-bg', name: 'Fondo rojo' },
					{ idx: 'theme-bg', name: 'Fondo tema' }
				],
				valueKey: 'idx',
				displayKey: 'name',
				default: '',
				listeners: {
					select: (value) => {
						this.applySettings({ sectionBg: value }, true);
					}
				}
			});

			super.registerControls();
	}

	edit(settings) {

		console.log('edit Section');
		let {
			classes,
			isFluid
		} = settings;

		//this.$content.className = this.$content.className + (isFluid ? 'is-fluid' : '');
		
		//classes && this.$block.classList.add(...classes.split(' '));
		
		this.applyElementAttributes('edit', '$block', {
			class: (this.getElementAttribute('$block', 'class') + ' ' + classes).trim()
		});

		// Normalize and apply selected section variant and background
		try {
			const variants = ['section-valores','section-why-choose-us','section-contact-us','section-plana-docente','section-campus','section-palabras','section-mision-vision','section-noticias-eventos','section-experiencias'];
			const bgs = ['dark-bg','gray-bg','red-bg','theme-bg'];
			// remove existing variant/bg classes
			for (let v of variants) this.$block.classList.remove(v);
			for (let b of bgs) this.$block.classList.remove(b);

			if (settings.sectionVariant) this.$block.classList.add(settings.sectionVariant);
			if (settings.sectionBg) this.$block.classList.add(settings.sectionBg);
		} catch (e) {
			console.warn('Could not apply section variant/bg', e);
		}
		this.$content.className = (isFluid == 'yes' ? 'content-fluid' : 'content') ;


		this.editBlocksItems(this.$content);
		//this.renderInnerBlocks(this.$content);
		//this.getInnerBlocks(this.$content);
		
		return super.edit();
		//return this.$block;
	}

	save(settings) {

		let {
			$block,
			$content 
		} = this.getBlockElements();

		let {
			isFluid,
			classes
		} = settings;

		$content.className = (isFluid == 'yes' ? 'content-fluid' : 'content');
		classes && $block.classList.add(...classes.split(' '));

		// Apply variant and background classes to saved block
		try {
			const variants = ['section-valores','section-why-choose-us','section-contact-us','section-plana-docente','section-campus','section-palabras','section-mision-vision','section-noticias-eventos','section-experiencias'];
			const bgs = ['dark-bg','gray-bg','red-bg','theme-bg'];
			for (let v of variants) $block.classList.remove(v);
			for (let b of bgs) $block.classList.remove(b);

			settings.sectionVariant && settings.sectionVariant.length && $block.classList.add(settings.sectionVariant);
			settings.sectionBg && settings.sectionBg.length && $block.classList.add(settings.sectionBg);
		} catch (e) {
			console.warn('Could not set section classes on save', e);
		}

		this.saveBlocksItems($content);

		return $block;
	}
}
class Column extends ContainerBlock {

	blockName = 'column';
	blockTitle = 'Columna';
	blockHTML = '<div class="column" data-block="column"></div>';

	edit(settings) {

		let {
			classes
		} = settings;
		//this.renderInnerBlocks(this.$block);
		classes && this.$block.classList.add(...classes.split(' '));
		this.editBlocksItems(this.$block);
		return this.$block;
	}

	save(settings) {

		let {
			classes
		} = settings;

		let {
			$block 
		} = this.getBlockElements();

		classes && $block.classList.add(...classes.split(' '));
		this.saveBlocksItems($block);

		return $block;
	}
}
class Columns extends ContainerBlock {

	blockName = 'columns';
	blockTitle = 'Columnas';
	blockHTML = '<div class="columns" data-block="columns"></div>';

	registerControls() {

		this.addControl('columns', '', {
			type: 'combobox',
			label: 'Número de columnas',
			store: [
				{ idx: '1', name: '1' },
				{ idx: '2', name: '2' },
				{ idx: '3', name: '3' },
				{ idx: '4', name: '4' },
				{ idx: '5', name: '5' },
				{ idx: '6', name: '6' }
			],
			default: '3',
			valueKey: 'idx',
			displayKey: 'name',
			listeners: {
				select: (value) => {
					console.log(value);
					this.applySettings({ columns: value }, true);
				}
			}
		});

		/*this.addControl('columns', '', {
			type: '',
			label: 'Columnas por fila'
		})*/

		super.registerControls();
	}

	edit(settings) {

		let {
			columns = 3
		} = settings;
		columns = Math.max(0, Number(columns));
		this.settings.columns = columns;

		let colsList = [];

		if (this.items.length > columns) {
			for (let i = this.items.length - 1; i >= columns; i--) {
				try {
					this.items[i].getBlock().remove();
				} catch (e) {
					console.warn('Could not remove extra column', e);
				}
				this.items.splice(i, 1);
			}
		} else if (this.items.length < columns) {
			for (let i = this.items.length; i < columns; i++) {
				colsList.push({
					type: 'Column',
					settings: {},
					html: '',
					items: []
				});
			}
			this.addBlockItems(colsList);
		}

		//let count = this.items.length

		/*for (let i = 0; i < columns; i++) {

			if (this.items[i])
				continue;

			this.items.push((new Column()).init({}));
			//this.addInnerBlocks((new Column()).init({}));
		}*/

		this.editBlocksItems(this.$block, []);
		//this.renderInnerBlocks(this.$block);

		return this.$block;
	}

	save(settings) {

		let {
			$block
		} = this.getBlockElements();

		this.saveBlocksItems($block);

		return $block;
	}
}
class ImageBox extends Block {

	//dom = null
	blockName = 'image-box';
	blockTitle = 'Caja de imagen';
	blockHTML = 
		`<div class="image-box" data-block="image-box">
			<div class="image-box_image">
				<img src="" height="" width="" alt=""/>
			</div>
			<div class="image-box_content">
				<h3 class="title"></h3>
				<div class="description"></div>
			</div>
		 </div>`;
	blockChildren = [ //blockElements //blockSubElements //childEls //children //blockElements //blockChildren
		{
			name: '$img',
			selector: 'img'
		},
		{
			name: '$image',
			selector: '.image-box_image'
		},
		{
			name: '$content',
			selector: '.image-box_content'
		},
		{
			name: '$description',
			selector: '.description'
		},
		{
			name: '$title',
			selector: '.title'
		}
	];
	blockParts = [ //optionals
		{
			name: '$link',
			html:
				`<a href="">
					<span data-name=""></span>
				 </a>`,
			children: [ //children //elements
				{
					name: '$text',
					selector: 'span'
				}
			]
		},
		{
			name: '$imageboxLink',
			html: '<a href=""></a>'
		},
		{
			name: '$button',
			html: 
				`<div>
					<button></button>
				 </div>`
		}
	];
	registerControls() {

		this.addControl('image', '', {
			type: 'imagefield',
			label: 'Imagen',
			default: {
				url: (_editor_path_rel || window.editor_path_relative || (typeof editor_vars !== 'undefined' && editor_vars.editor_path ? editor_vars.editor_path.replace(/^https?:\/\/[^/]+/, '') : '/wp-content/themes/educacion-editor/classes/blocks-editor')) + '/img/image-placeholder.jpg',
				width: 800,
				height: 540
			},
			listeners: {
				insert: (value) => {
				    
					let { alt, url, width, height } = value;
					this.applySettings({ image: { alt, url, width, height } }, true);
				}
			}
		});

		this.addControl('title', '', {
			type: 'textfield',
			label: 'Título',
			default: 'Escriba un título',
			listeners: {
				input: ($this) => {
					this.applySettings({ title: $this.getValue() }, true);
				}
			}
		});

		/*this.addControl('description', '', {
			type: 'textarea',
			label: 'Descripción',
			default: 'Escriba una descripción para este bloque aquí. Texto de ejemplo',
			listeners: {
				input: ($this) => {
					this.applySettings({ description: $this.getValue() }, true);
				}
			}
		});*/
		
		this.addControl('description', '', {
		   type: 'htmleditor' ,
		   label: 'Descripción',
		   default: 'Escriba una descripción para este bloque aquí. Texto de ejemplo',
		   listeners: {
                input: ($this, value) => {
                    this.applySettings({ description: value }, true);
                }
		   }
		});
		this.addControl('imgPosition', '', {
			type: 'combobox',
			label: 'Posición de imagen',
			store: [
				{ idx: 'left', name: 'Izquierda' },
				{ idx: 'top', name: 'Arriba' },
				{ idx: 'right', name: 'Derecha' }
			],
			default: 'top',
			valueKey: 'idx',
			displayKey: 'name',
			listeners: {
				select: (value) => {

					this.applySettings({ imgPosition: value }, true);
				}
			}
		});
		
		this.addControl('linkText', '', {
			type: 'textfield',
			label: 'Texto del enlace',
			default: 'Ver más',
			listeners: {
				input: ($this, value) => {
					this.applySettings( { linkText: $this.getValue() }, true );
				}
			}
		});
		
		this.addControl('link', '', {
			type: 'textfield',
			label: 'Enlace',
			default: '',
			listeners: {
				input: ($this, value) => {
					this.applySettings( { link: $this.getValue() }, true );
				}
			}
		});

		super.registerControls();
	}
	//block hace referencia a la clase en general //deberia re query los elementos?
	/*getBlockElements(clone) { //not getChildren //not getSubElements //not getBlockParts

		let parts = {};

		if (clone) {
		}

		return parts;
	}*/
	setImage($element, config = {}) {

		let $image;

		if (!$element) {
			$image = this.$image
		} else {
			$image = $element;
		}

		$image.src = config.url;
		$image.width = config.width;
		$image.height = config.height;
	}
	edit(settings, isSelected) {

		console.log(this.$block.isConnected ? 'Conectado' : 'No Conectado');
		console.log(settings);

		let {
			image,
			title,
			description,
			imgPosition, //imagePosition
			link,
			linkText
		} = settings;

		/*if (description !== '') {
			this.$description.textContent = description;
		} else {
			this.$description.remove();
		}*/

		this.$description.innerHTML = description;
		this.$title.textContent = title || this.controls.title.default;

		if (!this.$title.ondblclick) {

			this.$title.ondblclick = (e) => {

				this.$title.contentEditable = true;
				this.$title.focus();
			}
			this.$title.onblur = (e) => {

				this.$title.contentEditable = false;
			}
		}

		!this.$title.oninput && (this.$title.oninput = (e) => {

		});

		/*if (title !== '') {
			this.$title.textContent = title;
		} else {
			this.$title.text
		}*/

		if ((imgPosition == 'left' || imgPosition == 'top') && this.$image.previousElementSibling === this.$content) {

			this.$image.after(this.$content);

		} else if (imgPosition == 'right' && this.$image.nextElementSibling === this.$content) {

			this.$image.before(this.$content);
		}

		this.setImage(this.$img, image);
		/*this.applyBlockAttributes({
			className: imagePosition,
			style: {}
		});*/
		
		this.$link = this.$link || this.create('<a class="link" href="" target="_blank"></a>');

		if (link !== '') {

			this.$link.href = link;
			this.$link.textContent = linkText;
			
			if (!this.$content.contains(this.$link)) {

				this.$content.append(this.$link);
			}
		} else {

			this.$link.remove();
		}
		//this.applyBlockAttributes();
		/*this.setAttributes(this.$block, this.applyBlockAttributes({
			className: imagePosition,
			style: ''
		}));*/
		this.$block.className = 'image-box ' + 'image-'+ imgPosition;

		return this.$block;
	}

	save(settings) {

		let {
			image,
			title,
			description,
			imgPosition, //imagePosition
			link,
			linkText
		} = settings;

		let {
			$block,
			$img,
			$image,
			$content,
			$title,
			$description,
			$link
		} = this.getBlockElements();

		//console.log(this.getBlockElements());
		$title.textContent = title || this.controls.title.default;

		if (description !== '') {
			$description.innerHTML = description;
		} else {
			$description.remove();
		}
		//$description.textContent = description;

		this.setImage($img, image);

		if ((imgPosition == 'left' || imgPosition == 'top') && $image.previousElementSibling === $content) {

			$image.after($content);

		} else if (imgPosition == 'right' && $image.nextElementSibling === $content) {

			$image.before($content);
		}

		$link = this.create('<a class="link" href="" target="_blank"></a>');

		if (link !== '') {

			$link.href = link;
			$link.textContent = linkText;

			$content.append($link);
		}

		$block.className = 'image-box ' + 'image-'+ imgPosition;

		return $block;
	}
	/*edit(settings, isSelected) {

		console.log(this.$block.isConnected ? 'Conectado' : 'No Conectado');
		console.log(settings);

		let {
			image,
			title,
			description,
			imgPosition //imagePosition
		} = settings;

		//if (description !== '') {
		//	this.$description.textContent = description;
		//} else {
		//  this.$description.remove();
		//}

		this.$description.textContent = description;
		this.$title.textContent = title || this.controls.title.default;

		if (!this.$title.ondblclick) {

			this.$title.ondblclick = (e) => {

				this.$title.contentEditable = true;
				this.$title.focus();
			}
			this.$title.onblur = (e) => {

				this.$title.contentEditable = false;
			}
		}

		!this.$title.oninput && (this.$title.oninput = (e) => {

		});

		//if (title !== '') {
		//	this.$title.textContent = title;
		//} else {
		//	this.$title.text
		//}

		if ((imgPosition == 'left' || imgPosition == 'top') && this.$image.previousElementSibling === this.$content) {

			this.$image.after(this.$content);

		} else if (imgPosition == 'right' && this.$image.nextElementSibling === this.$content) {

			this.$image.before(this.$content);
		}

		this.setImage(this.$img, image);
		//this.applyBlockAttributes({
		//	className: imagePosition,
		//	style: {}
		//});

		//this.applyBlockAttributes();
		//this.setAttributes(this.$block, this.applyBlockAttributes({
		//	className: imagePosition,
		//	style: ''
		//}));
		this.$block.className = 'image-box ' + 'image-'+ imgPosition;

		return this.$block;
	}*/

	/*save(settings) {

		let {
			image,
			title,
			description,
			imgPosition //imagePosition
		} = settings;

		let {
			$block,
			$img,
			$image,
			$content,
			$title,
			$description
		} = this.getBlockElements();

		//console.log(this.getBlockElements());
		$title.textContent = title || this.controls.title.default;

		if (description !== '') {
			$description.textContent = description;
		} else {
			$description.remove();
		}
		//$description.textContent = description;

		this.setImage($img, image);

		if ((imgPosition == 'left' || imgPosition == 'top') && this.$image.previousElementSibling === this.$content) {

			this.$image.after(this.$content);

		} else if (imgPosition == 'right' && this.$image.nextElementSibling === this.$content) {

			this.$image.before(this.$content);
		}

		$block.className = 'image-box ' + 'image-'+ imgPosition;

		return $block;
	}*/
	/*save(settings) {

		let {
			$block,
			$content,
			$image,
			$title,
			$description,
			$link
		} = this.getBlockElements(true); //dom elements references

		let {
			image,
			title,
			titleLevel,
			description,
			link,
			linkText,
			classes,
			styles
		} = settings; //config

		this.setImage($image, image);
		this.setAttributes($image, image);

		titleLevel = titleLevel ?? 'h3';

		$title.innerHTML = `<${title_level}>${title}</${title_level}>`;

		if (!description) {

			$description.remove();
		} else {
			$description.innerHTML = description;
		}

		if (link) {

			$link.textContent = link_text;
			$content.append($link);
		}
		this.setStyles($block, styles);

		return $block;
	}*/
}
class ImageBoxGroup extends ContainerBlock {

	blockName = 'image-box-group';
	blockTitle = 'Grupo de caja de imagen';
	blockHTML = '<div class="image-box-group" data-block="image-box-group"></div>';

	registerControls() {

		this.addControl('columns', '', {
			type: 'combobox',
			label: 'Número de columnas (Escritorio)',
			store: [
				{ idx: '1', name: '1' },
				{ idx: '2', name: '2' },
				{ idx: '3', name: '3' },
				{ idx: '4', name: '4' },
				{ idx: '5', name: '5' },
				{ idx: '6', name: '6' }
			],
			default: '3',
			valueKey: 'idx',
			displayKey: 'name',
			listeners: {
				select: (value) => {

					console.log(value);
					this.applySettings({ columns: value }, true);
				}
			}
		});

		this.addControl('amount', '', {
			type: 'combobox',
			label: 'Cantidad de elementos',
			store: [
				{ idx: '1', name: '1' },
				{ idx: '2', name: '2' },
				{ idx: '3', name: '3' },
				{ idx: '4', name: '4' },
				{ idx: '5', name: '5' },
				{ idx: '6', name: '6' },
				{ idx: '7', name: '7' },
				{ idx: '8', name: '8' },
				{ idx: '9', name: '9' },
				{ idx: '10', name: '10' },
				{ idx: '11', name: '11' },
				{ idx: '12', name: '12' }
			],
			default: '3',
			valueKey: 'idx',
			displayKey: 'name',
			listeners: {
				select: (value) => {

					this.applySettings({ amount: value }, true);
				}
			}
		});
		super.registerControls();
	}

	edit(settings) {

		let {
			amount,
			columns,
			classes
		} = settings;

		let elements = [];

		if (+amount >= this.items.length) {

			let elements = [];

			for (let i = 0; i < amount; i++) {

				//colsList.push(BlocksEditor.create('Column', {}, '')); //Dar soporte luego

				if (this.items[i])
					continue;

				elements.push({
					type: 'ImageBox',
					settings: {},
					html: ''
				});
			}
			this.addBlockItems(elements);
			
		} else {

			let elements = [];
			let iterations = this.items.length - amount;
			iterations = this.items.length - iterations;
			console.log(iterations);

			for (let i = this.items.length - 1; iterations <= i; i--) {

				console.log(amount, i);
				this.items[i].getBlock().remove();
				this.items.splice(i, 1);
			}
			//this.removeBlockItems(); //poner dentro de editBLockItems
		}

		//let count = this.items.length

		/*for (let i = 0; i < columns; i++) {

			if (this.items[i])
				continue;

			this.items.push((new Column()).init({}));
			//this.addInnerBlocks((new Column()).init({}));
		}*/
		classes && this.$block.classList.add(...classes.split(' '));

		this.$block.style.setProperty('--columns-number', columns);
		this.editBlocksItems(this.$block, []);
		//this.renderInnerBlocks(this.$block);

		return this.$block;
	}

	save(settings) {

		let {
			$block
		} = this.getBlockElements();

		let {
			amount,
			columns,
			classes
		} = settings;

		this.saveBlocksItems($block);
		classes && $block.classList.add(...classes.split(' '));

		$block.style.setProperty('--columns-number', columns);

		return $block;
	}
}
class ImagesSlider extends Block {

	blockName = 'images-slider';
	blockTitle = 'Slider de imagenes';
	blockHTML = 
		`<div class="images-slider" data-block="images-slider">
			<div class="images-slider_slides"></div>
		 </div>`;
	blockChildren = [
		{
			name: '$slides',
			selector: '.images-slider_slides'
		}
	];

	registerControls() {

		this.addControl('images', '', {
			type: 'repeater-2',
			label: 'Imagenes',
			fields: [
				{
					type: 'imagefield',
					label: 'Imagen',
					name: 'image',
					index: 'image',
					value: {
						url: _editor_path_rel + '/img/image-placeholder.jpg',
						width: 800,
						height: 540
					},
					listeners: {
						insert: (value, $this) => {

							let {
								url,
								width,
								height,
								alt
							} = value;
							let index = Array.from($this.$dom.closest('.field-body').firstElementChild.children).indexOf($this.$dom.closest('.repeater-item'));
							let settings = this.settings.images[index]['image'] = { alt, url, width, height };
							//let settings = this.settings.images[index] = { image: { alt, url, width, height } };
							
							this.edit(this.settings);
							//this.applySettings(settings, true);
						}
					}
				},
				{
				    type: 'textfield',
					label: 'Titulo',
					name: 'title',
					index: 'title',
					value: 'Titulo de slide',
					listeners: {
					    input: ($this) => {
					        
					        let index = Array.from($this.$dom.closest('.field-body').firstElementChild.children).indexOf($this.$dom.closest('.repeater-item'));
							let settings = this.settings.images[index]['title'] = $this.getValue();
							
							this.edit(this.settings);
					    }
					}
				},
				{
				    type: 'htmleditor',
					label: 'Descripcion',
					name: 'description',
					index: 'description',
					value: 'Descripcion del slide',
					listeners: {
					    input: ($this, value) => {
					        
					        let index = Array.from($this.$dom.closest('.field-body').firstElementChild.children).indexOf($this.$dom.closest('.repeater-item'));
							let settings = this.settings.images[index]['description'] = value;
							
							this.edit(this.settings);
					    }
					}
				}
			],
			default: [
				{
					image: {
						url: _editor_path_rel + '/img/image-placeholder.jpg',
						width: 800,
						height: 540
					},
					title: 'Titulo de slide'
				},
				{
					image: {
						url: _editor_path_rel + '/img/image-placeholder.jpg',
						width: 800,
						height: 540
					},
					title: 'Titulo de slide'
				}
			],
			/*listeners: {
				append: ($this) => {
					console.log($this);
				}
			},*/
			listeners: {
				append: ($this) => {
				    console.log('called from event append');
					//console.log();
					this.applySettings({images: $this.getValue()}, true);
				},
				remove: ($this) => {
				    console.log('called from event remove');
				    this.applySettings({images: $this.getValue()}, true);
				}
			}
		});//http://localhost/wordpress_5/wp-content/uploads/2022/05/Tulips.jpg

		super.registerControls();
	}

	edit(settings) {
	    
	    console.log(settings);
	    
		let {
			images
		} = settings;

		this.$slides.innerHTML = '';

		for (let i = 0; i < images.length; i++) {
		    
		    let klass = !(i % 2) ? 'rfl' : 'lfr';
		    
			let image = images[i].image,
			    title = images[i].title,
			    description = images[i].description,
				src = image.url,
				width = image.width,
				height = image.height,
				slide = this.create(
					`<div class="slide" style="aspect-ratio: 3 / 1;">
						<img style="display: block; width: 100%; height: 100%; object-fit: cover" src="${src}" width="${width}" height="${height}" alt="">
						${title ? `<div class="title caption t2 ${klass}">${title}</div>` : ``}
						${description ? `<div class="description caption t4 ${klass}">${description}</div>` : ``}
					 </div>`
				);
			//a.push(slide);
			this.$slides.append(slide);
		}

		return this.$block;
	}

	save(settings) {

		let {
			images
		} = settings;

		let {
			$block,
			$slides
		} = this.getBlockElements();

		for (let i = 0; i < images.length; i++) {
		    
		    let klass = !(i % 2) ? 'rfl' : 'lfr';
		    
			let image = images[i].image,
			    title = images[i].title,
			    description = images[i].description,
				src = image.url,
				width = image.width,
				height = image.height,
				slide = this.create(
					`<div class="slide" style="aspect-ratio: 3 / 1;">
						<img style="display: block; width: 100%; height: 100%; object-fit: cover" src="${src}" width="${width}" height="${height}" alt="">
						${title ? `<div class="title caption t2 ${klass}">${title}</div>` : ``}
						${description ? `<div class="description caption t4 ${klass}">${description}</div>` : ``}
					 </div>`
				);
			//a.push(slide);
			$slides.append(slide);
		}

		return $block;
	}

	render() {

		console.log('render Slider', jQuery, jQuery('.images-slider .images-slider_slides'));

		if (this.$slides.slick)
			jQuery('.images-slider .images-slider_slides').slick('unslick');

		jQuery('.images-slider .images-slider_slides').slick();
	}
}
class CallToAction extends Block { //Siempre tiene boton

	blockTitle = 'Llamada a la accion';
	blockHTML = 
		`<div class="call-to-action" data-block="call-to-action">
			<div class="cta-image">
				<img src="" alt="">
				<div class="overlay"></div>
			</div>
			<div class="cta-content">
				<h2 class="title"></h2>
				<a class="button" href=""></a>
			</div>
		 </div>`;
	blockChildren = [
		{
			name: '$image',
			selector: 'img'
		},
		{
			name: '$title',
			selector: '.title'
			//selector: '.title :is(h2, h3, h4)'
		},
		{
			name: '$link',
			selector: 'a.button'
		}
	];

	registerControls() {

		this.addControl('image', '', {
			type: 'imagefield',
			label: 'Imagen de fondo',
			default: {
				url: _editor_path_rel + '/img/image-placeholder.jpg',
				width: 800,
				height: 540
			},
			listeners: {
				insert: (value) => {
					//console.log(value);
					let { alt, url, width, height } = value;
					this.applySettings({ image: { alt, url, width, height } }, true);
				}
			}
		});

		this.addControl('title', '', {
			type: 'textfield',
			label: 'Título',
			default: 'Escriba un título',
			listeners: {
				input: ($this) => {
					this.applySettings({ title: $this.getValue() }, true);
				}
			}
		});

		this.addControl('description', '', {
			type: 'textarea',
			label: 'Descripcion',
			default: 'Escriba una descripcion',
			listeners: {
				input: ($this) => {
					this.applySettings({ description: $this.getValue() }, true);
				}
			}
		});

		this.addControl('link', '', {
			type: 'textfield',
			label: 'Enlace del botón',
			default: '',
			listeners: {
				input: ($this) => {
					this.applySettings({ link: $this.getValue() }, true);
				}
			}
		});

		this.addControl('linkText', '', {
			type: 'textfield',
			label: 'Texto del botón',
			default: 'IR AL ENLACE',
			listeners: {
				input: ($this) => {
					this.applySettings({ linkText: $this.getValue() }, true);
				}
			}
		});

		super.registerControls();
	}

	setImage($element, config = {}) {

		let $image;

		if (!$element) {
			$image = this.$image
		} else {
			$image = $element;
		}

		$image.src = config.url;
		$image.width = config.width;
		$image.height = config.height;
	};

	edit(settings) {

		let {
			image,
			title,
			link,
			linkText
		} = settings;

		this.setImage(this.$image, image); //reemplazar con set attributes general 

		this.$title.textContent = title; //Tal vez reemplazar con alguna funcion que lo haga mas automatico
		this.$link.textContent = linkText;
		//this.$link.href = link.startsWith('http://') ? link : 'http://'+ link;
		this.$link.href = link;

		return this.$block;
	}

	save(settings) {

		let {
			image,
			title,
			link,
			linkText
		} = settings;

		let {
			$image,
			$block,
			$title,
			$link,
		} = this.getBlockElements();

		this.setImage($image, image); //reemplazar con set attributes general 

		$title.textContent = title; //Tal vez reemplazar con alguna funcion que lo haga mas automatico
		$link.textContent = linkText;
		//$link.href = link.startsWith('http://') ? link : 'http://'+ link;
		$link.href = link;

		return $block;
	}
	/*save(settings) {

		return null;
	}*/
}
class Heading extends Block {

	blockTitle = 'Titulo';
	blockHTML = 
		`<div class="heading" data-block="heading">
			<h2></h2>
		 </div>`;
	blockChildren = [
		{ 
			name: '$title', selector: ':is(h2, h3, h4, h5, h6)'
		}
	];

	registerControls() {

		this.addControl('text', '', {
			type: 'textfield',
			label: 'Texto',
			default: 'Escriba un texto como titulo',
			listeners: {
				input: ($this) => {
					this.applySettings({ text: $this.getValue() || this.controls.text.default  }, true);
				}
			}
		});
		this.addControl('align', '', {
			type: 'combobox',
			label: 'Alineación del título',
			store: [
				{ idx: 'left', name: 'Izquierda' },
				{ idx: 'center', name: 'Centro' },
				{ idx: 'right', name: 'Derecha' }
			],
			default: 'left',
			displayKey: 'name',
			valueKey: 'idx',
			listeners: {
				select: (value) => {

					this.applySettings({ align: value }, true);
				}
			}
		});
	}
	edit(settings) {

		let {
			text,
			align
		} = settings;

		this.$title.textContent = text;
		this.$title.style.textAlign = align;

		return this.$block;
	}

	save(settings) {

		let {
			$block,
			$title
		} = this.getBlockElements();

		let {
			text,
			align
		} = settings;

		$title.textContent = text;
		$title.style.textAlign = align;

		return $block;
	}
}
class Image extends Block {

	blockTitle = 'Imagen';
	blockHTML = 
		`<div class="image" data-block="image">
			<img src="" width="" height="" alt="">
		 </div>`;
	blockName = 'image';
	blockChildren = [
		{
			name: '$image',
			selector: 'img'
		},
		{
			name: '$link', //listen when this element append to block
			selector: 'a'
		}
	];

	registerControls() {

		this.addControl('image', '', {
			type: 'imagefield',
			label: 'Imagen',
			default: {
				url: _editor_path_rel + '/img/image-placeholder.jpg',
				width: 800,
				height: 540
			},
			//default: '',
			listeners: {
				insert: (value) => {

					let { alt, url, width, height } = value;
					
					this.applySettings({ image: { alt, url, width, height } }, true);
				}
			}
		});
		this.addControl('link', '', {
			type: 'textfield',
			label: 'Enlace de la imagen',
			default: '',
			listeners: {
				input: ($this, value) => {
					this.applySettings( { link: $this.getValue() }, true );
				}
			}
		});

		// Width class selector for the image (optional)
		this.addControl('imageWidth', '', {
			type: 'combobox',
			label: 'Ancho de imagen (clase)',
			store: [
				{ idx: '', name: 'Sin clase (mostrar original)' },
				{ idx: 'width-80', name: '80px' },
				{ idx: 'width-85', name: '85px' },
				{ idx: 'width-95', name: '95px' },
				{ idx: 'width-100', name: '100px' },
				{ idx: 'width-105', name: '105px' },
				{ idx: 'width-115', name: '115px' },
				{ idx: 'width-125', name: '125px' },
				{ idx: 'width-135', name: '135px' },
				{ idx: 'width-150', name: '150px' },
				{ idx: 'width-165', name: '165px' },
				{ idx: 'width-180', name: '180px' },
				{ idx: 'width-200', name: '200px' },
				{ idx: 'width-300', name: '300px' },
				{ idx: 'width-400', name: '400px' },
				{ idx: 'width-500', name: '500px' },
				{ idx: 'width-700', name: '700px' },
				{ idx: 'width-1000', name: '1000px' }
			],
			valueKey: 'idx',
			displayKey: 'name',
			default: '',
			listeners: {
				select: (value) => {
					// Update the generic `classes` setting so template_structure/template_html include it
					this.applySettings({ classes: value }, true);
				}
			}
		});

		super.registerControls();
	}
	setImage($element, config = {}) {

		let $image;

		if (!$element) {
			$image = this.$image
		} else {
			$image = $element;
		}

		$image.src = config.url;
		$image.width = config.width;
		$image.height = config.height;
	}
	edit(settings) {

		let {
			link,
			image,
			classes
		} = settings;

		this.setImage(this.$image, image);
		/*classes && this.$block.classList.add(...classes.split(' '));*/
		
		this.applyElementAttributes('edit', '$block', {
			class: (this.getElementAttribute('$block', 'class') + ' ' + classes).trim()
		});

		if (link !== '') {

			if (!this.$link) {

				this.$link = this.create('<a class="link" href="" target="_blank"></a>');
			}

			if (!this.$block.contains(this.$link)) {

				this.$block.append(this.$link);
				this.$link.append(this.$image);
			}

			this.$link.href = link;

		} else if (this.$link) {

			this.$block.append(this.$image);
			this.$link.remove();
		}
		
		return super.edit();
		//return this.$block;
	}
	save(settings) {

		let {
			$block,
			$image,
			$link
		} = this.getBlockElements();

		let {
			link,
			image,
			classes
		} = settings;

		let $blockClone = this.$block.cloneNode(true);
		$blockClone.removeAttribute('data-edit-mode');
		classes && $blockClone.classList.add(...classes.split(' '));
		$blockClone.querySelector('.block-ui-frame').remove();

		return $blockClone;
	}
}
class Paragraph extends Block {

	blockTitle = 'Parrafo';
	blockHTML = 
		`<div class="paragraph" data-block="paragraph">
			<div class="content"></div>
		 </div>`;
	blockName = 'paragraph';
	blockChildren = [
		{ 
			name: '$content', 
			selector: '.content'
		}
	];

	registerControls() {

		this.addControl('text', '', {
			type: 'htmleditor',
			label: 'Texto',
			default: `<p><b>Edite este texto aleatorio</b> <b><i>Lorem Ipsum</i></b> is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.</p>`,
			listeners: {
				input: ($this, value) => {
					this.applySettings({ text: value }, true);
				}
			}
		});
	}
	edit(settings) {

		let {
			text
		} = settings;

		this.$content.innerHTML = text;

		return this.$block;
	}
	save(settings) {

		let {
			$block,
			$content
		} = this.getBlockElements();


		let {
			text = '',
			shortcode = ''
		} = settings;

		// Preserve the shortcode as a data attribute so the server can process it if needed
		if (shortcode) {
			$block.setAttribute('data-shortcode', shortcode);
		}

		// If this paragraph is currently selected, sync the active Simditor editor value.
		try {
			if (typeof BlocksEditor !== 'undefined' && BlocksEditor.selectedBlock === this) {
				var mainDoc = Block.mainDocument || document;
				var textarea = mainDoc.querySelector('.blocks-controls textarea');
				if (textarea) {
					if (window.jQuery) {
						var inst = window.jQuery(textarea).data && window.jQuery(textarea).data('simditor');
						if (inst && typeof inst.getValue === 'function') {
							var v = inst.getValue();
							if (v !== undefined && v !== null) {
								text = v;
							}
						}
					}
					if (!text && textarea.value !== undefined) {
						text = textarea.value;
					}
				}
			}
		} catch (e) {
			console.warn('Paragraph.save: could not sync Simditor instance', e);
		}

		$content.innerHTML = text || '';

		return $block;
	}
}
class IconBox extends Block {

	blockName = 'icon-box';
	blockTitle = 'Caja de icono';
	blockHTML = 
		`<div class="icon-box" data-block="icon-box">
			<div class="icon-box_icon">
				<i class="fa"></i>
			</div>
			<div class="icon-box_content">
				<h3 class="title"></h3>
				<div class="description"></div>
			</div>
		 </div>`;
	blockChildren = [ //blockElements //blockSubElements //childEls //children //blockElements //blockChildren
		{
			name: '$i',
			selector: 'i'
		},
		{
			name: '$icon',
			selector: '.icon-box_icon'
		},
		{
			name: '$content',
			selector: '.icon-box_content'
		},
		{
			name: '$description',
			selector: '.description'
		},
		{
			name: '$title',
			selector: '.title'
		}
	];
	registerControls() {

		this.addControl('icon', '', {
			type: 'iconpicker',
			label: 'Icono',
			default: 'fa-child',
			listeners: {
				select: (value) => {
					console.log(value);
					this.applySettings({ icon: value }, true);
					/*let { alt, url, width, height } = value;*/
					/*this.applySettings({ image: { alt, url, width, height } }, true);*/
				}
			}
		});

		this.addControl('title', '', {
			type: 'textfield',
			label: 'Título',
			default: 'Escriba un título',
			listeners: {
				input: ($this) => {
					this.applySettings({ title: $this.getValue() }, true);
				}
			}
		});

		this.addControl('description', '', {
			type: 'textarea',
			label: 'Descripción',
			default: 'Escriba una descripción para este bloque aquí.',
			listeners: {
				input: ($this) => {
					this.applySettings({ description: $this.getValue() }, true);
				}
			}
		});

		this.addControl('iconPosition', '', {
			type: 'combobox',
			label: 'Posición de icono',
			store: [
				{ idx: 'left', name: 'Izquierda' },
				{ idx: 'top', name: 'Arriba' },
				{ idx: 'right', name: 'Derecha' }
			],
			default: 'top',
			valueKey: 'idx',
			displayKey: 'name',
			listeners: {
				select: (value) => {

					this.applySettings({ iconPosition: value }, true);
				}
			}
		});

		this.addControl('link', '', {
			type: 'textfield',
			label: 'Enlace',
			default: '',
			listeners: {
				input: ($this, value) => {
					this.applySettings( { link: $this.getValue() }, true );
				}
			}
		});

		super.registerControls();
	}

	edit(settings, isSelected) {

		let {
			icon,
			title,
			link,
			description,
			iconPosition //imagePosition
		} = settings;

		/*if (description !== '') {
			this.$description.textContent = description;
		} else {
			this.$description.remove();
		}*/

		this.$description.textContent = description;
		this.$title.textContent = title || this.controls.title.default;

		if (!this.$title.ondblclick) {

			this.$title.ondblclick = (e) => {

				this.$title.contentEditable = true;
				this.$title.focus();
			}
			this.$title.onblur = (e) => {

				this.$title.contentEditable = false;
			}
		}

		!this.$title.oninput && (this.$title.oninput = (e) => {

		});

		/*if (title !== '') {
			this.$title.textContent = title;
		} else {
			this.$title.text
		}*/

		if ((iconPosition == 'left' || iconPosition == 'top') && this.$icon.previousElementSibling === this.$content) {

			this.$icon.after(this.$content);

		} else if (iconPosition == 'right' && this.$icon.nextElementSibling === this.$content) {

			this.$icon.before(this.$content);
		}

		if (link !== '') {

			if (!this.$link) {

				this.$link = this.create('<a class="link" href="" target="_blank" style="display: contents"></a>');
			}

			if (!this.$block.contains(this.$link)) {

				this.$block.append(this.$link);
				this.$link.append(this.$icon, this.$content);
			}

			this.$link.href = link;

		} else if (this.$link) {

			this.$block.prepend(this.$icon, this.$content);
			this.$link.remove();
		}
		//this.setImage(this.$img, image);
		this.$i.className = 'fa '+ icon;
		this.$block.className = 'icon-box ' + 'icon-'+ iconPosition;

		return this.$block;
	}

	save(settings) {

		let {
			icon,
			title,
			description,
			link,
			iconPosition //imagePosition
		} = settings;

		let {
			$block,
			$i,
			$icon,
			$content,
			$title,
			$description,
			$link
		} = this.getBlockElements();

		//console.log(this.getBlockElements());
		$title.textContent = title || this.controls.title.default;

		if (description !== '') {
			$description.textContent = description;
		} else {
			$description.remove();
		}

		$i.className = 'fa '+ icon;

		if (link !== '') {

			if (!$link) {

				$link = this.create('<a class="link" href="" target="_blank"></a>');
			}

			$link.href = link;
			$block.append($link);
			$link.append($icon, $content);
			$block = $link;
		}

		if ((iconPosition == 'left' || iconPosition == 'top') && $icon.previousElementSibling === $content) {

			$icon.after($content);

		} else if (iconPosition == 'right' && $icon.nextElementSibling === $content) {

			$icon.before($content);
		}

		$i.className = 'fa '+ icon;

		$block.dataset.block = 'icon-box';
		$block.className = 'icon-box ' + 'icon-'+ iconPosition;

		return $block;
	}
}
class CallToActionGroup extends ContainerBlock {

	blockName = 'call-to-action-group';
	blockTitle = 'Grupo de llamada a la acción';
	blockHTML = '<div class="call-to-action-group" data-block="call-to-action-group"></div>';

	registerControls() {

		this.addControl('columns', '', {
			type: 'combobox',
			label: 'Número de columnas',
			store: [
				{ idx: '1', name: '1' },
				{ idx: '2', name: '2' },
				{ idx: '3', name: '3' },
				{ idx: '4', name: '4' },
				{ idx: '5', name: '5' },
				{ idx: '6', name: '6' }
			],
			default: '3',
			valueKey: 'idx',
			displayKey: 'name',
			listeners: {
				select: (value) => {

					console.log(value);
					this.applySettings({ columns: value }, true);
				}
			}
		});

		this.addControl('amount', '', {
			type: 'combobox',
			label: 'Cantidad de elementos',
			store: [
				{ idx: '1', name: '1' },
				{ idx: '2', name: '2' },
				{ idx: '3', name: '3' },
				{ idx: '4', name: '4' },
				{ idx: '5', name: '5' },
				{ idx: '6', name: '6' }
			],
			default: '3',
			valueKey: 'idx',
			displayKey: 'name',
			listeners: {
				select: (value) => {

					this.applySettings({ amount: value }, true);
				}
			}
		});

		super.registerControls();	
	}

	edit(settings) {

		let {
			columns,
			amount,
			classes
		} = settings;

		console.log(amount, this.items.length, amount >= this.items.length);

		if (+amount >= this.items.length) {

			let elements = [];

			for (let i = 0; i < amount; i++) {

				//colsList.push(BlocksEditor.create('Column', {}, '')); //Dar soporte luego

				if (this.items[i])
					continue;

				elements.push({
					type: 'CallToAction',
					settings: {},
					html: ''
				});
			}
			this.addBlockItems(elements);

		} else {

			let elements = [];
			let iterations = this.items.length - amount;
			iterations = this.items.length - iterations;
			console.log(iterations);

			for (let i = this.items.length - 1; iterations <= i; i--) {

				console.log(amount, i);
				this.items[i].getBlock().remove();
				this.items.splice(i, 1);
			}
			//this.removeBlockItems(); //poner dentro de editBLockItems
		}

		//let count = this.items.length

		/*for (let i = 0; i < columns; i++) {

			if (this.items[i])
				continue;

			this.items.push((new Column()).init({}));
			//this.addInnerBlocks((new Column()).init({}));
		}*/
		classes && this.$block.classList.add(...classes.split(' '));

		this.$block.style.setProperty('--columns-number', columns);
		this.editBlocksItems(this.$block, []);
		//this.renderInnerBlocks(this.$block);

		return this.$block;
	}

	save(settings) {

		let {
			$block
		} = this.getBlockElements();

		let {
			amount,
			columns,
			classes
		} = settings;

		classes && $block.classList.add(...classes.split(' '));
		$block.style.setProperty('--columns-number', columns);
		this.saveBlocksItems($block);

		return $block;
	}
}
class Navigation extends Block {

	blockName = 'navigation';
	blockHTML = 
		`<div class="navigation" data-block="navigation">
			<nav class="navigation-menu"></nav>
			<div class="navigation-toggler">
				<i class="fa fa-bars"></i>
			</div>
		 </div>`;
	blockTitle = 'Menu de navegacion';

	blockChildren = [
		{
			name: '$navigation',
			selector: 'nav'
		},
		{
			name: '$toggler',
			selector: '.navigation-toggler'
		}
	];

	registerControls() {

		this.addControl('menuID', '', {
			type: 'combobox',
			label: 'Seleccione menu',
			default: '',
			valueKey: 'idx',
			displayKey: 'name',
			listeners: {
				select: (value) => {
					console.log(value);
					this.applySettings({ menuID: value }, true);
				}
			},
			store: uix_vars.nav_menus,
			displayKey: 'name',
			valueKey: 'term_id'
		});
	}
	edit(settings) {

		let {
			menuID
		} = settings;

		this.serverBlockRender(this.$navigation);

		return this.$block;
	}
	save(settings) {

		let {
			$block,
			$navigation
		} = this.getBlockElements();

		//$navigation.innerHTML = this.$navigation.innerHTML;
		$navigation.innerHTML = '[['+ JSON.stringify({element:this.blockName, settings: settings})+ ']]';
		return $block;
	}
}
class IconBoxGroup extends ContainerBlock {

	blockName = 'icon-box-group';
	blockTitle = 'Grupo de caja de icono';
	blockHTML = '<div class="icon-box-group" data-block="icon-box-group"></div>';

	registerControls() {

		this.addControl('columns', '', {
			type: 'combobox',
			label: 'Número de columnas (Escritorio)',
			store: [
				{ idx: '1', name: '1' },
				{ idx: '2', name: '2' },
				{ idx: '3', name: '3' },
				{ idx: '4', name: '4' },
				{ idx: '5', name: '5' },
				{ idx: '6', name: '6' }
			],
			default: '3',
			valueKey: 'idx',
			displayKey: 'name',
			listeners: {
				select: (value) => {

					console.log(value);
					this.applySettings({ columns: value }, true);
				}
			}
		});

		this.addControl('amount', '', {
			type: 'combobox',
			label: 'Cantidad de elementos',
			store: [
				{ idx: '1', name: '1' },
				{ idx: '2', name: '2' },
				{ idx: '3', name: '3' },
				{ idx: '4', name: '4' },
				{ idx: '5', name: '5' },
				{ idx: '6', name: '6' }
			],
			default: '3',
			valueKey: 'idx',
			displayKey: 'name',
			listeners: {
				select: (value) => {

					this.applySettings({ amount: value }, true);
				}
			}
		});
		super.registerControls();
	}

	edit(settings) {

		let {
			amount,
			columns,
			classes
		} = settings;

		let elements = [];

		if (+amount >= this.items.length) {

			let elements = [];

			for (let i = 0; i < amount; i++) {

				//colsList.push(BlocksEditor.create('Column', {}, '')); //Dar soporte luego

				if (this.items[i])
					continue;

				elements.push({
					type: 'IconBox',
					settings: {},
					html: ''
				});
			}
			this.addBlockItems(elements);
			
		} else {

			let elements = [];
			let iterations = this.items.length - amount;
			iterations = this.items.length - iterations;
			console.log(iterations);

			for (let i = this.items.length - 1; iterations <= i; i--) {

				console.log(amount, i);
				this.items[i].getBlock().remove();
				this.items.splice(i, 1);
			}
			//this.removeBlockItems(); //poner dentro de editBLockItems
		}

		//let count = this.items.length

		/*for (let i = 0; i < columns; i++) {

			if (this.items[i])
				continue;

			this.items.push((new Column()).init({}));
			//this.addInnerBlocks((new Column()).init({}));
		}*/
		classes && this.$block.classList.add(...classes.split(' '));

		this.$block.style.setProperty('--columns-number', columns);
		this.editBlocksItems(this.$block, []);
		//this.renderInnerBlocks(this.$block);

		return this.$block;
	}

	save(settings) {

		let {
			$block
		} = this.getBlockElements();

		let {
			amount,
			columns,
			classes
		} = settings;

		this.saveBlocksItems($block);
		classes && $block.classList.add(...classes.split(' '));

		$block.style.setProperty('--columns-number', columns);

		return $block;
	}
}
class Testimonials extends Block {

	blockName = 'testimonials';
	blockTitle = 'Testimonios';
	blockHTML = '<div class="testimonials" data-block="testimonials"><div class="testimonials-slider"></div></div>';
	blockChildren = [
		{
			name: '$slider',
			selector: '.testimonials-slider'
		}
	]
	registerControls() {

		this.addControl('elements', '', {
			type: 'repeater-2',
			label: 'Elementos',
			fields: [
				{
					type: 'imagefield',
					label: 'Imagen',
					name: 'image',
					index: 'image',
					value: {
						url: _editor_path_rel + '/img/image-placeholder.jpg',
						width: 800,
						height: 540
					},
					listeners: {
						insert: (value, $this) => {

							let {
								url,
								width,
								height,
								alt
							} = value;

							let index = Array.from($this.$dom.closest('.field-body').firstElementChild.children).indexOf($this.$dom.closest('.repeater-item'));
							let settings = this.settings.elements[index]['image'] = { alt, url, width, height };

							this.edit(this.settings);
							//this.applySettings(settings, true);
						}
					}
				},
				{
					type: 'htmleditor',
					label: 'Contenido',
					name: 'content',
					index: 'content',
					value: 'Descripcion del testimonio, experiencia exitosa del egresado en cuestion',
					listeners: {
						input: ($this, $val) => {

							console.log($val, $this);

							let index = Array.from($this.$dom.closest('.field-body').firstElementChild.children).indexOf($this.$dom.closest('.repeater-item'));
							let settings = this.settings.elements[index]['content'] = $val;

							//this.applySettings(settings, true);
							this.edit(this.settings);
						}
					}
				}
			],
			default: [
				{
					image: {
						url: _editor_path_rel + '/img/image-placeholder.jpg',
						width: 800,
						height: 540
					},
					content: 'Descripcion del testimonio, experiencia exitosa del egresado en cuestion'
				},
				{
					image: {
						url: _editor_path_rel + '/img/image-placeholder.jpg',
						width: 800,
						height: 540
					},
					content: 'Descripcion del testimonio, experiencia exitosa del egresado en cuestion'
				}
			],
			listeners: {
				append: ($this) => {
					this.applySettings({elements: $this.getValue()}, true);
				},
				remove: ($this) => {
					this.applySettings({elements: $this.getValue()}, true);
				}
			}
		});//http://localhost/wordpress_5/wp-content/uploads/2022/05/Tulips.jpg

		super.registerControls();
	}

	edit(settings) {
		
		console.log(settings);

		let {
			elements
		} = settings;

		this.$slider.innerHTML = '';

		for (let i = 0; i < elements.length; i++) {

			let image = elements[i].image,
				src = image.url,
				width = image.width,
				height = image.height,
				content = elements[i].content,
				$slide = this.create(
					`<div class="testimonials-slide">
						<div class="profile">
							<img src="${src}" alt="">
						</div>
						<div class="content">${content}</div>
					</div>`
				);
			//a.push(slide);
			this.$slider.append($slide);
		}

		return this.$block;
	}

	save(settings) {

		let {
			elements
		} = settings;

		let {
			$block,
			$slider
		} = this.getBlockElements();

		for (let i = 0; i < elements.length; i++) {

			let image = elements[i].image,
				src = image.url,
				width = image.width,
				height = image.height,
				content = elements[i].content,
				$slide = this.create(
					`<div class="testimonials-slide">
						<div class="profile">
							<img src="${src}" alt="">
						</div>
						<div class="content">${content}</div>
					</div>`
				);
			//a.push(slide);
			$slider.append($slide);
		}

		return $block;
	}
}
class IconsList extends Block {

	blockName = 'icons-list';
	blockTitle = 'Lista de iconos';
	blockHTML = '<div class="icons-list" data-block="icons-list"><ul class="icons-list_items"></ul></div>';
	blockChildren = [
		{
			name: '$list',
			selector: '.icons-list_items'
		}
	];

	registerControls() {

		this.addControl('elements', '', {
			type: 'repeater-2',
			label: 'Elementos',
			fields: [
				{
					type: 'iconpicker',
					label: 'Icono',
					name: 'icon',
					index: 'icon',
					value: 'fa-child',
					listeners: {
						select: (value, idx, $this) => {
							
							let index = Array.from($this.$dom.closest('.field-body').firstElementChild.children).indexOf($this.$dom.closest('.repeater-item'));
							this.settings.elements[index]['icon'] = value;

							this.edit(this.settings);
							//this.settings.elements[index] = { elements: [{ icon: value }] };
							//let settings = this.settings.elements[index] = { icon: value }; <-

							//this.applySettings(settings, true);
						}
					}
				},
				{
					type: 'textfield',
					label: 'Texto',
					name: 'text',
					index: 'text',
					value: 'Texto del icono',
					listeners: {
						input: ($this, evt) => {

							let index = Array.from($this.$dom.closest('.field-body').firstElementChild.children).indexOf($this.$dom.closest('.repeater-item'));
							this.settings.elements[index]['text'] = $this.getValue();

							this.edit(this.settings);
						}
					}
				},
				{
					type: 'textfield',
					label: 'Enlace',
					name: 'link',
					index: 'link',
					value: '',
					listeners: {
						input: ($this, evt) => {

							let index = Array.from($this.$dom.closest('.field-body').firstElementChild.children).indexOf($this.$dom.closest('.repeater-item'));
							this.settings.elements[index]['link'] = $this.getValue();

							this.edit(this.settings);
						}
					}
				}
			],
			default: [
				{
					text: 'Texto del icono',
					icon: 'fa-child',
					link: ''
				},
				{
					text: 'Texto del icono',
					icon: 'fa-home',
					link: ''
				},
				{
					text: 'Texto del icono',
					icon: 'fa-circle',
					link: ''
				}
			],
			/*listeners: {

				append: ($this) => {
					console.log($this);
				}
			},*/
			listeners: {
				append: ($this) => {
				    console.log('called from event append');
					console.log($this);
					debugger;
					this.applySettings({elements: $this.getValue()}, true);
				},
				remove: ($this) => {
				    console.log('called from event remove');
				    this.applySettings({elements: $this.getValue()}, true);
				}
			}
		});//http://localhost/wordpress_5/wp-content/uploads/2022/05/Tulips.jpg

		this.addControl('direction', '', {
			type: 'combobox',
			label: 'Direccion',
			store: [
				{ idx: 'vertical', name: 'Vertical' },
				{ idx: 'horizontal', name: 'Horizontal' }
			],
			valueKey: 'idx',
			displayKey: 'name',
			listeners: {
				select: (value) => {

					this.applySettings({ direction: value }, true);
				}
			},
			default: 'horizontal'
		})

		super.registerControls();
	}

	edit(settings) {
	    
	    console.log(settings);
	    
		let {
			elements,
			direction
		} = settings;

		this.$list.innerHTML = '';//en realiad deberia recorrer con for los items

		for (let item of elements) {

			let $item = this.create(`<li class="icons-list_item"><i class="fa ${item.icon}"></i><div class="text">${item.text}</div></li>`);

			if (item.link) {

				let $link = this.create(`<a href="${item.link}" target="_blank"></a>`);
				let innerHTML = $item.innerHTML;
				$item.innerHTML = '';
				$item.append($link);
				$link.innerHTML = innerHTML;

				this.$list.append($item);
			} else {

				this.$list.append($item);
			}
		}
		/*if (direction == 'vertical') {

			this.$block.classList.add('vertical-list')
		} else {
			this.$block.classList.add('horizontal-list')
		}*/
		if (direction == 'vertical') {
		    
		    if (this.$block.classList.contains('horizontal-list')) {
		        
		        this.$block.classList.replace('horizontal-list', 'vertical-list');
		    } else {
		        this.$block.classList.add('vertical-list');
		    }
			//this.$block.classList.add('vertical-list');
		} else {
			//this.$block.classList.add('horizontal-list');
			//this.$block.classList.replace('vertical-list', 'horizontal-list');
			
			if (this.$block.classList.contains('vertical-list')) {
		        
		        this.$block.classList.replace('vertical-list', 'horizontal-list');
		    } else {
		        this.$block.classList.add('horizontal-list');
		    }
		}
		
		return this.$block;
	}
}
class PostsGrid extends Block {

	blockTitle = 'Grilla de Publicaciones';
	blockName = 'posts-grid';
	blockHTML = '<div class="posts-grid" data-block="posts-grid"><div class="posts-grid_slider"></div></div>';
	blockChildren = [
		{
			name: '$slider',
			selector: '.posts-grid_slider'
		}
	];
	registerControls() {

		this.addControl('postType', 'general', {
			type: 'combobox',
			label: 'Tipo de Publicacion',
			store: [
				{ idx: 'no', name: 'Contenido no fluido' },
				{ idx: 'yes', name: 'Contenido fluido' }
			],
			valueKey: 'idx',
			displayKey: 'name',
			listeners: {
				select: (value) => {

					//this.applySettings({ isFluid: value }, true);
				}
			},
			default: 'no'
		});
		super.registerControls();		
	}

	edit(settings) {

		let {
			postType
		} = settings;

		this.serverBlockRender(this.$slider);

		return this.$block;
	}
	save(settings) {

		let {
			$block,
			$slider
		} = this.getBlockElements();

		$slider.innerHTML = this.$slider.innerHTML;

		return $block;
	}
}
class ImagesGallery extends Block {

	blockTitle = 'Galeria de imagenes';
	blockHTML = '<div class="images-gallery" data-block="images-gallery"><div class="images"></div></div>';
	blockName = 'images-gallery';

	blockChildren = [
		{
			name: '$images',
			selector: '.images'
		}
	];

	registerControls() {

		this.addControl('images', '', {
			type: 'repeater-2',
			label: 'Imagenes',
			fields: [
				{
					type: 'imagefield',
					label: 'Imagen',
					name: 'image',
					index: 'image',
					value: {
						url: _editor_path_rel + '/img/image-placeholder.jpg',
						width: 800,
						height: 540
					},
					listeners: {
						insert: (value, $this) => {

							let {
								url,
								width,
								height,
								alt
							} = value;
							let index = Array.from($this.$dom.closest('.field-body').firstElementChild.children).indexOf($this.$dom.closest('.repeater-item'));
							let settings = this.settings.images[index] = { image: { alt, url, width, height } };

							//this.applySettings(settings, true);
							this.edit(this.settings);

							/*let index = Array.from($this.$dom.closest('.field-body').firstElementChild.children).indexOf($this.$dom.closest('.repeater-item'));
							this.settings.elements[index]['icon'] = value;

							this.edit(this.settings);*/
						}
					}
				}
			],
			default: [
				{
					image: {
						url: _editor_path_rel + '/img/image-placeholder.jpg',
						width: 800,
						height: 540
					}
				},
				{
					image: {
						url: _editor_path_rel + '/img/image-placeholder.jpg',
						width: 800,
						height: 540
					}
				}
			],
			/*listeners: {
				append: ($this) => {
					console.log($this);
				}
			},*/
			listeners: {
				append: ($this) => {
				    console.log('called from event append');
					//console.log();
					this.applySettings({images: $this.getValue()}, true);
				},
				remove: ($this) => {
				    console.log('called from event remove');
				    this.applySettings({images: $this.getValue()}, true);
				}
			}
		});//http://localhost/wordpress_5/wp-content/uploads/2022/05/Tulips.jpg

		super.registerControls();
	}
	edit(settings) {

		let {
			images
		} = settings;


		this.$images.innerHTML = '';

		for (let i = 0; i < images.length; i++) {

			let image = images[i].image,
				src = image.url,
				width = image.width,
				height = image.height,
				slide = this.create(
					`<a href="${src}">
						<img style="display: block; width: 100%; height: 100%; object-fit: cover" src="${src}" width="${width}" height="${height}" alt="">
					 </a>`
				);
			//a.push(slide);
			this.$images.append(slide);
		}

		console.log(images);
	}

	save(settings) {

		let {
			images
		} = settings;

		let {
			$block,
			$images
		} = this.getBlockElements();

		$images.innerHTML = '';

		for (let i = 0; i < images.length; i++) {

			let image = images[i].image,
				src = image.url,
				width = image.width,
				height = image.height,
				slide = this.create(
					`<a href="${src}">
						<img style="display: block; width: 100%; height: 100%; object-fit: cover" src="${src}" width="${width}" height="${height}" alt="">
					 </a>`
				);
			//a.push(slide);
			$images.append(slide);
		}

		return $block;
	}
}
class ImagesCarousel extends Block {

	blockTitle = 'Carrusel de imagenes';
	blockHTML = 
		`<div class="images-carousel" data-block="images-carousel">
			<div class="carousel-slider"></div>
		 </div>`;
	blockName = 'images-carousel';

	blockChildren = [
		{
			name: '$slider',
			selector: '.carousel-slider'
		}
	];

	registerControls() {

		this.addControl('images', '', {
			type: 'repeater-2',
			label: 'Imagenes',
			fields: [
				{
					type: 'imagefield',
					label: 'Imagen',
					name: 'image',
					index: 'image',
					value: {
						url: _editor_path_rel + '/img/image-placeholder.jpg',
						width: 800,
						height: 540
					},
					listeners: {
						insert: (value, $this) => {

							let {
								url,
								width,
								height,
								alt
							} = value;

							let index = Array.from($this.$dom.closest('.field-body').firstElementChild.children).indexOf($this.$dom.closest('.repeater-item'));
							let settings = this.settings.images[index]['image'] = { alt, url, width, height };

							this.edit(this.settings);
						}
					}
				},
				{
					type: 'textfield',
					label: 'Enlace',
					name: 'link',
					index: 'link',
					value: '',
					listeners: {
						input: ($this) => {

							let index = Array.from($this.$dom.closest('.field-body').firstElementChild.children).indexOf($this.$dom.closest('.repeater-item'));
							let settings = this.settings.images[index]['link'] = $this.getValue();

							this.edit(this.settings);
						}
					}
				}
			],
			default: [
				{
					image: {
						url: _editor_path_rel + '/img/image-placeholder.jpg',
						width: 800,
						height: 540
					},
					link: '',
				},
				{
					image: {
						url: _editor_path_rel + '/img/image-placeholder.jpg',
						width: 800,
						height: 540
					},
					link: '',
				}
			],
			listeners: {
				append: ($this) => {
				    console.log('called from event append');
					this.applySettings({images: $this.getValue()}, true);
				},
				remove: ($this) => {
				    console.log('called from event remove');
				    this.applySettings({images: $this.getValue()}, true);
				}
			}
		});

		super.registerControls();
	}
	edit(settings) {

		let {
			images
		} = settings;


		this.$slider.innerHTML = '';

		for (let i = 0; i < images.length; i++) {

			let image = images[i].image,
				link = images[i].link,
				src = image.url,
				width = image.width,
				height = image.height,
				slide = this.create(
					`<a href="${link}">
						<img style="display: block; width: 100%; height: 100%; object-fit: cover" src="${src}" width="${width}" height="${height}" alt="">
					 </a>`
				);
			this.$slider.append(slide);
		}

		console.log(images);
	}

	save(settings) {

		let {
			images
		} = settings;

		let {
			$block,
			$slider
		} = this.getBlockElements();

		$slider.innerHTML = '';

		for (let i = 0; i < images.length; i++) {

			let image = images[i].image,
				link = images[i].link,
				src = image.url,
				width = image.width,
				height = image.height,
				slide = this.create(
					`<a href="${link}">
						<img style="display: block; width: 100%; height: 100%; object-fit: cover" src="${src}" width="${width}" height="${height}" alt="">
					 </a>`
				);
			$slider.append(slide);
		}

		return $block;
	}
}

class File extends Block {

	blockName = 'file';
	blockTitle = 'Archivo';
	blockHTML = `<div class="file" data-block="file"></div>`;

	registerControls() {

		this.addControl('file', '', {
			type: 'textfield',
			label: 'Archivo',
			default: ''
		});

		super.registerControls();
	}

	edit(settings) {

		if (!this.$block.contains(this.$attachButton)) {

			this.$attachButton = this.create('<button style="position: relative; z-index: 1000; display: block; margin: auto"><i class="fa fa-file-pdf-o"></i> Añadir archivo</button>');
			this.$attachButton.onclick = () => {

				this.openImageLibrary((file) => {
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
					var normalized_url = normalizeUrl(file.url);

					if (file.mime == 'application/pdf') {

						this.$fileLink && this.$fileLink.remove();
						this.$iframe = this.$iframe || this.create('<iframe src="'+ normalized_url +'" style="width: 100%; height: 400px"></iframe>');
						this.$block.prepend(this.$iframe);

					} else {

						if (this.$iframe) {
							this.$iframe.remove();
						} else {

							this.$fileLink = this.$fileLink || this.create('<a href="'+ normalized_url +'" download>'+ file.title +'</a>');
							this.$block.prepend(this.$fileLink);
						}
					}

					this.applySettings({file: normalized_url}, false);
				}, false);
			};
			this.$block.append(this.$attachButton);

		} else {

		}

		return this.$block;
	}

	save(settings) {

		let {
			$block
		} = this.getBlockElements();

		let {
			file
		} = settings;

		$block.append(this.create('<iframe src="'+ file +'" style="width: 100%; height: 400px"></iframe>'));

		return $block;
	}

	openImageLibrary(insertCallback, isMultiple) {

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
}
class GoogleMap extends Block {

	blockName = 'google-map';
	blockTitle = 'Mapa de Google';
	blockHTML = 
		`<div class="google-maps" data-block="google-maps">
			<iframe src="" style="width: 100%; height: 400px"></iframe>
		 </div>`;

	blockChildren = [
		{
			name: '$iframe',
			selector: 'iframe'
		}
	];
	registerControls() {

		this.addControl('link', '', {
			type: 'textfield',
			label: 'Enlace del mapa',
			default: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30619.270302719113!2d-71.53901145!3d-16.40405235!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91424a487785b9b3%3A0xa3c4a612b9942036!2sArequipa!5e0!3m2!1ses-419!2spe!4v1662157521723!5m2!1ses-419!2spe',
			listeners: {
				input: ($this) => {
					this.applySettings({ link: $this.getValue() }, true);
				}
			}
		});
		super.registerControls();
	}
	edit(settings) {

		let {
			link 
		} = settings;

		this.$iframe.src = link;

		return this.$block;
	}
	save(settings) {

		let {
			link 
		} = settings;

		let {
			$block,
			$iframe
		} = this.getBlockElements();
		
		$iframe.src = link;
		
		return $iframe;
	}
}
class ContactForm extends Block {

	blockName = 'contact-form';
	blockTitle = 'Formulario de contacto';
	blockHTML = 
		`<div class="contact-form" data-block="contact-form">
			<div class="form" style="display: flex; flex-wrap: wrap; padding: 20px">
				<div class="field" style="width: 50%">
					<label htmlFor="">Nombres</label>
					<div>
						<input type="text" style="width: 100%">
					</div>
				</div>
				<div class="field" style="width: 50%">
					<label htmlFor="">Telefono</label>
					<div>
						<input type="text" style="width: 100%">
					</div>
				</div>
				<div class="field" style="width: 100%">
					<label htmlFor="">Direccion</label>
					<div>
						<input type="text" style="width: 100%">
					</div>
				</div>
				<div class="field" style="width: 100%">
					<label htmlFor="">Consulta</label>
					<div>
						<textarea name="" id="" rows="10" style="width: 100%"></textarea>
					</div>
				</div>
				<div>
					<button type="submit" style="width: 100%">ENVIAR</button>
				</div>
			</div>
		 </div>`;
	blockChildren = [
		{
			name: '$form',
			selector: '.form'
		}
	];

	registerControls() {

		this.addControl('texto', '', {
			label: 'Texto',
			type: 'textfield'
		});

		super.registerControls();
	}
	edit(settings) {

		return this.$block;
	}
	save(settings) {

		let {
			$block
		} = this.getBlockElements();

		return $block;
	}
}
class Button extends Block {

	blockName = 'button';
	blockTitle = 'Boton';
	blockHTML = 
		`<div class="button" data-block="button">
			<a href="" target="_blank"></a>
		 </div>`;
	blockChildren = [
		{
			name: '$button',
			selector: 'a'
		}
	];
	
	registerControls() {

		this.addControl('text', '', {
			type: 'textfield',
			label: 'Texto del botón',
			default: '',
			listeners: {
				input: ($this) => {
				    this.applySettings({ text: $this.getValue() }, true);
				}
			}
		});

		this.addControl('link', '', {
			type: 'textfield',
			label: 'Enlace del botón',
			default: '',
			listeners: {
				input: ($this) => {
				    this.applySettings({ link: $this.getValue() }, true);
				}
			}
		});
	}

	edit(settings) {

		let {
			text,
			link
		} = settings;

		this.$button.textContent = text;
		this.$button.href = link;

		return this.$block;
	}

	save(settings) {

		let {
			$block,
			$button
		} = this.getBlockElements();
		let {
			text,
			link
		} = settings;

		$button.textContent = text;
		$button.href = link;

		return $block;
	}
}

class Panel extends ContainerBlock {

	blockName = 'Panel';
	blockTitle = 'Panel';
	blockHTML = 
		`<div class="panel" data-block="panel">
		    <div class="panel-header">
		        <h3 class="title"></h3>
		    </div>
		    <div class="panel-body"></div>
		 </div>`;
    
    blockChildren = [
        {
            name: '$title',
            selector: 'h3'
        },
        {
            name: '$body',
            selector: '.panel-body'
        }
    ];
    
    registerControls() {

        this.addControl('title', '', {
			type: 'textfield',
			label: 'Titulo',
			default: 'Escriba un texto como titulo',
			listeners: {
				input: ($this) => {
					this.applySettings({ title: $this.getValue()}, true);
				}
			}
		});        
    }

	edit(settings) {

		let {
            title,
			classes
		} = settings;
		
        this.$title.textContent = title;
		this.editBlocksItems(this.$body);

		return this.$block;
	}

	save(settings) {

		let {
			classes,
            title
		} = settings;

		let {
			$block,
            $title,
            $body
		} = this.getBlockElements();

        $title.textContent = title;
		this.saveBlocksItems($body);

		return $block;
	}
}

class PanelsGroup extends ContainerBlock {

	blockName = 'panels-group';
	blockTitle = 'Grupo de paneles';
	blockHTML = '<div class="panels-group" data-block="panels-group"></div>';

	registerControls() {

		this.addControl('amount', '', {
			type: 'combobox',
			label: 'Número de elementos',
			store: [
				{ idx: '1', name: '1' },
				{ idx: '2', name: '2' },
				{ idx: '3', name: '3' },
				{ idx: '4', name: '4' },
				{ idx: '5', name: '5' },
				{ idx: '6', name: '6' },
				{ idx: '7', name: '7' },
				{ idx: '8', name: '8' },
				{ idx: '9', name: '9' },
				{ idx: '10', name: '10' }
			],
			default: '3',
			valueKey: 'idx',
			displayKey: 'name',
			listeners: {
				select: (value) => {
					console.log(value);
					this.applySettings({ amount: value }, true);
				}
			}
		});

		super.registerControls();
	}

	edit(settings) {

		let {
			amount = 3
		} = settings;
        
        if (+amount >= this.items.length) {

			let elements = [];

			for (let i = 0; i < amount; i++) {

				if (this.items[i])
					continue;

				elements.push({
					type: 'Panel',
					settings: {},
					html: ''
				});
			}
			this.addBlockItems(elements);
			
		} else {

			let elements = [];
			let iterations = this.items.length - amount;

			iterations = this.items.length - iterations;

			for (let i = this.items.length - 1; iterations <= i; i--) {

				console.log(amount, i);
				this.items[i].getBlock().remove();
				this.items.splice(i, 1);
			}
		}

		this.editBlocksItems(this.$block, []);

		return this.$block;
	}

	save(settings) {

		let {
			$block
		} = this.getBlockElements();

		this.saveBlocksItems($block);

		return $block;
	}
}

class PanelDocentes extends Panel {
    
    edit(settings) {
        
        if (!this.items.length)
            this.addBlockItems({
                type: 'ImageBoxGroup',
                settings: {
                    columns: 3,
                    amount: 3,
                    imgPosition: 'left'
                }
            });

        return super.edit(settings);
    }
}

class PanelAreaUnidad extends Panel {
    
    edit(settings) {
        
        if (!this.items.length)
            this.addBlockItems({
                type: 'Columns',
                settings: {
                    columns: 2
                },
                items: [
                    {
                        type: 'Column',
                        settings: {},
                        items: [
                            {
                                type: 'ImageBox',
                                settings: {},
                            }
                        ]
                    },
                    {
                        type: 'Column',
                        settings: {},
                        items: [
                            {
                                type: 'Paragraph',
                                settings: {},
                            }
                        ]
                    }
                ]
            });

        return super.edit(settings);
    }
}

class PanelsGroupDocentes extends PanelsGroup {

    blockTitle = 'Grupo de paneles de docentes';
    blockName = 'panels-group-docentes';
    
    edit(settings) {

		let {
			amount = 3
		} = settings;
        
        if (+amount >= this.items.length) {

			let elements = [];

			for (let i = 0; i < amount; i++) {

				if (this.items[i])
					continue;

				elements.push({
					type: 'PanelDocentes',
					settings: {},
					html: ''
				});
			}
			this.addBlockItems(elements);
			
		} else {

			let elements = [];
			let iterations = this.items.length - amount;

			iterations = this.items.length - iterations;

			for (let i = this.items.length - 1; iterations <= i; i--) {

				console.log(amount, i);
				this.items[i].getBlock().remove();
				this.items.splice(i, 1);
			}
		}

		this.editBlocksItems(this.$block, []);

		return this.$block;
	}
}

class PanelsGroupAreasUnidades extends PanelsGroup {

    blockTitle = 'Paneles de areas y unidades';
    blockName = 'panels-group-areas-unidades';
    
    edit(settings) {

		let {
			amount = 3
		} = settings;
        
        if (+amount >= this.items.length) {

			let elements = [];

			for (let i = 0; i < amount; i++) {

				if (this.items[i])
					continue;

				elements.push({
					type: 'PanelAreaUnidad',
					settings: {},
					html: ''
				});
			}
			this.addBlockItems(elements);
			
		} else {

			let elements = [];
			let iterations = this.items.length - amount;

			iterations = this.items.length - iterations;

			for (let i = this.items.length - 1; iterations <= i; i--) {

				console.log(amount, i);
				this.items[i].getBlock().remove();
				this.items.splice(i, 1);
			}
		}

		this.editBlocksItems(this.$block, []);

		return this.$block;
	}
}
class Shortcode extends Block {

	blockTitle = 'Shortcode';
	blockHTML = 
		`<div class="shortcode" data-block="shortcode">
			<div class="content"></div>
		 </div>`;
	blockName = 'shortcode';
	blockChildren = [
		{ 
			name: '$content', 
			selector: '.content'
		}
	];

	registerControls() {

		this.addControl('shortcode', '', {
				type: 'textarea',
				label: 'Shortcode',
				default: '[shortcode]',
				listeners: {
					input: ($this) => {
						this.applySettings({ shortcode: $this.getValue() }, true);
					}
				}
			});
	}
	edit(settings) {

		let { shortcode = '' } = settings || {};

		if (shortcode) {
			try { this.$content.textContent = shortcode; } catch (e) { this.$content.innerHTML = shortcode; }
		}

		return this.$block;
	}
	save(settings) {

		let {
			$block,
			$content
		} = this.getBlockElements();

		let { shortcode = '' } = settings || {};

		if (shortcode) {
			let inner = shortcode.toString().trim().replace(/^\[+/, '').replace(/\]+$/, '').trim();
			inner = inner.replace(/[&<>"']/g, ' ');
			inner = inner.replace(/\s+/g, ' ').trim();
			let normalized = inner === '' ? '' : ('[' + inner + ']');
			this.settings.shortcode = normalized;
			$block.setAttribute('data-shortcode', normalized);
			try { $content.textContent = normalized; } catch (e) { $content.innerHTML = normalized; }
		} else {
			$content.innerHTML = this.$content ? this.$content.innerHTML : '';
		}

		try {
			this.saveConfig = this.saveConfig || {};
			this.saveConfig.settings = this.settings;
		} catch (e) {  }

		return $block;
	}
}