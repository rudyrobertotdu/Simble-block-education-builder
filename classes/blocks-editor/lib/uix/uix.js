$UI = {
	dialog: {
		alert: function(title, message, handler, icon) {
			var msg = $createUI({
				type: 'dialog',
				title: title,
				message: message || '',
				fn: handler,
				closable: true,
				icon: icon === undefined ? 'warning' : icon,
				buttons: {
					ok: 'Aceptar'
				}
			});
			msg.show();

			return msg;
		},
		progress: function(message, title) {},
		prompt: function() {}
	},
	fontIcons: [
    	{icon: "fa-address-book", name: "Directorio"},
		{icon: "fa-address-book-o", name: "Directorio o"},
		{icon: "fa-address-card", name: "Tarjeta identificacion"},
		{icon: "fa-address-card-o", name: "Tarjeta indentificacion o"},
		{icon: "fa-adjust", name: "Ajuste"},
		{icon: "fa-american-sign-language-interpreting", name: "Lenguaje de signos de interpretacion"},
		{icon: "fa-anchor", name: "Ancla"},
		{icon: "fa-archive", name: "Archivo"},
		{icon: "fa-area-chart", name: "Grafico"},
		{icon: "fa-arrows", name: "Flechas"},
		{icon: "fa-arrows-h", name: "Flechas horizontal"},
		{icon: "fa-arrows-v", name: "Flechas vertical"},
		{icon: "fa-asl-interpreting", name: "ASL interpretacion"},
		{icon: "fa-assistive-listening-systems", name: "assistive listening systems"},
		{icon: "fa-asterisk", name: "Asterisco"},
		{icon: "fa-at", name: "Arroba"},
		{icon: "fa-audio-description", name: "Audio descripcion"},
		{icon: "fa-automobile", name: "Automovil"},
		{icon: "fa-balance-scale", name: "Balanza"},
		{icon: "fa-ban", name: "Baneo"},
		{icon: "fa-bank", name: "Banco"},
		{icon: "fa-bar-chart", name: "Grafico de barra"},
		{icon: "fa-bar-chart-o", name: "Grafico de barra o"},
		{icon: "fa-barcode", name: "Codigo de barra"},
		{icon: "fa-bars", name: "Barras"},
		{icon: "fa-bath", name: "Baño"},
		{icon: "fa-bathtub", name: "Bañera"},
		{icon: "fa-battery", name: "Bateria"},
		{icon: "fa-battery-0", name: "Bateria 0"},
		{icon: "fa-battery-1", name: "Bateria 1"},
		{icon: "fa-battery-2", name: "Bateria 2"},
		{icon: "fa-battery-3", name: "Bateria 3"},
		{icon: "fa-battery-4", name: "Bateria 4"},
		{icon: "fa-minus", name: "Guion"},
		{icon: "fa-check", name: "Check"}
	],
	mask: function(target, message, title) {
		return $createUI({
			type: 'mask',
			title,
			message,
			renderTo: target
		});
	},
    create: function() {
    },
    isObject: function(variable) {

    	if (variable === undefined)
    		return null;

    	return variable.constructor.name === 'Object';
    },
    registeredEls: {}    
}

function openImageLibrary(insertCallback, isMultiple) {

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

function $createUI(component) {
    
    var self = {},
    	id = null,
    	name = component.type,
		type = ['panel', 'form', 'window', 'dialog', 'repeater', 'repeater-2', 'toast'].includes(name) ? 'container' : (['textfield', 'numberfield', 'textarea', 'htmleditor', 'select', 'combobox', 'iconpicker', 'iconpicker-2', 'imagefield', 'settingsfield', 'linkfield', 'multiselect', 'tokenfield'].includes(name) ? 'field' : ''),
		renderTo = component.renderTo || undefined,
		rendered = false,
		elementHTML = '',
		baseCls = '',
		elementCls = '',
		customCls = component.customCls || '', // clases CSS personalizadas
		autoShow = component.autoShow || false,
		floating = component.floating || false,
		fixed = component.fixed || false, // fixed no obliga a que el elemento renderice en el body
		modal = component.modal || false,
		$modal = undefined,
		$renderCt = undefined, //Donde se renderizara el elemento
		$element = document.createElement('div'), //DOM base del elemento
		$domEls = {},
		$$parent = component.parent || null,
		$$component = {}, //Objeto final del elemento
		eventsList = {},
		construct = function() {

			Object.assign($$component, {
				id,
				type: name,
				$dom: $element,
				show,
				hide,
				up,
				destroy,
				getParent
				// onAdded
			});
			setupHTML();
			//AQUI DEBERIA HABER UNA FUNCION LLAMADA INITCOMPONENT
			initComponent();
			afterInit();
			initEvents();

			if (renderTo) {
				render(renderTo);
			}

			if (!renderTo && autoShow) {
				show();
			}
		},
		initComponent = function() {

			id = name + '-' + (($UI.registeredEls[name] && ++$UI.registeredEls[name]) || ($UI.registeredEls[name] = 1));
			$$component.id = id; //Provisional
			$renderCt = renderTo; //Guardar referencia de donde se renderizara

			if (floating) { //Todos los componentes pueden ser flotantes

				let floatCls = fixed ? 'is-fixed-floating' : 'is-floating'; // Flotar con referencia al viewport o a su contenedor

				$element.classList.add(floatCls);
				renderTo = undefined; //Si el componente es flotante no se mostrara por defecto a menos que se use la funcion show() o config autoShow: true
			}
			if (component.listeners) {
				//console.log(component.listeners);
				on(component.listeners);
			}
		},
		afterInit = function() {},
		setupHTML = function() { //prepareComponent
			//console.log(baseClass);
			$element.id = component.id || '';
			$element.className = (baseCls + ' ' + elementCls + ' ' + customCls).trim();
			$element.innerHTML = elementHTML;
        },
        initEvents = function() {},
        render = function($renderTo) {

        	//console.log('render parent', $renderTo, $element);
			
			if (typeof $renderTo === 'string')
				$renderTo = document.querySelector($renderTo);
			//beforerender
			beforeRender();
			$renderTo.appendChild($element);
			rendered = true;
			afterRender();
			//afterrender
        },
        beforeRender = function() {},
        afterRender = function() {

        	fire('afterrender', $$component);
        },
        show = function() {
        	//En componentes como window metodo show funciona de tal forma que sea llamado en algun listener como click de un boton, em lugar de mostrarlo de frente con autoShow
        	console.log('show');
            if (rendered) {
            	// Si solo esta oculto hay que mostrarlo
            	// Provisional
            	$modal && ($modal.style.display = '');
            	$element.style.display = '';
            } else {
                //En extjs floating es sinonimo de position absoluta (renderizado en el body) centrada en su contenedor
                //Floating textfields se centraran en medio del panel que lo contiene es necesario config autoShow: true
                if (floating) { // Solo  si es flotante puede tener modo modal
                    console.log('floating');
                    var $container = $renderCt || document.body; //Si no tiene elemento padre o si no se especifico donde renderizara se renderiza en el Body

                    if (modal) { // Se entiende por modal a un modo de pantalla que deshabilita toda el UI detras de cierto componente
                    	
                    	$modal = document.createElement('div');
                    	$modal.className = 'ui-mask';
                    	//$modal.className = 'ui-modal';

                    	if (typeof $container === 'string')
							$container = document.querySelector($container);

						//$container == document.body && ($modal.style.position = 'fixed');
						if (fixed)
							document.body.appendChild($modal);
						else
                    		$container.appendChild($modal);
                    }

                    //$container == document.body && ($element.style.position = 'fixed');
                    render($container);
                    //$modal.appendChild($element);
                    //revisar metodo show, autoRender de component.js extjs
                    //render -> afterrender -> center
                    //o llamar a render();
                }
            }
        }, 
        hide = function() {
        	if (modal) {
        		$modal.style.display = 'none';
        	}
        	$element.style.display = 'none';
        },
        destroy = function() {
        	// borrar la referencia a las propiedades de este componente en el "arbol principal"
        	// var $cmp = {$dom: ..., prop1, prop2, meth1}
        	// $cmpTree = {'$cmp': $cmp}
        	// for (prop in $cmpTree.$cmp)
        		// delete
        	// Provisional
        	// OR USE $$PARENT
        	//console.log($$parent.items);
        	var idx;
        	if ($$parent) { //Provisional
        		idx = $$parent.items.findIndex(x => x.id == id);
        		$$parent.items.splice(idx, 1);
        	}
        	$element.remove();
        	modal && $modal.remove();
        },
        fire = function(eventName) {

        	var fnArgs    = [].slice.call(arguments, 1), //Obtiene todos los argumentos excepto el primero
        		listeners = eventsList[eventName];

        	if (listeners && listeners.length) {
        		for (let listener of listeners) {
        			listener.apply(null, fnArgs); //Pasa los argumentos como array
        		}
        	}
        },
        addListener = on = function(names, listener, options = {}) {

        	if (typeof names == 'string'/* && options.element*/) {

        		if (options.element) {

        		} else {
        			let handlers = eventsList[names] || (eventsList[names] = []);
        			handlers.push(listener);
        		}
        	} else {
        		
        		for (let evtName in names) {
        			
        			let params = names[evtName];
        			console.log(evtName, names);
        			//debugger;
        			addListener(evtName, params.fn || params, params);
        		}
        	}
        },
        onAdded = function($container) {
        	$$parent = $container;
        },
        getParent = function() {
        	return $$parent;
        },
        up = function(type) {

        	let $parent;

        	do {
        		$parent = $parent ? $parent.getParent() : getParent();
        		
        	} while (type && $parent && $parent.type != type)

        	return $parent;
        };

    switch (type) {
        
        case 'container':

        	var addChild  = function() {},
        		beforeAdd = function() {};

        	//algunaFuncion() { //Solo para contenedores
        		//render()
        		//initItems
        	//}
        	var render      = (function() { //Metodo render en container deberia cambiarse ya que solo agrega items cuando renderiza

					var parent = render;
					return function($renderTo) {

						$$component.items = [];
						parent($renderTo);
						addItems($items);
						//initItems();
						afterLayout();
					}
				})(),
				afterLayout = function() {
				},
				addItems    = function(items) {

					var tmpItems = [];

					if (!Array.isArray(items))
						items = [items];

					if (/*items.length && */rendered) {
						//console.log(items);
						
						for (let item of items) {

							let $item;

							beforeAdd(item);
							item['parent'] = $$component;
							item['renderTo'] = $childsCt;
							$item = $createUI(item);
							//revisar comportamineto de cuando se añade un hijo ya creado a un container
							//$item.onAdded($$component); // Falla cuando se intenta llamar al padre luego que un componente hijo se renderizo revisar extjs
							tmpItems.push($item);
							//$items.push($createUI(item));
							//$$component.items.push($createUI(item));
						}
						$$component.items.push(...tmpItems);
					}
				},
				initItems   = function() {

					var items = component.items;
					$$component.items = [];
					
					if (items && rendered) {

						if (!Array.isArray(items))
						    items = [items];

						for (let item of items) {

							beforeAdd(item);
							item.renderTo = $childsCt;
							$$component.items.push($createUI(item));
						}
					}
				},
				//_items      = component.items || [],
				$items = component.items || [],
				isContainer = true,
				$childsCt = undefined,
				baseCls = 'ui-container'; //donde renderizara los items

            switch (name) {
                
                case 'panel':
                case 'form':
                case 'window':
                case 'dialog':

                    if (name == 'panel' || name == 'window' || name == 'dialog' || name == 'form') {

                    	var elementCls = 'ui-panel',
							elementHTML = [ // Implementar algo como data-slot y luego process template en extjs hay metodos dentro de la plantilla para que cierto component aparezca en determinado lugar del component // ver como se puede manejar esto en los dialogbox
								'<div class="body">',
									'<div class="inner-body"></div>',
								'</div>'
							].join(''),
							$header       = undefined,
							expandingOrCollapsing = false,
							height        = 0,
							tools         = [],
							$panelTools   = {},
							$body         = undefined,
							$bbar = null,
							$tbar = null,
							$innerBody    = undefined,
							html          = component.html || '',
							title         = component.title || '',
							closable      = component.closable || false,
							collapsed     = component.collapsed || false,
							collapsible   = component.collapsible || false,
							maximizable   = component.maximizable || false,
							minimizable   = component.minimizable || false,
							setToolbars  = function() {

								var $body = $element.querySelector('.inner-body'),
									bbar  = component.bbar, $bbar;

								if (bbar) {

									if (!Array.isArray(bbar))
										bbar = [bbar];

									$bbar = document.createElement('div');
									$bbar.className = 'bottom-bar';

									bbar.forEach(function(item) {
										
										item.renderTo = $bbar;
										item.parent = $$component;
										$createUI(item);
									});
									$body.insertAdjacentElement('afterend', $bbar);
								}
							},
							beforeAdd    = function(item) {
								item.customCls = 'panel-item';
							},
							afterLayout  = function() {
								//console.log('afterLayout');
								/**/
								var iHeight = $innerBody.offsetHeight;

								if (collapsed) {
									$innerBody.style.height = iHeight + 'px';
									$innerBody.style.flexShrink = '0';

									if (height) {
										$element.style.height = '';
									}
									$body.style.cssText = 'height: 0px; overflow: hidden';
								}
								/*AfterLayout se ejecuta despues de que todos los items del contenedor se hayan renderizado
								en caso de que se observe el panel expandido y luego colapsado se tendra que modificar la altura a 0 en afterRender
								y en afterLayout se tendra que implementar la siguiente funcion para poder hayar la altura posible del .inner-body
								Para navegadores que soportan CSS Typed OM
								if (Element.prototype.computedStyleMap) {
									$parent.computedStyleMap().get('height'); //Obtiene auto en caso de que el padre tenga altura fluida o "n"px en caso contrario
									$parent.clientHeight //Obtener altura real del padre
								} else {
									var $clone = $parent.cloneNode(false);
									$clone.style.display = 'none';
									document.body.appendChild($clone);
									var height = getComputedStyle($clone).height;
									$close.remove();
								}
								*/
							},
							afterRender = function() { //AfterRender se ejecuta despues que el panel se inserto en el DOM pero aun sus items no se renderizaron
								//console.log('afterRender');

								var $parent, padding, eHeight, iHeight;

								if (collapsed) {
									eHeight = $element.clientHeight;
									iHeight = $innerBody.offsetHeight; //clientHeight no incluye bordes
									console.log(eHeight, iHeight);
									
									/*$innerBody.style.height = iHeight + 'px';
									$innerBody.style.flexShrink = '0';*/
								}
								if (collapsed) {
									//$innerBody.style.flexShrink = '0';
									if (floating) {
										$parent = $element.parentElement.parentElement; //Parent is HTML tag
										padding = 20;
									} else {
										$parent = $element.parentElement;
										padding = 0;
									}
								}
							},
							// Header en realidad deberia ser un componente
							// Este metodo no deberia hacer la insercion del componente "Header" solo deberia devolverlo
							createHeader = function(force = false) { // setHeader

								var $tools;

								if (title || (tools && tools.length) || force) {

									$header = document.createElement('div');

									$header.className = 'header';
									$header.innerHTML = [
										'<div class="title">'+ title +'</div>',
										'<div class="tools"></div>'
									].join('');

									$tools = $header.querySelector('.tools');
									tools.forEach(function(tool, i) {

										var $tool = document.createElement('button');

										$tool.type      = 'button';
		                                $tool.innerHTML = '<i class="fa '+ tool.icon +'"></i>';
		                                
		                                $tool.addEventListener('click', tool.handler);
		                                
		                                $tools.appendChild($tool);

		                                if (tool.reference) {
		                                	$panelTools[tool.reference] = $tool;
		                                }
									});
									$element.prepend($header);
								}
							},
							initTools = function() {

								addTools();

								if (collapsible) {
									tools.push({
										icon: 'fa-chevron-down',
										reference: '$collapseTool',
										handler: toggleCollapse
									});
								}
								if (closable) {
									tools.push({
										icon: 'fa-close',
										handler: close
									});
								}
							},
							addTools = function() {}, //Metodo para subclases
							close = function (argument) {
								/* if ($modal) {
									$modal.remove();
								}
								$element.remove();*/
								destroy();
								fire('close', $$component);
							},
							toggleCollapse = function() {
								collapsed ? expandPanel() : collapsePanel();
							},
							setTitle = function(title) {

								if ($header && typeof title == 'string')
									$header.querySelector('.title').textContent = title;
							},
							afterExpand   = function() {

								console.log('after expand');
								updateCollapser();

								if (height) {
									$element.style.height = height + 'px'; //Volver el panel a su altura original si la tuviese
								}

								$body.style.height          = null;
								$body.style.overflow        = null;
								$innerBody.style.height     = null;
								$innerBody.style.flexShrink = null;

								expandingOrCollapsing = false;
							},
							afterCollapse = function() {

								console.log('after collapse');
								updateCollapser();
								expandingOrCollapsing = false;
							},
							expandPanel   = function() {
								if (expandingOrCollapsing)
									return;

								var bodyHeight;
								if (height) {
									//bodyHeight = 
								}
								expandingOrCollapsing = true;
								$body.style.height    = $body.scrollHeight + 'px';
								collapsed = false;
							},
							collapsePanel  = function() {
								if (expandingOrCollapsing)
									return;

								expandingOrCollapsing = true;

								if (height) {
									$body.style.height          = $body.clientHeight + 'px'; //1. Colocarle su altura misma para animar el height
									$element.style.height       = ''; //2. Remover la alura del .panel si la tuviese
								} else {
									//$body.style.height = $body.scrollHeight + 'px';
									$body.style.height = $body.clientHeight + 'px';
								}

								$body.style.overflow        = 'hidden';
								$innerBody.style.height     = $innerBody.offsetHeight + 'px'; //Altura  minima //offsetHeight incluye bordes
								$innerBody.style.flexShrink = '0'; //Previene que el elmento se encoja debido a que es un flex item y debido a que posee overflow-y auto
								//Tambien puede añadirse un min-height 
								//$innerBody.style.minHeight = $innerBody.clientHeight + 'px';
								
								setTimeout(function() {
									$body.style.height = 0; //Animar a altura 0px
								}, 5);
								collapsed = true;
							},
							updateCollapser = function() {

								var $tool = $panelTools.$collapseTool, $icon;

								if ($tool) {
									$icon = $tool.querySelector('i');
									if (!collapsed) {
										$icon.classList.remove('fa-chevron-down');
										$icon.classList.add('fa-chevron-up');
									} else {
										$icon.classList.remove('fa-chevron-up');
										$icon.classList.add('fa-chevron-down');
									}
								}
							};
							initComponent = (function() {

								var parent = initComponent;

								return function() {

									$body      = $element.querySelector('.body');
									$innerBody = $element.querySelector('.inner-body');
									$childsCt  = $innerBody;

									if (component.width)
										$element.style.width = component.width + 'px';

									if (component.height) {
										height = component.height;
										$element.style.height = component.height + 'px';
									}

									parent();
									initTools();
									createHeader();
									updateCollapser();
									setToolbars();

									if (collapsible) {

										let duration = component.collapseDuration || 300;

										$element.style.setProperty('--collapse-duration', duration + 'ms');
										$element.classList.add('is-collapsible');

										$body.addEventListener('transitionend', function() {

											if (!collapsed)
												afterExpand();
											else
												afterCollapse();
										}, false);
									}

									/*if (collapsed) {
										if (height) {
											$element.style.height = '';
										}
										$body.style.cssText = 'height: 0px; overflow: hidden';
									}*/
									//Provisional
									if (html) {
										$element.querySelector('.inner-body').innerHTML = html;
									}
								}
							})();

                            if (name === 'form') {

                            	const getFields = function(items) { //funcion recursiva que obtiene todos los campos dentro de un formulario
                            		//$$ final object prefix
                            		var $items = items || $$component.items,
                            			fields = [];

                            		for (let $item of $items) {

                            			if (($item.isFormField && $item.isContainer) || $item.isFormField) {
                            				fields.push($item);
                            			} else if ($item.isContainer && $item.items) {
                            				fields = fields.concat(getFields($item.items));
                            			}
                            		}
                            		return fields;
								}
								//Getvalues es diferente a submit form
                                var getValues = function() {

                                	var $fields = getFields(), // Get fields y/o fields-containers
                                		values = {},
                                		count = 0;

                                	for (let $field of $fields) {

                                		let name = $field.name || 'field-'+ (count++);
                                		values[name] = $field.getValue();
                                	}
                                	return values;
                                };
                                var getValues = function() {

                                	var fields = getFields(),
                                		values = {},
                                		auxCount = 0;

                                	for (let field of fields) {

                                		let names = field.name.match(/[a-zA-Z0-9_]+|(?=\[\])/g);

                                		if (names) {

                                			let length = names.length;
                                			//names.reduceRight((a, c) => ({[c]: a}), $field.getValue());
                                			names.reduce((prev, cur, index) => {

                                				return prev[cur] = prev[cur] ?? (++index === length ? field.getValue() : {});
                                				//return prev[cur] = ++index === length ? $field.getValue() : {};
                                			}, values);

	                                	} else {
	                                		values['field-'+ (auxCount++)] = field.getValue();
	                                	}
                                	}
                                	return values;
                                };
                                Object.assign($$component, { getValues: getValues });
                            }
                        Object.assign($$component, { setTitle: setTitle, close });
					}
                    if (name == 'window' || name == 'dialog' || name == 'toast') {

                    	elementCls = 'ui-window';
                    	draggable = component.draggable || true;
                    	closable = component.closable || true;
                    	modal = true;
                    	fixed = true; // window y dialogs siempre son fixed
                    	renderTo = document.body; // window y dialogs siempre renderizan en el body
                    	floating = true; // siempre es flotante
                    	initComponent = (function() {

                    		var parent = initComponent;
                    		return function() {
                    			parent();
                    			if (!$header) {
                    				createHeader(true); // sWindows always has a header - Force to create $header
                    			}
                    		}
                    	})();
                    	addTools = function() { // Add window custom tools to header

                    		if (maximizable) {

                    			tools.push({
									icon: 'fa-maximize',
									handler: maximize
								});

								tools.push({
									icon: 'fa-restore',
									handler: restore,
									hidden: true
								});
							}
						};
						var maximize      = function() {},
							restore       = function() {},
							initDraggable = function() {};
                    }
                    /* if (name == 'toast') { //Posiblemente luego se pueda utilizar como descendiente de window para que tenga header, cuando se implemente un mecanismo de plantilla

                    	elementCls = 'ui-toast';
                    	elementHTML = [
                    		'<div class="icon"></div>',
                    		'<div class="content">',
                    			'<div class="body">',
									'<div class="inner-body"></div>',
								'</div>',
                    		'</div>'
                    	];
                    	initComponent = (function() {
                    		
                    		var parent = initComponent;
                    		return function() {

                    		}
                    	})();
                    } */
                    if (name == 'dialog') {

                    	let msgButtons = [],
                    		dlgIcon    = component.icon || false,
                    		$progress, $message, $input;
                    	//Deberian estar en el construct o initcomponent
                    	elementCls = elementCls +' ui-dialog';
						closable = component.closable || false;

                    	initComponent  = (function() {

                    		var parent = initComponent;
                    		return function() {

                                var buttons     = component.buttons || {},
                    				$dlgBody    = $element.querySelector('.inner-body'),
                                    $lContainer, $rContainer, $progress;

                                // En ExtJS se crean containers como cualquier otro componente y dentro de este se colocan las partes que componen el dialog pero se deberia implementar una forma mas "rapida" para que solo cree una estructura HTML y dentro de esta colocar las partes del dialog
                                // tpl = '<div>[componente 0]</div><div>[componente 1] [componente 2]</div>'
								if (dlgIcon || component.progress) {

									$lContainer = document.createElement('div');
									$lContainer.className  = 'elements-block';
									$dlgBody.style.cssText = 'display: flex; gap: 14px';

									if (dlgIcon) {
										$dlgBody.insertAdjacentHTML('afterbegin', '<div class="icon" style="align-self: center"><i class="fa fa-'+ dlgIcon +' fa-2x"></i></div>');
									} else {
										$progress = createUI({type: 'progress', round: true});
										$lContainer.appendChild($progress.$dom);
									}
									$dlgBody.appendChild($lContainer);
									$dlgBody = $lContainer;
								}

								if (component.message) {

									$message = document.createElement('p');
									$message.className   = 'message';
									$message.textContent = component.message;
									$dlgBody.insertAdjacentElement('beforeend', $message);
									//$dlgBody.insertAdjacentHTML('beforeend', '<p class="">'+ component.message +'</p>');
								}

								if (component.prompt || component.multiline) {

									if (component.prompt) {
										$dlgBody.insertAdjacentHTML('beforeend', '<div><input class="dialog-input" type="text" value=""></div>');
									} else {
										$dlgBody.insertAdjacentHTML('beforeend', '<div><textarea class="dialog-input" style="width: 100%"></textarea></div>');
									}
									//Se puede cambiar
									$input = $dlgBody.querySelector('.dialog-input');
								}

								for (let button in buttons) {

									msgButtons.push({
										id: button,
										type: 'button',
										text: buttons[button],
										handler: callback
									});
								}
								component.bbar = msgButtons;

								parent();
                    		}
                    	})();
                    	let callback   = function(btn) {

								var value;
								if (component.prompt || component.multiline) {
									value = $input.value;
								}

								if (component.fn)
								    component.fn(btn.id, value);

								if ($modal)
									$modal.remove();
								$element.remove();
	                    	},
							wait        = function() {
							    $progress.wait();
							},
							setProgress = function(percent) {
							    $progress.setProgress(percent);
							},
							setMessage = function(message) {
							    $message.textContent = message;
							}
                    }

                    /*var baseClass = 'ui-window',
                        bodyHTML  = [
                        	'<div class="header">',
                        		'<div class="title">'+ (component.title || '') +'</div>',
                        		'<div class="tools"></div>',
                        	'</div>', //DEBERIA MANEJAR AQUI EL TOP BAR?
                        	//'<div class="body">'+ (component.html || '') +'</div>',
                        	'<div class="body">',
                        	    '<div class="inner-body">'+ (component.html || '') +'</div>',
                        	    '<div class="toolbar bottom-bar" style="display: none"></div>',
                        	'</div>'
                        	//(component.bbar ? '<div class="bbar-box"></div>':'')
                        ].join(''),
                        tools       = [],
                        closable    = component.closable || true,
                        maximizable = component.maximizable || false,
                        minimizable = component.minimizable || false,
                        initComponent = (function() {
                            
                            var parent = initComponent;
                            
                            return function() {
                                
                                parent();
                                initTools();
                                initToolbars();
                                
                                component.floating = true;
                            }
                        })(),
                        initHeader   = function () {
                        },
                        addTools      = function() {
                            
                            if (closable) {
                                tools.push({
                                   icon: 'fa-close' ,
                                   handler: close
                                });
                            }
                            
                            if (maximizable) {
                                
                                tools.push({
                                    icon: 'fa-maximize',
                                    handler: maximize
                                });
                                
                                tools.push({
                                    icon: 'fa-restore',
                                    handler: restore,
                                    hidden: true
                                });
                            }
                            
                            if (minimizable) {
                                
                                tools.push({
                                    icon: 'fa-minizable',
                                    handler: minimize
                                })
                            }
                        },
                        initTools     = function() {
                            
                            var $toolsBox = $element.querySelector('.tools');
                            
                            addTools();
                            
                            tools.forEach(function(tool, i) {
                                
                                var $button = document.createElement('button');
                                
                                $button.type      = 'button';
                                $button.innerHTML = '<i class="fa '+ tool.icon +'"></i>';
                                
                                $button.addEventListener('click', tool.handler);
                                
                                $toolsBox.appendChild($button);
                            });
                        },
                        initToolbars  = function() {
                            
                            var $body = $element.querySelector('.body'),
                                bbar  = component.bbar, $bbar;
                            
                            if (bbar) {
                                
                                if (!Array.isArray(bbar))
                                    bbar = [bbar];
                                
                                $bbar = $element.querySelector('.bottom-bar');
                                $bbar.style.display = '';
                                
                                bbar.forEach(function(item) {
                                    
                                    item.renderTo = $bbar;
                                    $createUI(item);
                                })
                            }
                            
                            if (component.tbar) {
                                
                            }
                        },
                        minimize      = function() {},
                        maximize      = function() {},
                        restore       = function() {},
                        close         = function() {
                            
                            $element.remove();
                        };*/
                        
                    /*$$component = {
                        show: show
                    }*/

                    /*if (name == 'dialog') {
                        
                        let callback    = function(btn) {
                            
                                var value;
                                
                                $modal.remove();
                                
                                if (component.fn)
                                    component.fn(btn.id, value);
                            },
                            wait        = function() {
                                $progress.wait();
                            },
                            setProgress = function(percent) {
                                $progress.setProgress(percent);
                            },
                            setMessage = function(message) {
                                $message.textContent = message;
                            },
                            msgButtons  = [], $progress, $message;
                        
                        baseClass = baseClass + ' ui-dialog';
                        closable  = component.closable || false;
                        
                        initComponent = (function() {
                            
                            var parent = initComponent;
                            
                            return function() {
                                
                                var buttons     = component.buttons, 
                                    $dialogBody = document.createElement('div'), $body;
                                
                                if (component.buttons) {
                                    
                                    console.log(component.buttons);
                                    
                                    for (let button in buttons) {
                                        
                                        msgButtons.push({
                                            id: button,
                                            type: 'button',
                                            text: buttons[button],
                                            handler: callback
                                        });
                                    }
                                    
                                    component.bbar = msgButtons;
                                }
                                
                                parent();
                                
                                $body = $element.querySelector('.inner-body');
                                
                                $dialogBody.className = 'dialog-body';
                                
                                //if (component.progress || component.wait) {
                                if (component.progress === true) {
                                    
                                    //let $progress;
                                    
                                    $dialogBody.innerHTML = [
                                        '<div class="dialog-progress"></div>',
                                        '<div class="dialog-content">',
                                            '<p class="message" style="margin: 0; text-align: center">'+ (component.message || '') +'</p>',
                                        '</div>'
                                    ].join('');
                                    
                                    let $dialogProgress = $dialogBody.querySelector('.dialog-progress');
                                    
                                    $progress = $createUI({
                                        type: 'progress',
                                        renderTo: $dialogProgress
                                    });
                                } else {
                                    
                                    $dialogBody.innerHTML = [
                                        (component.icon ? '<div class="dialog-icon"><i class="fa fa-'+ component.icon +'"></i></div>' : ''),
                                        '<div class="dialog-content">',
                                            '<p class="message" style="margin: 0;">'+ component.message +'</p>',
                                        '</div>'
                                    ].join('');
                                }
                                $message = $dialogBody.querySelector('.message');
                                
                                $body.appendChild($dialogBody);
                            }
                        })();
                        
                        $$component = {
                            show: show,
                            wait: wait,
                            setMessage: setMessage,
                            setProgress: setProgress
                        };
                    }*/
                break;
                case 'repeater-2': //hereda de fieldcontainer que implementa labelable 
                	//Implementa field field esto lo convierte en un campo de formulario

                	var $label,
                		$fieldLabel,
                		$fieldBody,
                		$container,
                		$bottomBar,
                		$buttonAdd,
                		counter = 0,
                		fieldName = component.name || '',
                		dataStore = component.store || [],
                		subFields = component.fields || [],
                		elementCls = 'ui-field ui-repeater',
                		addElement = function() {

                			var newItem = {};

                			//newItem = fire('beforeAdd', $$component, newItem);
                			console.log(newItem);
                			addRecord(newItem);
                		},
                		addRecord = function(records) {
                			
                			if (!records || records.constructor.name != 'Object')
                				return;

                			if (!Array.isArray(records))
                				records = [records];

                			addItems(prepareItems(records));
                			fire('append', $$component); //REVISAR <--------
                		},
                		removeRecord = function($item) {
                		    
                		    //let index = [...$item.$dom.parentElement.children].indexOf($item.$dom);
                		    
                		    console.log($$component);
                		    //debugger;
                		    fire('remove', $$component);
                		},
                		prepareItems = function(records) {

                			var items = [];

                			for (let record of records) {

                				let fields = subFields.map(function(field) {

                					var value = field.index && (record[field.index] || field.value || ''),
                						name = fieldName && field.name ? fieldName + '['+ counter +']['+ field.name + ']' : (field.name || '');

                					value = field.filterValue instanceof Function ? field.filterValue(value) : value;

                					return Object.assign({}, field, {value: value, name: name});
                				});
                				
                				items.push({
                					type: 'panel',
                					title: 'Elemento #' + (counter + 1),
                					customCls: 'repeater-item',
                					closable: true,
                					collapsible: true,
                					collapsed: true,
                					items: fields,
                					listeners: {
                						close: function($cmp) {
                						    
                						    removeRecord($cmp);
                							console.log($cmp);
                						}
                					}
                					/*listeners: {
                						close: function($cmp) {
                							console.log($$component.items);
                						}
                					}*/
                				});
                				counter++;
                			}
                			return items;
                		},
                		getValue = function() { //Implementacion pobre

                			var $items = $$component.items,
                				values = [];

                			for (let $item of $items) {

                				let data = {};

                				for (let $field of $item.items) { //Implementacion improvisada

                					let name = $field.name.match(/[a-zA-Z0-9_]+|(?=\[\])/g);

                					name = name[name.length - 1];
                					data[name] = $field.getValue();
                				}
                				values.push(data);
                			}
                			return values;
                		};
                		initComponent = (function() {

                			var parent = initComponent;
                			return function() {

                				parent();
                				if (component.label) {

                					$fieldLabel = document.createElement('div');
                					$fieldLabel.className = 'field-label';

                					$label = document.createElement('label');
                					$label.className = 'label-text';
                					$label.textContent = component.label + ':';

                					$fieldLabel.appendChild($label);
                					$element.insertAdjacentElement('afterbegin', $fieldLabel);
                				}

                				$fieldBody = document.createElement('div');
                    			$fieldBody.className = 'field-body';

                    			$container = document.createElement('div');
                    			$container.className = 'ui-container';

                    			$bottomBar = document.createElement('div');
                    			$bottomBar.className = 'container-bbar';

                    			$element.appendChild($fieldBody);
                    			$fieldBody.appendChild($container);
                    			$fieldBody.appendChild($bottomBar);
                    			
                    			$buttonAdd = $createUI({
                    				type: 'button',
                    				text: 'Elemento',
                    				icon: 'plus',
                    				handler: addElement,
                    				renderTo: $bottomBar
                    			});

                    			$items = prepareItems(dataStore);
                    			$childsCt = $container;
                			}
                		})();

                	$$component.isFormField = true;
                	$$component.isContainer = true;
                	$$component.name = fieldName;
					$$component.getValue = getValue;
					
                break;

                case 'repeater':
                	/*	Revisar container ejemplo en webe extjs
                		container element
                		ui-container
                			outer-container
                				inner-container
                	*/
                	/*
                		bodyEl -> field-body -> viene de labelable (en panel es .body)
                			containerEl o outerContainer -> container
                				innerContainer -> inner-container -> donde se renderiza -> posee padding
                	*/
                	var $fieldBody,
                		$label,
                		$container,
                		$itemsCt,
                		$innerCt,
                		$footer,
                		_$btnAdd,
                		recCounter   = 0,
                		subFields    = component.fields,
                		dataStore    = component.store || [],
                		prepareItems = function(records) {
                			var items = [];
            				for (let record of records) {

            					//Regresa [] aunque los subfields esten vacios
            					let fields = subFields.map(function(fobj) {

            						var value = fobj.index && (record[fobj.index] || '');
            						return Object.assign({}, fobj, {value: value});
            					});

            					items.push({
            						type: 'panel',
            						title: 'Elemento #'+ recCounter++,
            						collapsible: true,
            						collapsed: true,
            						items: fields
            					});
							}
                			return items;
                		},
                		addRecord    = function(records = {}) {

                			var items;
                			if (records.construct.name != 'Object')
                				return;

                			if (!Array.isArray(records))
                				records = [records];

                			items = prepareItems(records);
							addItems(items);
                			/*itemsCounter++;
                			$createUI({
                				type: 'panel',
                				title: 'Item #'+ itemsCounter,
                				closable: true,
                				collapsible: true,
                				collapsed: true,
                				items: subFields,
                				renderTo: $innerCt
                			});*/
						},
						getValue     = function() {
						},
						setValue     = function(values) {
						},
						beforeAdd    = function(item) {
							//itemsCounter++;
							//item.
						};

                	elementCls = 'ui-repeater ui-field-container';
                	initComponent = (function() {

						var parent = initComponent;
						return function() {
							parent();
							if (component.label) {

								let $labelWrapper = document.createElement('div');
								$labelWrapper.className = 'field-label';

								$label = document.createElement('label');
								$label.textContent = component.label + ':';

								$labelWrapper.appendChild($label);
								$element.insertAdjacentElement('afterbegin', $labelWrapper);
							}
							//js library
							//Viene del field
							$fieldBody = document.createElement('div');
							$fieldBody.className = 'field-body';

							$itemsCt = document.createElement('div'); //vendria del container base
							$itemsCt.className = 'items-container';

							$innerCt = document.createElement('div'); //vendria del container base
							$innerCt.className = 'inner-container';

							$element.appendChild($fieldBody);
							$fieldBody.appendChild($itemsCt);
							$itemsCt.appendChild($innerCt);

							$footer = document.createElement('div');
							$footer.className = 'footer';

							$fieldBody.appendChild($footer);

							_$btnAdd = $createUI({
								type: 'button',
								text: 'Agregar item',
								handler: addRecord,
								renderTo: $footer
							});
							$childsCt = $innerCt;
							component.items = prepareItems(dataStore);
						}
					})();
                break;

                case 'fieldset':
                break;

                case 'fieldContainer':
                break;
                case 'toolbar':
                break;
                case 'toast':

                	elementHTML = // En caso las partes html que componen el componente no sean en si componentes se podria definir en la plantila principal luego este se puede remover en caso no sea utilizado
					   `<div class="icon" data-ref="icon"></div>
                		<div class="body" data-ref="body">
                			<div class="title" data-ref="title"></div>
                			<div class="message" data-ref="message"></div>
                		</div>
                		<div class="tools" data-ref="tools"></div>`;

                	var $icon, $title, $message, $body,
                		elementCls = 'ui-toast',
                		fixed = true,
                		floating = true,
                		title = component.title || '',
                		message = component.message || '',
                		icon = component.icon || '',
                		subEls = ['icon', 'title', 'message', 'body'],
                		getTitle = function() {
                			return $title;
                		},
                		setTitle = function(title) {

                			!$element.contains($title) && $body.prepend($title);
                			$title.innerHTML = `<h5>${title}</h5>`;
                		},
                		setMessage = function(message) {

                			!$element.contains($message) && $body.append($message);
                			$message.innerHTML = `<p>${message}</p>`;
                		},
                		setIcon = function(icon) {

                			if (icon == 'loading') {

                			} else if (icon == 'success') {

                			} else if (icon == 'warning') {

                			}
                		};

                	initComponent = (function() {

                		var parent = initComponent;

                		return () => {

                			parent();

                			$icon = $element.querySelector('.icon');
                			$body = $element.querySelector('.body');
                			$title = $element.querySelector('.title');
                			$message = $element.querySelector('.message');
                			
                			title ? setTitle(title) : $title.remove();
                			message ? setMessage(message) : $message.remove();
                			icon ? setIcon(icon) : $icon.remove();                			
                		}
                	})();
                	afterRender = (function() {

                		var parent = afterRender;
                		return () => {
                			parent();

                			setTimeout(function() {
                				$element.remove();
                			}, 5000)
                		}
                	})();
                	Object.assign($$component, { setTitle, setMessage });
                break;
            }
            $$component.addItems = addItems;
        break;
        
        case 'field':
        	baseCls = 'ui-field';

        	var $label,
        		$input,
        		$inputWrap,
        		$inputContainer,
        		$fieldLabel,
        		$fieldBody,
        		$fieldInput,
				afterInput = [],
				beforeInput = [],
				inputValue = '',
				focusClass = '',
				readOnly = component.readOnly || false,
				fieldName = component.name || '',
				fieldValue = component.value || '',
                createInput = function() { //Input basico, este metodo debera ser reescrito en caso se requira, en caso no regresar un input el metodo getValue, setValue debera ser reescrito tambien

                	var $field  = document.createElement('input');
                    $field.type = 'text';

                    return $field;
                },
                initField = function() {

                	var $input = createInput();
                	$inputWrap.appendChild($input);

                	if ($input = getInput($input)) {

                		$input.name = fieldName;
                		$input.disabled = component.disabled || false;
                    	$input.readOnly = readOnly;
                    	$input.autocomplete = 'off';
                	}
                },
                getInput = function(input) {
                	return $input || ($input = input);
                },
                initValue      = function() {},
                getValue       = function() { // Obtiene el valor real y principal
                	return getInputValue();
                },
                getInputValue  = function() {
                	return $input.value;
                },
                getFocusEl = function() {
                	return $input;
                },
                setValue = function(value) {
                	fieldValue = value;
                	setInputValue(fieldValue);
                },
            	setInputValue = function(value) {

            		value = value || '';
            		inputValue = value; //raw value
            		$input.value = value; //set value in textfield
            	},
            	postBlur      = function() {},
            	onBlur        = function() {
            		
            		var $focusEl = getFocusEl();

            		if (focusClass != '')
						$focusEl.classList.remove(focusClass);

            		fire('blur');
            	},
            	onFocus     = function(evt) {

					var $focusEl = getFocusEl();

					if (focusClass != '')
						$focusEl.classList.add(focusClass);

            		fire('focus', evt);
            	},
            	initEvents  = function() {

            		var $focusEl = getFocusEl();

            		$focusEl.addEventListener('blur', onBlur);
            		$focusEl.addEventListener('focus', onFocus);
            	};
        	
        	initComponent = (function() {
        		
        		var parent = initComponent;
        		return function() {

        			parent();

        			if (component.label) {

						$fieldLabel = document.createElement('div');
						$fieldLabel.className = 'field-label';

						$label = document.createElement('label');
						$label.className   = 'label-text';
						$label.textContent = component.label + ':';

						$fieldLabel.appendChild($label);
						$element.insertAdjacentElement('afterbegin', $fieldLabel);
					}

					// Mejorar con la implementacion de una plantilla en string o como objeto
        			$fieldBody = document.createElement('div');
                    $fieldBody.className = 'field-body';

					/*$inputContainer = document.createElement('div');
					$inputContainer.className = 'input-container';*/

					$fieldInput = document.createElement('div');
					$fieldInput.className = 'field-input';

                    $inputWrap = document.createElement('div');
                    $inputWrap.className = 'input-wrap';

                    $element.appendChild($fieldBody);
                    $fieldBody.appendChild($fieldInput);
                    $fieldInput.appendChild($inputWrap);
                    
                    initField();

                    if (beforeInput.length || component.beforeInput) {

                    	if (component.beforeInput)
                    		beforeInput.push(component.beforeInput);

                    	for (let i = 0; i < beforeInput.length; i++) {

                    		let item = beforeInput[i],
                    			element = item.element, $domEl;
                    		
							if (typeof element == 'string')
								$input.insertAdjacentHTML('beforebegin', element);
							else if (element instanceof HTMLElement)
								$input.insertAdjacentElement('beforebegin', element);

							if (item.reference && ($domEl = $inputWrap.querySelector(item.reference ? '[data-reference="'+ item.reference +'"]' : (item.selector || null)))) {
								$domEls[item.reference] = $domEl;
							}
						}
						//console.log($domEls);
                    }

                    console.log(fieldValue);
        			setValue(fieldValue);
        		}
        	})();

            switch (name) {

                case 'textfield':
                case 'numberfield':
                case 'textarea':
                case 'htmleditor':
                case 'picker':
                case 'multiselect': //temporal
                case 'combobox':
                case 'iconpicker':
                case 'iconpicker-2':
                case 'settingsfield':
                case 'linkfield':
                case 'datefield':
                case 'imagefield':
                case 'tokenfield':

                	var elementCls = 'ui-textfield',
                		$triggers = [],
                		$triggersBox = undefined,
                		triggerClick = function() {},
						initTriggers = function() {

							var triggers = component.triggers;
							console.log(component.label, triggers);
							setTriggers(); //Primero insertar los triggers propios de las subclases
							addTrigger(triggers); //Luego los que vienen de la configuracion

							if ($triggers.length) {

								$triggersBox = document.createElement('div');
								$triggersBox.className = 'input-triggers';

								for (let trigger of $triggers) {

									let $button = document.createElement('button');
									let $icon   = document.createElement('i');

									$button.tabIndex = -1;
									$button.className = 'ui-trigger';
									$button.type = 'button';

									$icon.className = 'fa fa-' + (trigger.icon || 'chevron-down');

									trigger.tooltip && ($button.title = trigger.tooltip);
									$button.addEventListener('click', trigger.handler || function(){});
									$button.appendChild($icon);
									$triggersBox.appendChild($button);
								}
								$fieldInput.classList.add('has-triggers');
								$fieldInput.appendChild($triggersBox);
							}
						},
                		setTriggers = function() {}, // Template method to add triggers in subclasses
						addTrigger = function(triggers) {

							var _triggers;

							if (triggers === undefined)
								return;

							_triggers = !Array.isArray(triggers) ? [triggers] : triggers;

							for (let trigger of _triggers) {
								$triggers.push(trigger);
							}
						},
						onInput = function(evt) {
							fire('input', $$component, evt);
						}
						onKeyUp = function(evt) {
							fire('keyup', $$component, evt);
						},
						onKeyDown = function(evt) {
							fire('keydown', $$component, evt);
						},
						initEvents = (function() {
							//Provisional
							var parent = initEvents;

							return function() {
								parent();
								$input.addEventListener('keyup', onKeyUp);
								$input.addEventListener('keydown', onKeyDown);
								$input.addEventListener('input', onInput);
							}
						})();

					initComponent = (function() {

                		var parent = initComponent;
                		return () => {

                			parent();
                			initTriggers();
                		}
                	})();

                	if (name == 'numberfield') {

                		createInput = function() { //Deberia solo sobreescribir una variable llamada inputType recisar extjs modern

                			var $field = document.createElement('input');
                			$field.type = 'number';

                			return $field;
                		}                		
                	}

                	if (name == 'textarea') {

                		elementCls = 'ui-textarea';
                		createInput = function() {

							var $field  = document.createElement('textarea');
							//$field.rows = component.rows || 3;
							return $field
						};
                	}

                	if (name == 'htmleditor') {

                		var $editor = null;
                		elementCls = 'ui-htmleditor';
                		createInput = function() {

							var $field  = document.createElement('textarea');
							//$field.rows = component.rows || 3;
							return $field
						};
						getValue = function() {
							return $editor.getValue();
						};
						initComponent = (function() {

							var parent = initComponent;

							return () => {
								addListener('afterrender', function($el) {

									$editor = new Simditor({
										textarea: $el.$dom.querySelector('textarea'),
										toolbar: [
										    'title',
											'bold',
											'italic',
											'ul',
											'ol',
											'alignment',
											'hr',
											'link'
										],
										allowedTags: []
									});
									$editor.on('valuechanged', function($e, $src) {

										fire('input', $$component, $editor.getValue());
									});
								});
								parent();
							}
						})();
                	}

                	if (name == 'imagefield') {

                		var elementCls = 'ui-imagefield',
                			//getOnlyUrl
                			$imgPreview = undefined,
                			valueOptions = ['id', 'url', 'width', 'height', 'alt'], // url -> main
                			defaultValue = {
                				id: '',
                				url: '',
                				width: '',
                				height: '',
                				alt: ''
                			},
                			/*valueOptions = {
                				id: '',
                				url: '',
                				width: '',
                				height: '',
                				alt: ''
                			},*/
                			createInput = function() {

                				var $image = document.createElement('img'),
                					$frame = document.createElement('div'),
                					$hidden = document.createElement('input');

                				$frame.className = 'image-frame';
                				//$frame.style.cssText = 'background-image: url("img/transparent_tile.png")';
                				$image.className = 'image-preview';
                				//$image.src = './img/placeholder-image.jpg';
                				$image.loading = 'lazy';
                				$image.style.cssText = 'height: 100%; width: 100%; object-fit: cover; display: none';

                				$image.addEventListener('load', function(evt) {

                					console.log('load image');

                					if (fieldValue.url != '') {

                						!fieldValue.width && (fieldValue.width = this.naturalWidth);
                						!fieldValue.height && (fieldValue.height = this.naturalHeight);
                					}
                				});
                				$image.addEventListener('error', function(evt) {

                				});

                				$frame.style.cssText = 'height: 112px; width: 100%;/*padding: 5px;*/';
                				$hidden.type = 'hidden';
                				//set js_vars.main_path
								$input = $hidden; 
								$imgPreview = $image;

								$frame.append($image, $hidden);
								return $frame;
							},
                			addImage = function() {

                				openImageLibrary(function(image) {
                					//$imgPreview.src = normalizeUrl(image.url);
                					//console.log(image);
                					//setValue(normalizeUrl(image.url));
                					//fire('insert', image); -> replaced
                					onInsert(image);
                					setValue(image);
                				}, false);
                			},
                			onInsert = function(image) {

                				//$imgPreview.style.display = 'block';
                				fire('insert', image, $$component);
                			},
                			removeImage = function() {
                			},
                			setTriggers = function() {

                				addTrigger([{
									icon: 'image',
									handler: addImage
								}, {
									icon: 'trash',
									handler: removeImage
								}]);
                			};

                		/*setValue = (function() { // Original setValue

                			var parent = setValue;
                			return (value) => {

                				console.log('valor de imagefield: '+ value);
                				console.log($imgPreview);

                				parent(value);
                				if (value)
                					$imgPreview.src = value;
                			}
                		})();*/
                		var setValue = function(value) {

	                			//valueOptions
	                			var options = {
	                				id: '',
	                				url: '', //main
	                				height: '',
	                				width: '',
	                				alt: ''
	                			};

	                			var optionsValue = {}, tempValue = {};

	                			/*if (!value) {
	                				valueOptions = defaultValue;
	                			}*/

	                			//value = value || '';
	                			/*console.log(value);
	                			debugger;*/

	                			fieldValue = {};

	                			if (value && value.constructor == Object && value.url) {

	                				optionsValue = value;
	                			} else {

	                				optionsValue = Object.assign({}, defaultValue);
	                				optionsValue.url = value || '';
	                			}

	                			if (optionsValue.url.constructor != String) {

	                				optionsValue = Object.assign({}, defaultValue);
	                			}

	                			for (let key in defaultValue) {
	                				fieldValue[key] = optionsValue[key] || '';
	                			}
	                			/*console.log(fieldValue);
	                			debugger;*/

	                			fieldValue.url && ($imgPreview.src = fieldValue.url);
	                			fieldValue.url && ($imgPreview.style.display = 'block');
	                			/**var value = !value || (value.constructor !== Object && value.constructor !== String) ? {} : value,
	                				tempValue = {};

	                			if (value.constructor === String && value.match(/\.(jpeg|jpg|gif|png)$/) != null) {

	                				value = {
	                					url: value
	                				};
	                			}

	                			for (let key of valueOptions) {
	                				tempValue[key] = value[key] || '';
	                			}**/

	                			/*if (typeof value == 'string' && true) { //component.getOnlySrc el src es el principal valor ya que este se muestra como previa

	                				options.url = value;

	                			} else if (value.construct == Object) {

	                				for (let key in options) {
	                					value[key] && (options[key] = value[key]);
	                				}
	                			}*/
	                			/**fieldValue = tempValue;
	                			fieldValue.url && ($imgPreview.src = fieldValue.url);**/
	                			//setInputValue(component.getOnlySrc ? options.url : JSON.stringify(options));
                			},
                			getValue = function() {
                				return component.getOnlySrc ? fieldValue.url : fieldValue;
                			};

                		/*getValue = (function() {

                			var parent = getValue;

                			return () => {

                				var value = parent();
                				return value.replace(js_vars.uploadsbaseurl, '');
                			}
                		})();*/

                		initComponent = (function() {

                			var parent = initComponent;
                			return () => {

                				if (1) {

                				}
                				parent();

                				$triggersBox.classList.add('vertical');
                				$triggersBox.style.flexDirection = 'column';
                			}
                		})();
                	}

                	if (name == 'picker' || name == 'combobox' || name == 'iconpicker' || name == 'iconpicker-2' || name == 'settingsfield' || name == 'linkfield' || name == 'multiselect') {

                		var $picker = null,
                			baseCls = baseCls + ' ui-picker',
                			triggerIcon = component.triggerIcon || 'chevron-down',
							isExpanded = false,
							expand = function() {},
							collapse = function() {},
							createPicker = function() {},
							triggerClick = function() {

								isExpanded ? collapse() : expand();
								$input.focus();
							},
							expand = function() {

								var $picker = getPicker(); //getDropdown //getPicker

								if ($picker) {

									//alignPicker();
									//setSelection(); //No deberia ir aqui
									$picker.style.display = 'block';

									alignPicker(); // o podria ir antes como arriba
									isExpanded = true;
								}
							},
							collapse = function() {

								if ($picker) { // En el metodo collapse siempre existira el $picker

									$element.classList.remove('picker-open');
									$element.classList.contains('picker-up') ? $element.classList.remove('picker-up') : $element.classList.remove('picker-down');
									$picker.style.display = 'none';
									isExpanded = false;
								}
							},
							collapseIf = function(evt) {

								if (!$fieldBody.contains(evt.target)) { // Check if target element exist in field
									collapse();
								}
							},
							getPicker = function() {

								if ($picker) {
									return $picker;
								}
								if ($picker = createPicker()) { //Asignar a variable global //Asegurarse que la funcion createPicker devuelva el picker para poder agregar evento al document
									document.addEventListener('mousedown', collapseIf);
								}
								return $picker; // Puede devolver undefined
								// return $picker || ($picker = createPicker());
							},
							setTriggers = function() { //Hook necesario para insertar primero el trigger propio de este componente
								
								addTrigger({
									icon: triggerIcon,
									handler: triggerClick
								});
							},
							alignPicker = function() {

								console.log('alignPicker');

								var fieldRects = $fieldBody.getBoundingClientRect(), pickerPosition, pickerRects, pickerHeight, pickerTop;

								pickerHeight = $picker.offsetHeight;

								if (fieldRects.bottom + pickerHeight >= window.innerHeight) {

									pickerTop = ++fieldRects.top - pickerHeight;
									pickerPosition = 'picker-up'; //picker-open - picker-up
								} else {

									pickerTop = --fieldRects.bottom;
									pickerPosition = 'picker-down';
								}
								//pickerTop = fieldRects.bottom + pickerHeight >= window.innerHeight ? fieldRects.top - pickerHeight : fieldRects.bottom;
								$element.classList.add('picker-open');
								$element.classList.add(pickerPosition);

								$picker.style.top = pickerTop + 'px';
								$picker.style.width = fieldRects.width + 'px';
								$picker.style.left = fieldRects.left + 'px';
							};
                	}

                	if (name == 'multiselect') {

                		var elementCls = 'ui-multiselect',
                			selectionText = 'elementos seleccionados',
                			hasFirstSelect = false,
                			valueIndexes = [],
                			readOnly = true,
                			store = component.store || [],
                			valueKey = component.valueKey || '',
                			displayKey = component.displayKey || '',
                			$listBox = null,
                			$searchBox = null,
                			delayedQuery = null,
                			getListbox = function() {
                				return $listBox;
                			},
                			doQuery = function(qString) {

                				if (qString != '') {

                					//store.data = store.source;
                					//store.data = store.data.filter(rec => rec[component.displayKey].toLowerCase().includes(qString.toLowerCase()));

                					let count = 0;
                					
                					store.data.map = {};
                					store.data.items = store.source.items;
                					store.data.items = store.data.items.filter(function(rec, idx) {

                						if (rec[component.displayKey].toLowerCase().includes(qString.toLowerCase())) {

                							store.data.map[rec.record] = count++;
                							return true;
                						} else {
                							return false;
                						}
                					});
                				} else {
                					//store.data = store.source;
                					store.data.items = store.source.items;
                					store.data.map = store.source.map;
                				}
                				$listBox.refreshList();
                			},
                			delayedTask = function(callback, delay) {

                				var timeout;

                				return (...args) => {

                					clearTimeout(timeout);
                					timeout = setTimeout(function() { callback.apply(this, args); }, delay);
                				}
                			},
                			/*initStore = function() { //No funciona 

                				var tmpStore = store, tmpMap = {};

								for (let i = 0, l = tmpStore.length; i < l; i++) {

									tmpMap[i] = i;
									tmpStore[i].index = i;
								}

								store = {};

								store.source = {
									map: tmpMap,
									items: tmpStore
								};

								store.data = store.source;
								//store.source = tmpStore;
							},*/
							initStore = function() {

								var tmpMap = {},
									tmpStore = [];

								for (let i = 0, l = store.length; i < l; i++) {

									let record = store[i];

									tmpMap[i + 1] = i;
									tmpStore[i] = record;
									tmpStore[i].index = i;
									tmpStore[i].record = i + 1;
								}

								store = {};
								store = {
									data: {
										items: tmpStore,
										map: tmpMap
									},
									source: {
										items: tmpStore,
										map: tmpMap
									}
								}
							},
							getStore = function() {
								return store;
							},
							onExpand = function() {

								if (!hasFirstSelect) {

									hasFirstSelect = true;
									$listBox.setSelection(valueIndexes, true);
								}
							};

                		/*var createListBox = function() {

							var index = 0,
								$listBox = document.createElement('ul');

							$listBox.className = 'ui-list-box items-list list-content';
							$listBox.style.height = '185px';
							$listBox.style.overflow = 'auto';

							$listBox.addEventListener('click', onItemClick);

							console.log('store -> ', store);

							for (let record of store.data) { //Creando boundlist - Podria colocarse el elemento por cada vuelta dentro de un objeto

								let $item = document.createElement('li');

								$item.className = 'list-item';
								$item.dataset.index = index;
								$item.dataset.value = record[valueKey]; //new
								$item.innerHTML = getItemTpl(record);
								//$item.textContent = record[displayKey] || '';
								//$item.dataset.value = record[valueKey];
								$listBox.appendChild($item);
								index++;
							}
							return $listBox;
						};*/
                		createPicker = function() {

                			var $picker = document.createElement('div');

							$picker.className = 'field-dropdown';
							$picker.style.cssText = 'position: fixed; min-height: 20px; background: #fff; border: 1px solid #b1b1b1; z-index: 10; padding: 10px';

							$searchBox = $createUI({
								type: 'textfield',
								label: 'Buscar',
								listeners: {
									keyup: function($el, evt) {
										
										if (evt.key.length === 1 || evt.keyCode === 8) { //Asegurarse que la tecla presionada genere un caracter
		                					//delayedQuery(this.value);
		                					delayedQuery($el.getValue());
		                					console.log(store);
		                				}
									}
								},
								renderTo: $picker
							});

							$searchBox.$dom.style.marginBottom = 10 + 'px';

							$listBox = $createUI({
								type: 'listbox',
								store: store,
								displayKey: displayKey,
								multiSelect: true,
								maxHeight: 140,
								border: false,
								renderTo: $picker,
								listeners: {
									select: function($el, selection) {
										setInputValue($el.getSelection().length +' '+ selectionText);
									},
									deselect: function($el, selection) {
										setInputValue($el.getSelection().length +' '+ selectionText);
									},
									afterrender: function($el) {
										/*if (valueIndexes.length) { //recordsIndexes
											$el.setSelection(valueIndexes, true);
										}*/
									},
									painted: function() {}
								}
							});

							//$fieldBody.appendChild($picker); //NO deberia hacer esto esta funcion solo deberia devolver el picker
							return $picker;
                		};
                		expand = function() {

							var $picker = getPicker(); //getDropdown //getPicker

							if ($picker) {

								//alignPicker();
								//setSelection(); //No deberia ir aqui
								if (!renderedPicker) {
									
									renderedPicker = true;
									$fieldBody.append($picker);
								} else {
									$picker.style.display = 'block';
								}

								alignPicker(); // o podria ir antes como arriba
								isExpanded = true;

								onExpand();
							}
                		};

                		initComponent = (function() {

                			var parent = initComponent;

                			return () => {

                				initStore();
                				parent();

                				delayedQuery = delayedTask(doQuery, 30);
                			}
                		})();

                		setValue = (function() {

                			var parent = setValue;

                			return (value) => {

	                			var indexes = [],
	                				storeData = store.source.items;

	                			for (let i = 0, l = storeData.length; i < l; i++) {

	                				if (value.includes(storeData[i][valueKey])) {
	                					indexes.push(i);
	                				}
	                				if (indexes.length == value.length)
	                					break;
	                			}
	                			valueIndexes = indexes;

	                			parent(indexes.length + ' ' + selectionText);

	                			if ($listBox) {

	                				console.log('set selection', indexes);
	                				$listBox.setSelection(indexes);
	                			}
	                		}
                		})();

                		getValue = function() {

                			var indexes = [], value = [];

                			if ($listBox) {

                				indexes = $listBox.getSelection();
                				console.log(store.source.items);

                				for (let i = 0, l = indexes.length; i < l; i++) {
                					value.push(store.source.items[indexes[i]][valueKey]);
                				}
                			}
                			return value;
                		};

                		Object.assign($$component, {
                			getStore,
                			getListbox
                		});
                	}

                	if (name == 'settingsfield') { //settingsdropdown

                		var subFields = {}, //Provisional puede llamarse subComponents o pickerItems
                			elementCls = 'ui-settingsfield';
                			pickerItems = [], //displayValue
                			displayKey = component.displayKey,
                			displayValue = '',
                			//valueKey
                			setTriggers = function() {

                				addTrigger({
									icon: 'cog',
									handler: triggerClick
								});
                			},
                			createPicker = function() {
                				
								var $picker = document.createElement('div'),
									_pickerItems = component.pickerItems;

								$picker.className = 'field-dropdown';
								$picker.style.cssText = 'display: none; padding: 8px; position: fixed; min-height: 20px; background: #fff; border: 1px solid #b1b1b1; z-index: 10';

								if (_pickerItems) {

									if (!Array.isArray(_pickerItems)) {
										_pickerItems = [_pickerItems];
									}

									for (let item of _pickerItems) {

										item.renderTo = $picker;
										pickerItems.push($createUI(item));
									}
								}

								$fieldBody.appendChild($picker);

								return $picker;
							},
							initValues = function(value) {

								var _pickerItems = component.pickerItems;

								if (!Array.isArray(_pickerItems))
									_pickerItems = [_pickerItems];

								console.log(fieldValue);

								for (let field of _pickerItems) {

									field.value = fieldValue[field.name];

									if (field.type == 'combobox') {

										let index = field.store.findIndex((record) => {
											return record[field.valueKey] == field.value;
										});

										console.log(index);
										fieldValue[field.name] = field.store[index].displayKey;
									}
								}
								console.log(_pickerItems);
								//debugger;
							},
							setValue = function(value) { //Corregir ya que solo setea valor cuando inicia sobre objetos planos

								initValues(value);
								console.log(fieldValue);
								setInputValue(fieldValue[displayKey]);
							},
							getValue = function(mode) {

								var values = {};
								console.log(pickerItems);

								if (pickerItems.length)
									for (let field of pickerItems) {

										console.log(field.name, field.getValue());
										values[field.name] = field.getValue();
									}
								else {
									
									for (let field of component.pickerItems) {
										values[field.name] = field.value;
									}
								}
								return values;
							};

						/*initComponent = (function() {

							var parent = initComponent;

							return () => {
								parent();
							}
						})();*/
					}

                	if (name == 'combobox' || name == 'iconpicker' || name == 'iconpicker-2') {

                		//itemHTML = `${display}`,
                		var $itemList,
                			selectedIdx = -1,
                			lastSelectedIdx = -1,
                			selectedRecord = null,
                			elementCls = 'ui-combobox',
                			queryMode = 'local', //new
                			queryDelay = null, //new
                			delayedQuery = null,
							valueKey = component.valueKey || '', /*Clave que se usara para el valor*/
							displayKey = component.displayKey || '', /*Clave que se usara para mostrar*/
							store = {},
							dataStore = component.store || [],
                			getItemTpl = component.getItemTpl || function(record) { /*Overridable*/
                				//console.log(record, displayKey);
                				return record[displayKey];
                			},
                			onKeyDown = function(evt) {

                				var key = evt.key,
                					code = evt.keyCode;

                				console.log('keyName -> ', key, 'keyCode -> ', code);

                				if (key == 'Escape' || code == 27) {
                					onEsc();
                				} else if (key == 'Enter') {
                					onEnter();
                				} else if (key == 'ArrowDown') {
                					onArrowDown();
                				} else if (key == 'ArrowUp') {
                					onArrowUp();
                				}
                			},
                			onKeyUp = function(evt) {

                				//delayedTask(doQuery, 2000)();
                				console.log(evt.keyCode, evt.charCode, evt.key, evt.key.length);

                				if (evt.key.length === 1 || evt.keyCode === 8) { //Asegurarse que la tecla presionada genere un caracter
                					delayedQuery(this.value);
                				}
                			},
                			onEsc = function() {
                				collapse();
                			},
                			onEnter = function() { //revisar si deberia estar en el keydown

                				var $selected;

                				if ($itemList && store.data.length) {

                					$selected = $itemList.querySelector('.selected-item');

                					setValue($selected.dataset.value);
                					fire('select', fieldValue, selectedRecord, $$component); //deberia estar en el setValue ? se puede setear value sin usar click o tecla mediante la consola, deberia llamar al evento?

                					collapse();
                				}
                			},
                			onArrowDown = function() {

                				console.log('arrow down');

                				if ($itemList && store.data.length) {

                					let $activeItem = $itemList.querySelector('.selected-item') ?? ($itemList.firstElementChild.classList.add('selected-item') || $itemList.firstElementChild),
                						activeHeight = $activeItem.clientHeight,
                						itemListHeight = $itemList.clientHeight,
                						$nextItem = $activeItem.nextElementSibling ?? $itemList.firstElementChild,
                						nextItemTop = $nextItem.offsetTop,
                						nextItemHeight = $nextItem.clientHeight;

                					if (nextItemTop - $itemList.scrollTop < 0) {
                						$itemList.scrollTop = 0;
                					} else if (nextItemTop + nextItemHeight - $itemList.scrollTop > itemListHeight) {
                						$itemList.scrollTop = nextItemTop - itemListHeight + activeHeight + nextItemHeight;
                					}

                					$activeItem.classList.remove('selected-item');
                					$nextItem.classList.add('selected-item');
                				}
                			},
                			onArrowUp = function() {

                				if ($itemList && store.data.length) {

                					let $activeItem = $itemList.querySelector('.selected-item') ?? ($itemList.firstElementChild.classList.add('selected-item') || $itemList.firstElementChild),
                						//activeHeight = $activeItem.clientHeight,
                						itemListHeight = $itemList.clientHeight,
                						$nextItem = $activeItem.previousElementSibling ?? $itemList.lastElementChild,
                						nextItemTop = $nextItem.offsetTop;
                						//nextItemHeight = $nextItem.clientHeight;

                					if (nextItemTop - $itemList.scrollTop > itemListHeight) {
                						$itemList.scrollTop = 10000;
                					} else if (nextItemTop - $itemList.scrollTop < 0) {
                						$itemList.scrollTop = nextItemTop;
                					}

                					$activeItem.classList.remove('selected-item');
                					$nextItem.classList.add('selected-item');
                				}
                			},
                			doQuery = function(queryStr) {
                				//Revisar cuando solo se hace click en el trigger no deberia de "reconstruir la lista" solo deberia mostrarla
                				console.log('doQuery', queryStr);

                				if (queryStr != '') {

                					fieldValue = '';
	                				selectedIdx = -1;
	                				lastSelectedIdx = -1;

                					store.data = store.source;
                					store.data = store.data.filter(rec => rec[displayKey].toLowerCase().includes(queryStr.toLowerCase()));
                				} else {
                					store.data = store.source;
                				}

                				if ($picker) {
                					updateList();
                				}
                				//!isExpanded && expand();
                				expand();
                				/*Obligatorio que se seleccione al momento de expandir ya que al inicio no existe el picker pero el field podria tener seteado un valor*/
                				store.data.length && setSelection(); //Podria ir antes de expand();
                			},
                			delayedTask = function(callback, delay) {

                				var timeout;

                				return (...args) => {

                					clearTimeout(timeout);
                					timeout = setTimeout(function() { callback.apply(this, args); }, delay);
                				}
                			},
                			setSelection = function() { //-1 -> ningun record seleccionado

                				var $selected,
                					$lastSelected,
                					listHeight;

                				console.log('selectedIdx -> ', selectedIdx, 'lastSelectedIdx ->', lastSelectedIdx);

                				if ($picker) { //tiene que existir el picker
                					if (selectedIdx > -1) { //tiene que haber un valor seleccionado (por itemClick o por default en cfg)
                						if (lastSelectedIdx != selectedIdx) {

                							if (lastSelectedIdx > -1) { //Si hay un item previamente seleccionado

		                						$lastSelected = $itemList.querySelector('.list-item[data-index="'+ lastSelectedIdx +'"]');
												$lastSelected.classList.remove('selected-item');
	                						}

		                					//lastSelectedIdx = selectedIdx;
											$selected = $itemList.querySelector('.list-item[data-index="'+ selectedIdx +'"]');
											$selected.classList.add('selected-item');
                						} else {
                							console.log('Los valores seleccionados son iguales');
                						}
                						//Revisar scrollToItem
                						listHeight = $itemList.scrollHeight;;
                						selectedTop = $selected.offsetTop;

                						if (selectedIdx === 0) {                							
                							$itemList.scrollTop = 0;
                						} else if (selectedIdx === store.data.length - 1) {
                							$itemList.scrollTop = 100000;
                						} else {
                							$itemList.scrollTop = selectedTop;
                						}

                					} else {
                						console.log('El valor es -1', selectedIdx);
                						$itemList.querySelector('.list-item[data-index="0"]').classList.add('selected-item');
                					}
                				} else {
                					console.log('No existe picker');
                				}
                			},
                			updateList = function() {

            					var $newList = createList();

								$itemList.replaceWith($newList); //replace in same place a DOM element by another
								$itemList = $newList;
                			},
                			/*setSelection = function() {

								var $selected,
									$lastSelected;

								if ($picker && selectedIdx > -1) { //Current selected index

									$selected = $picker.querySelector('.list-item[data-index="'+ selectedIdx +'"]');

									if (lastSelectedIdx > -1 && lastSelectedIdx !== selectedIdx) { //Si existe ya un seleccionado quitarle la clase selected

										$lastSelected = $picker.querySelector('.list-item[data-index="'+ lastSelectedIdx +'"]');
										$lastSelected.classList.remove('selected-item');
									}

									$selected.classList.add('selected-item');
								}
								//console.log('selectedIdx', lastSelectedIdx, selectedIdx);
							}*/
							triggerClick = function() {

								isExpanded ? collapse() : doQuery('');
								$input.focus();
							},
							onItemClick = function(evt) {
								
								console.log('onItemClick');
								var $target = evt.target, selItemIndex, selectedValue;

								// if ($target.classList.contains('list-item')) {
								if ($target.matches('.list-item') || ($target = $target.closest('.list-item'))) {

									selItemIndex = $target.dataset['index'];
									selectedValue = store.data[selItemIndex][valueKey];
									//selectedIdx = selItemIndex;
									//lastSelectedIdx = selectedIdx;
									console.log(selItemIndex, selectedValue, store.data);
									//setValue(selectedValue); //Tal vez tambn pueda pasarsele un record
									setValue($target.dataset['value']);
									collapse(); //Cerrar picker
									fire('select', selectedValue, selectedRecord, $$component); //Es probable que la llamada a este evento solo se haga dentro de onItemClick debido a que este evento solo se ejecuta cuando se selecciona un item de la lista mediante un click (no podria ir dentro de setValue)
								}
							},
							createList = function() {

								var index = 0,
									$listBox = document.createElement('ul');

								$listBox.className = 'items-list list-content';
								$listBox.style.maxHeight = '185px';
								$listBox.style.overflow = 'auto';

								$listBox.addEventListener('click', onItemClick);

								console.log('store -> ', store);

								for (let record of store.data) { //Creando boundlist - Podria colocarse el elemento por cada vuelta dentro de un objeto

									let $item = document.createElement('li');
									/*let display = record[displayKey];
									let value = record[valueKey];*/

									$item.className = 'list-item';
									$item.dataset.index = index;
									$item.dataset.value = record[valueKey]; //new
									$item.innerHTML = getItemTpl(record);
									//$item.textContent = record[displayKey] || '';
									//$item.dataset.value = record[valueKey];
									$listBox.appendChild($item);
									index++;
								}
								return $listBox;
							},
							createPicker = function() {

								var $picker = document.createElement('div');
								$itemList = createList(); //ui-listbox

								$picker.className = 'field-dropdown';
								$picker.style.cssText = 'display: none; position: fixed; min-height: 20px; background: #fff; border: 1px solid #b1b1b1; z-index: 10';

								$picker.appendChild($itemList);
								$fieldBody.appendChild($picker);

								//setSelection();
								return $picker;
							},
							getValue = function() {

								return fieldValue;
							},
							setValue = function(keyValue) { //valor de la clave -> config: value

								var index = -1,
									selRecord,
									displayValue;

								//Obtener index del registro seleccionado por su valueKey
								if (Array.isArray(store.source) && store.source.length) {
									//Se hace de esta forma porque es posible que el picker aun no haya sido creado
									index = store.source.findIndex(function(record) { //Obtener el index 
										return record[valueKey] == keyValue; //If not found return -1
									});
								}
								console.log(index, store);
								selectedRecord = (index < 0) ? {} : store.source[index]; //Revisar
								fieldValue = selectedRecord[valueKey] || ''; //Colocar el verdadero valor del combobox el que sera devuelto con getvalue()
								displayValue = selectedRecord[displayKey] || ''; //Valor que se mostrara en el textfield del combo
								console.log(selectedRecord, valueKey, displayKey);

								selectedIdx > -1 && (lastSelectedIdx = selectedIdx);
								selectedIdx = index; //Index seleccionado global
								//selectedRecord = 

								//console.log('setValue', fieldValue, displayValue);
								setInputValue(displayValue); //Colocar el valor que se mostrara en el input text del combo
								//Comentado por el momento setSelection(); //Seleccionar el item en el picker si es que el picker existe
							},
							setStore = function(newStore) {

								let $newList;

								store = {};
								store.data = newStore;
								store.source = newStore;
								store.count = store.source.length;

								fieldValue = '';
								selectedIdx = -1; //Revisar como funciona
								lastSelectedIdx = -1; //Revisar como funciona

								if ($itemList) {

									$newList = createList();
									$itemList.replaceWith($newList); //replace in same place a DOM element by another
									$itemList = $newList;
								}
							};

						initComponent = (function() {

							var parent = initComponent;

							return () => {

								store.data = dataStore;
								store.source = dataStore;
								store.count = dataStore.length;

								queryMode = component.queryMode || 'local'; //new

								if (valueKey == undefined) {
									valueKey = displayKey;
								}

								queryDelay = queryMode == 'local' ? 10 : 1500; //new
								delayedQuery = delayedTask(doQuery, queryDelay);

								parent();
							}
						})();

						initEvents = (function() {

            				var parent = initEvents;
            				return () => {

            					parent();
            					
            					$input.addEventListener('keyup', onKeyUp);
            					$input.addEventListener('keydown', onKeyDown); //Registrar evento en tecla ESC para cerrar dropdown
            				}
            			})();

            			onBlur = (function() {

							var parent = onBlur;
							return () => {

								parent();
								//setTimeout(collapse, 10);
								//$input.focus(); //lo puse porque el picker colapsaba antes de dar click en la opcion
							}
						})();
                	}

                	if (name == 'iconpicker') {

                		var $inputIcon,
                			elementCls = 'ui-iconpicker',
                			getItemTpl = function(record) {
                				return '<span style="margin-right: 10px; margin-left: 2px; width: 15px; display: inline-flex; justify-content: center"><i class="fa '+ record[valueKey] +'"></i></span><span>'+ record[displayKey] +'</span>';
                			};

                		initComponent = (function() {

                			var parent = initComponent;

                			return function() {
                				//Set custom config
                				valueKey = 'icon';
                				displayKey = 'name';
                				dataStore = [
                					{icon: 'fa-cog', name: 'Engranaje'},
                					{icon: 'fa-adjust', name: 'Ajuste'},
                					{icon: 'fa-anchor', name: 'Ancla'},
                					{icon: 'fa-home', name: 'Casa'},
                					{icon: 'fa-phone', name: 'Telefono'},
                					{icon: 'fa-arrows', name: 'Flecha'},
                					{icon: 'fa-bank', name: 'Banco'},
                					{icon: 'fa-envelope', name: 'Carta'},
                					{icon: 'fa-at', name: 'Arroba'},
                					{icon: 'fa-globe', name: 'Mundo'},
                					{icon: 'fa-balance-scale', name: 'Balanza'},
                					{icon: 'fa-user', name: 'Usuario'},
                					{icon: 'fa-star', name: 'Estrella'},
                					{icon: 'fa-check', name: 'Check'},
                					{icon: 'fa-chevron-right', name: 'Signo mas'},
                					{icon: 'fa-chevron-left', name: 'Signo menos'},
                					{icon: 'fa-building-o', name: 'Edificio'},
                					{icon: 'fa-child', name: 'Niño'},
                					{icon: 'fa-laptop', name: 'Laptop'},
                					{icon: 'fa-file-text-o', name: 'Archivo'},
                					{icon: 'fa-search', name: 'Lupa'},
                					{icon: 'fa-facebook-square', name: 'Facebook'},
									{icon: 'fa-whatsapp', name: 'WhatsApp'},
                					{icon: 'fa-twitter', name: 'Twitter'},
                					{icon: 'fa-youtube', name: 'Youtube'},
                					{icon: 'fa-heart', name: 'Corazon'},
                					{icon: 'fa-heart-o', name: 'Corazon 2'},
                					{icon: 'fa-handshake-o', name: 'Saludo'},
                					{icon: 'fa-users', name: 'Usuarios'},
                					{icon: 'fa-clock-o', name: 'Reloj'},
                				];
                				//dataStore = $UI.fontIcons;
                				beforeInput.push({
                					//selector: 'icon-input', -> opcional
                					//name: 'icon-input', -> ??
                					reference: 'icon',
                					element: [
                						'<span class="field-icon" data-reference="icon" style="flex-shrink: 0">',
                							'<i class="fa fa-"></i>',
                						'</span>'
                					].join('')
                				});
                				//Then call parent method
                				parent();
                				//$inputIcon = $beforeInput.querySelector('i');
                			}
                		})();

                		setValue = (function() {

                			var parent   = setValue, 
                				itemHTML = ``;

                			return function(keyValue) {

                				var $icon = $domEls['icon'].querySelector('i');
                				$domEls['icon'].style.cssText = 'width: 30px; font-size: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0';

                				parent(keyValue);

                				if (fieldValue) {

                					$domEls['icon'].style.opacity = 1;
                					$icon.className = '';
                					$icon.classList.add('fa', fieldValue);
                				} else {

                					$domEls['icon'].style.opacity = 0.4;
                					$icon.classList.add('fa', 'fa-ban');
                				}
                			}
                		})();
                	}

                	if (name == 'iconpicker-2') {

                		var elementCls = elementCls + ' iconpicker-2',
                			iconType = '',
							valueKey = 'idx',
							displayKey = 'name',
                			fontStore = [
                				{
                					idx: 'fa fa-home',
                					name: 'Casa'
                				}, {
                					idx: 'fa fa-child',
                					name: 'Niño'
                				}, {
                					idx: 'fa fa-check',
                					name: 'Check'
                				}
                			],
                			svgStore = [ {} ],
                			imageStore = [
                				{
                					idx: 'network-1.png',
                					name: 'Red'
                				}, {
                					idx: 'worker.png',
                					name: 'Buscar'
                				}, {
                					idx: 'network.png',
                					name: 'Personas'
                				}, {
                					idx: 'contract.png',
                					name: 'Contrato'
                				}, {
                					idx: 'collaboration.png',
                					name: 'Colaboracion'
                				}, {
                					idx: 'judging.png',
                					name: 'Justicia'
                				}, {
                					idx: 'curriculum.png',
                					name: 'Curriculo'
                				}, {
                					idx: 'pdf.png',
                					name: 'Archivo PDF'
                				}, {
                					idx: 'file.png',
                					name: 'Documento'
                				}
                			],
                			beforeInput = [
	                			{
	                				reference: '$fieldIcon',
	                				element: [
	                					'<span class="field-icon" data-reference="$fieldIcon" style="display: flex; justify-content: center; align-items: center; width: 30px; flex-shrink: 0"></span>'
	                				].join('')
	                			}
                			],
                			getItemTpl = function(record) {

                				if (iconType == 'font') {
                					return `<span class="icon" style="margin-right: 10px; width: 25px; display: inline-flex; justify-content: center; font-size: 18px"><i class="${record.idx}"></i></span><span class="text">${record.name}</span>`;
                				} else {
                					return `<span class="icon" style="display: block; margin-right: 10px; width: 25px;"><img src="${js_vars.icons_url}/images/${record.idx}" width=300 height=300 style="width: 100%; height: auto" /></span><span class="text">${record.name}</span>`;
                				}
                			},
                			/*fontItemTpl = function(record) {
                				return '<span style="margin-right: 10px; margin-left: 2px; width: 15px; display: inline-flex; justify-content: center"><i class="fa '+ record[valueKey] +'"></i></span><span>'+ record[displayKey] +'</span>';
                			},
                			imageItemTpl = function() {
                				return '<span style="margin-right: 10px; margin-left: 2px; width: 15px; display: inline-flex; justify-content: center"><img class="'+ record[valueKey] +'" style="width: 100%" /></span><span>'+ record[displayKey] +'</span>';
                			},
                			svgItemTpl = function() {
                				return '<span style="margin-right: 10px; margin-left: 2px; width: 15px; display: inline-flex; justify-content: center"><svg class="'+ record[valueKey] +'" style="width: 100%" /></span><span>'+ record[displayKey] +'</span>';
                			},*/
                			changeItemsList = function(type) {

                				if (iconType !== type) {

                					let store = (type == 'font' && fontStore) || (type == 'svg' && svgStore) || (type == 'image' && imageStore);

                					if (store) {

                						iconType = type;

                						setStore(store);
                						setSelection();
                					}

                					/*if (type == 'font') {

                						iconType = type;
                						getItemTpl = fontItemTpl;
                						setStore(fontStore);

                					} else if (type == 'svg') {

                						iconType = type;
                						getItemTpl = svgItemTpl;
                						setStore(svgStore);

                					} else if (type == 'image') {

                						iconType = type;
                						getItemTpl = imageItemTpl;
                						setStore(imageStore);
                					}*/
                				}
                			};

                		createPicker = function() { //Revisar si puede llamar al metodo createPicker del padre (combobox)

                			console.log('createPicker iconpicker-2');

                			var $topBar = document.createElement('div'),
                				$picker = document.createElement('div');

							$itemList = createList();

							$topBar.className = 'dropdown-topbar';
							$picker.className = 'field-dropdown';
							$topBar.style.cssText = 'padding: 8px; border-bottom: 1px solid #dadada';
							$picker.style.cssText = 'display: none; position: fixed; min-height: 20px; background: #fff; border: 1px solid #b1b1b1; /*box-shadow: rgb(0 0 0) 0px 0px 4px -2px;*/ /*clip-path: inset(1px -100vw -100vh);*/ z-index: 10';

							$picker.append($topBar, $itemList);
							$fieldBody.append($picker);

							$createUI({
								type: 'combobox',
								label: 'Tipo de icono',
								store: [{
									idx: 'image',
									name: 'Imagen',
								},{
									idx: 'font',
									name: 'Fuente'
								}],
								valueKey: 'idx',
								displayKey: 'name',
								value: iconType,
								renderTo: $topBar,
								customCls: 'horizontal',
								listeners: {
									select: function(value) {
										changeItemsList(value);
									}
								}
							});

							//setSelection();
							return $picker;
                		}
                		getValue = function() {

                			return {
                				type: iconType,
                				value: fieldValue
                			}
                		}
                		setValue = (function() {

                			var parent = setValue;

                			return (value) => {

                				console.log(value, iconType, store);

                				var store,
                					defaults = {
                						type: iconType || 'font',
                						value: ''
                					};

                				if (!value || value.constructor !== Object) {
                					value = { value };
                				}

                				for (let key in defaults) {
                					!value[key] && (value[key] = defaults[key]);
                				}

                				console.log(value);

                				changeItemsList(value.type);
                				parent(value.value);
                				
                				if (fieldValue) {
                					
                					if (iconType == 'font') {
                						$domEls.$fieldIcon.innerHTML = `<i class="${fieldValue}" style="font-size: 18px"></i>`;
                					} else {
                						$domEls.$fieldIcon.innerHTML = `<img src="${js_vars.icons_url}/images/${fieldValue}" style="display: block; width: 25px; height: auto; margin-top: -1px" />`;
                					}
                				} else {

                				}
                			}
                		})();
                	}

                	if (name == 'linkfield') { // settings link

                		triggerIcon = 'cog';
                		createPicker = function() {

                			console.log('createPicker linkfield');

                			var $picker = document.createElement('div'),
                				$bottomBar = document.createElement('div'),
                				$okButton = document.createElement('button'),
                				$postLink = null, postLink;

							$picker.className = 'field-dropdown';
							// Reduced padding, smaller font and limited max-width to make picker more compact
							$picker.style.cssText = 'display: none; position: fixed; min-height: 20px; max-width: 420px; width: auto; background: #fff; border: 1px solid #b1b1b1; z-index: 10; padding: 6px; font-size: 13px;';

							$bottomBar.className = 'bottom-bar';
							// tighten margins and align actions to the right
							$bottomBar.style.cssText = 'display: flex; margin: 6px -8px -8px; justify-content: flex-end;';

							$okButton.textContent = 'Aceptar';
							// slightly smaller button padding and font
							$okButton.style.cssText = 'border: 1px solid #919191; padding: 4px 10px; font-size: 13px; border-radius: 3px; background: #f9f9f9; color: #444444;';
                			$okButton.addEventListener('click', function() {
                				setValue(postLink);
                				collapse();
                			});

                			$postLink = $createUI({
								type: 'combobox',
								label: 'Enlace de la publicacion',
								store: js_vars.permalinks,
								valueKey: 'ID',
								displayKey: 'post_title',
								getItemTpl: function(record) { //getinnertpl

									var name = record.post_type == 'mejia-news' ? 'P. de Noticias' : (record.post_type == 'mejia-docs' ? 'P. de Documentos' : (record.post_type == 'attachment' ? 'Archivo' : record.post_type));
									return `<div style="font-size: 13px; line-height: 1.3"><span style="font-weight: 800; margin-right: 8px">${name}</span><span>${record.post_title}</span></div>`;
								},
								renderTo: $picker,
								listeners: {
									select: function(val, rec) { // falta $this como 1er arg
										console.log(rec);
										postLink = rec.post_link || rec.permalink;
									}
								}
								//customCls: 'horizontal'
							});

							$bottomBar.append($okButton);
							$picker.append($bottomBar);
							$fieldBody.append($picker); //la creacion del picker deberia ser automatico, los items del picker deberian ser definidos por un metodo que devuelva el contenido del picker como eleento o array de estos 

							console.log($picker);
							return $picker;
                		}
                	}
                	
                	if (name == 'tokenfield') {

                		var elementCls = 'ui-tokenfield';
                		var tokensList = [];
                		var $tokensList = null;
                		var $tokenInput = null;
                		var clearTokens = function() {

                			if (tokensList.length) {

                				for (let token of tokensList) {
                					token.$element.remove();
                				}
                				tokensList = [];
                				fieldValue = [];
                			}
                		}
                		var addToken = function(token) {

                			var $token = document.createElement('li');
                			$token.dataset.index = tokensList.length;
                			$token.innerHTML = '<span class="text"></span><i class="fa fa-close"></i>';
                			$token.querySelector('span').textContent = token;
                			$token.querySelector('i').onclick = function () {

                				console.log(this);
                				removeToken($token);
                			};
                			tokensList.push({
                				value: token,
                				$element: $token
                			});
                			//fieldValue.push(token); //cause loop infinito
                			$tokensList.insertBefore($token, $tokensList.lastElementChild);
                			onAddItem();
                		}

                		var updateIndexes = function() {

                			let c = 0;

                			for (let token of tokensList) {

                				token.$element.dataset.index = c;
                				c++;
                			}
                		};

                		var removeToken = function($el) {

                			var idx = $el.dataset.index;
                			$el.remove();
                			tokensList.splice(idx, 1);
                			//fieldValue.splice(idx, 1);
                			updateIndexes();
                			onRemoveItem();
                		}

                		var onRemoveItem = function() {
                			fire('removeitem', $$component);
                		}

                		var onAddItem = function() {
                			fire('additem', $$component);
                		}

                		setValue = function(value) {

                			clearTokens();

                			if (value) {
	                			if (typeof value == 'string') {

	                				fieldValue = value.split(' ');
	                			} else {

	                				fieldValue = value;
	                			}
	                		} else {

	                			fieldValue = [];
	                		}

	                		for (let token of fieldValue) {

	                			addToken(token);
	                		}
                		}
                		getValue = function() {

                			let value = []; //prov

                			for (let i of tokensList) {
                				value.push(i.value);
                			}
                			return value.join(' ');
                		}
                		createInput = function() {

                			$tokensList = document.createElement('ul');
                			$tokensList.className = 'tokens-list';
                			$tokensList.innerHTML = '<li><input type="text"></li>';

                			$tokenInput = $tokensList.querySelector('input');
                			$tokenInput.addEventListener('keydown', function(evt) {

                				console.log(evt.keyCode);

                				if (evt.keyCode == 32) {

                					console.log(evt.target);
                					addToken(evt.target.value);
                					evt.target.value = '';

                				} else if (evt.keyCode == 8 && evt.target.value == '') {

                					console.log('remove token');
                					removeToken(this.parentElement.previousElementSibling);
                				}
                			});
                			$tokenInput.addEventListener('keyup', function(evt) {

                				if (evt.target.value == ' ') {
                					evt.target.value = '';                					
                				}
                			});

                			return $tokensList;
                		}
                	}
                	/*createField = function() {
                		var $field  = document.createElement('input');
                		$field.type = 'text';

                		return $field;
                	}*/
                break;
                case 'select':
                	createInput = function() {
                		var $field = document.createElement('select');
                		return $field;
                	};
                break;
                case 'checkbox':
                break;
            }
            Object.assign($$component, { getValue: getValue, isFormField: true, name: fieldName, setValue: setValue });
        break;
        
        default:
            switch (name) {
                
                case 'button':

                    $element = document.createElement('button');
                    elementCls = 'ui-button';
                    elementHTML = [
                        (component.icon ? '<i class="icon fa fa-'+ component.icon +'"></i>' : ''),
                        '<span class="text">'+ component.text +'</span>'
                    ].join('');
                    renderTo    = component.renderTo;
                    /*initComponent = (function() {
                        
                        var parent = initComponent;
                        
                        return function() {
                            parent();
                        }
                    })();*/
                    initEvents = function() {

                        if (component.handler)
							$element.addEventListener('click', function() {
							    component.handler($$component, $element);
							});
                    }
                break;
                
                case 'progress':
                    
                    var $percentCircle, $percent, $percentNumber;
                    
                    elementCls = 'ui-circle-progress';
                    elementHTML = 
                        `<svg viewBox="0 0 34 34">
            				<circle cx="17" cy="17" r="15.92"></circle>
            				<circle cx="17" cy="17" r="15.92" style="stroke-dashoffset: 100px;"></circle>
            			</svg>
            			<div class="percent">
            				<p style="margin: 0"><span class="number">0</span><span class="sign">%</span></p>
            			</div>`;

            		initComponent = (function() {
            		    
            		    var parent = initComponent;
            		    return function() {
            		        
            		        //var $percentCircle, $percent, $percentNumber;
            		        
            		        parent();
            		        $percentCircle = $element.querySelector('svg circle:nth-child(2)');
            		        $percent       = $element.querySelector('.percent');
            		        $percentNumber = $percent.querySelector('.number');
            		    }
            		})();
            		let wait = function() {
            		    
            		    $element.classList.add('wait');
            		    $percentCircle.style.strokeDashoffset = '';
            		    $percent.style.display = 'none';
            		}
            		let progress = function() {
            		    
            		    $element.classList.remove('wait');
            		    $percentCircle.style.strokeDashoffset = '100px';
            		    $percent.style.display = 'block';
            		}
            		let setProgress = function(percent) {
            		    
            		    var restPercent = 100 - percent;
            		    $percentCircle.style.strokeDashoffset = restPercent;
            		    $percentNumber.textContent = percent;
            		}
            		
            		Object.assign($$component, {
            		    //$dom: $element,
            		    wait: wait,
            		    progress: progress,
            		    setProgress: setProgress
            		});
                break;

                case 'mask':

                	var $maskMsg,
                		$msgBox,
                		$mask,
                		$text,
                		$state,
                		$icon,
                		$message,
                		elementCls = 'ui-mask-message',
                		fixed = true,
                		floating = true,
                		modal = true,
                		message = component.message || '',
                		setMessage = function(msg) {
                			typeof msg == 'string' && ($message.textContent = msg);
                		}

                	initComponent = (function() {

                		var parent = initComponent;
                		
                		return function() {
                			parent();
	                		/*$mask = document.createElement('div');
	                		$mask.className = 'ui-mask';*/

							$message = document.createElement('div');
							$message.className = 'mask-message';

							$element.innerHTML = 
								`<div class="mask-indicator mask-icon">
									<div class="ui-circle-progress wait">
										<svg viewBox="0 0 34 34">
											<circle cx="17" cy="17" r="15.92"></circle>
											<circle cx="17" cy="17" r="15.92" style="stroke-dashoffset: 100px;"></circle>
										</svg>
									</div>
								</div>`;

							message && setMessage(message);
							$element.appendChild($message);
	            		}
                	})();

                	Object.assign($$component, { setMessage })
                break;

                case 'listbox':

                	var $list = null,
                		store = component.store || [],
                		dataStore = component.store || [],
                		elementCls = 'ui-listbox',
                		//elementHTML = '<ul class="list"></div>',
                		multiSelect = component.multiSelect || false,
                		//valueKey = component.valueKey || '',
                		displayKey = component.displayKey || '',
                		selection = [],
                		lastSelected = null,
                		highlightedItem = null,
                		/*initStore = function() {

                			for (let i = 0, l = dataStore.length; i < l; i++) {
                				dataStore[i].index = i;
							}
							store.data = dataStore;
							store.source = dataStore;
                		},*/
                		isSelected = function(rec) {
                			return selection.includes(rec);
                		},
                		setSelection = function(records, supressEvent) { //select
                			beginSelect(records, supressEvent);
                		},
                		getSelection = function() {
                			return selection;
                		},
                		getLastSelect = function() {
                			return lastSelected
                		},
                		beginSelect = function(record, supressEvent) {

                			if (multiSelect) {
                				doMultiSelect(record, supressEvent);
                			} else {
                				doSingleSelect(record, supressEvent);
                			}
                		},
                		selectWithClick = function(record, $item) {

                			console.log('select with click', record);
                			if (multiSelect) {

                				if (isSelected(record)) {
                					console.log('ya esta seleccionado');
                					doSelect(false, record);
                				} else {
                					console.log('no esta seleccionado');
                					beginSelect(record);
                				}
                			} else {

                				if (lastSelected != record)
                					beginSelect(record);
                			}
                		},
                		doSingleSelect = function(record) {

                			console.log('doSingleSelect', lastSelected);

                			if (lastSelected) {

                				doSelect(false, lastSelected);
                			}
                			doSelect(true, record);
                		},
                		doMultiSelect = function(records, supressEvent) { //records or indexes

                			if (!Array.isArray(records))
                				records = [records];

                			for (let i = 0, l = records.length; i < l; i++) {

                				let record = records[i];

                				if (!store.source.items[record] || isSelected(record))
                					continue;

                				doSelect(true, record, supressEvent);
                			}
                		},
                		doSelect = function(isSelected, record, supressEvent) { //toggleSelect

                			//var $item = $list.querySelector('li[data-record-id='+ record +']');
                			//var $item = $list.querySelector("li[data-index='"+ record +"']");
                			var $item = $list.children[store.data.map[store.source.items[record].record]],
                				eventName = isSelected ? 'select' : 'deselect';

                			console.log('doSelect', eventName, record, $item);

                			if (isSelected) { //toSelect

                				lastSelected = record;
                				selection.push(record);
                				$item.classList.add('selected-item');

                			} else {

                				selection.splice(selection.indexOf(record), 1);
                				$item.classList.remove('selected-item');
                			}

                			if (!supressEvent)
                				fire(eventName, $$component, record);
                		},
                		onItemClick = function(evt) {

                			var $target = evt.target, selItemIndex, selectedValue;

                			if ($target.matches('.list-item') || ($target = $target.closest('.list-item'))) {
                				//console.log($target);
                				//selectWithClick(store.data[$target.dataset['index']], $target, evt);
                				//selectWithClick(store.data.map[+$target.dataset['record']], $target, evt);
                				selectWithClick(store.data.items[+$target.dataset['index']].index, $target, evt);
                			}
                		},
                		refreshList = function() {

                			var $tmpList = createList();
                			$list.replaceWith($tmpList);

                			$list = $tmpList;

                			if (selection.length) { //repaint
                				for (let i = 0, l = selection.length; i < l; i++) {

                					let index = selection[i];
                					let position = store.data.map[store.source.items[index].record];
                					$list.children[position] && $list.children[position].classList.add('selected-item');
                				}
                				/*for (let i = 0, l = $list.children.length; i < l; i++) {

                					let $item = $list.children[i];
                					isSelected(+$item.dataset.record) && $item.classList.add('selected-item');
                				}*/
                			}
                		},
                		enter = function() {
                			selectHighlighted();
                		},
                		arrowUp = function() {

	            			//let $curItem = $list.querySelector('.hovered-item') ?? ($list.firstElementChild.classList.add('hovered-item') || $list.firstElementChild),
	            			let currentItem = highlightedItem || -1,
	            				$nextItem = currentItem > 0 ? $list.children[currentItem].previousElementSibling : $list.lastElementChild,
	            				//$nextItem = $currentItem.previousElementSibling ?? $list.lastElementChild,
	            				nextItemTop = $nextItem.offsetTop,
								listHeight = $element.clientHeight;

							console.log(highlightedItem, currentItem, $nextItem);
							highlightItem($nextItem);
                		},
                		arrowDown = function() {

                			//newItemIdx = oldItemIdx < allItems.getCount() - 1 ? oldItemIdx + 1 : 0; //wraps around
                            let currentItem = highlightedItem ?? -1,
                            	$nextItem = currentItem < $list.children.length - 1 ? $list.children[currentItem + 1] : $list.firstElementChild;

                            highlightItem($nextItem);
                		},
                		keyDown = function(evt) {

                			var key = evt.key;

                			if (key == 'Enter') {
            					enter();
            				} else if (key == 'ArrowDown') {

            					console.log('arrow down');
            					arrowDown();
            				} else if (key == 'ArrowUp') {

            					console.log('arrow up');
            					arrowUp();
            				}
            				evt.preventDefault();
                		},
                		onMouseInOut = function(evt) {

                			var $target = evt.target;
                			
                			if ($target.matches('li.list-item') || ($target = $target.closest('ul > li.list-item'))) {

                				if (evt.type == 'mouseover') {
                					//console.log('over');
                					if (highlightedItem != null) {
										$list.childNodes[highlightedItem].classList.remove('hovered-item');
									}
									//item.classList.add('hovered-item');
									$target.classList.add('hovered-item');
									highlightedItem = +$target.dataset.index;
									//highlightedItem = Array.from($list.childNodes).indexOf($target);
                				} else {
                					//console.log('out -> ', $target);

                					if (highlightedItem != null) { //necesario para que cuando estando un item señalado con el mouse y se use las las teclas flechas arriba abajo -> comentar para ver
										$list.children[highlightedItem].classList.remove('hovered-item');
									}

                					$target.classList.remove('hovered-item');
                					highlightedItem = null; //-> Si se descomenta tendra que implementarse un metodo en arrow up down
                				}
                			}
                		},
                		updateList = function() {},
                		createList = function() {

                			var $list = document.createElement('ul'),
                				storeData = store.data.items;

                			$list.className = 'list';

                			if (storeData.length) {
	                			for (let i = 0, l = storeData.length; i < l; i++) {

	                				let $li = document.createElement('li'),
	                					record = storeData[i];

	                				$li.className = 'list-item';
	                				$li.dataset.index = i;
	                				$li.dataset.record = record.record;
	                				$li.innerHTML = getItemTpl(record);

	                				$list.append($li);
	                			}
	                		} else {

	                			let $li = document.createElement('li');

	                			$li.innerHTML = 'No hay resultados';
	                			$list.append($li);
	                		}

                			return $list;
                		},
                		getItemTpl = function(record) {
                			return '<span>'+ record[displayKey] +'</span>';
                		},
                		filter = function() { //Obsoleto
                		},
                		selectHighlighted = function() {
                			
                			if (highlightedItem != null)
                				selectWithClick(store.data.items[highlightedItem].index);
                		},
                		highlightItem = function(item) {

                			var $item, listHeight, itemTop, itemHeight, listScrollTop;

                			if (typeof item == 'number')
                				item = $list.childNodes[item];

                			//console.log(item);
                			if (highlightedItem != null) {
                				//console.log('hightlightedItem ->', highlightedItem);
                				$list.children[highlightedItem].classList.remove('hovered-item');
                			}

                			item.classList.add('hovered-item');
                			highlightedItem = Array.from($list.childNodes).indexOf(item);

                			itemTop = item.offsetTop;
                			itemHeight = item.clientHeight;
                			listScrollTop = $element.scrollTop;
                			listHeight = $element.clientHeight;
                			console.log('itemTop', itemTop, item);

                			if (itemTop - listScrollTop < 0) {

                				console.log('up');
                				$element.scrollTop = itemTop;
                			} else if (itemTop + itemHeight - listScrollTop > listHeight) {

                				console.log('down', itemTop - listHeight + itemHeight);
                				$element.scrollTop = itemTop - listHeight + itemHeight;
                				//debugger;
                			} else {
                				console.log('else');
                			}
                		},
                		autoSelect = function() {
                			console.log(lastSelected);
                			//setTimeout(function() {
                			highlightItem(lastSelected || 0);
                			//}, 10);
                		};

                	initEvents = function() {

                		$element.tabIndex = -1;

                		$element.addEventListener('click', onItemClick);
                		$element.addEventListener('keydown', keyDown);
                		$element.addEventListener('mouseout', onMouseInOut);
                		$element.addEventListener('mouseover', onMouseInOut);
                	};

                	initComponent = (function() {

                		var parent = initComponent;

						return () => {

							//$list = $element.querySelector('.list');
							parent();
							//initStore();

							$list = createList();
							$element.append($list);

							if (component.height) {
								$element.style.height = component.height + 'px';
							} else if (component.maxHeight) {
								$element.style.maxHeight = component.maxHeight + 'px';
							}
						}
                	})();

                	afterRender = (function() {

                		var parent = afterRender;

                		return () => {

                			parent();
                			autoSelect();
                		}
                	})();

                	Object.assign($$component, {
                		refreshList,
                		getSelection,
                		setSelection
                	});
                break;
            }
        break;
    }
    construct();
    /*initComponent();
    render(renderTo);*/
    
    return $$component;
}

function createRoundProgress(renderTo) {
		    
    var $element = document.createElement('div'),
        bodyHTML = 
            `<svg viewBox="-1 -1 34 34">
				<circle cx="16" cy="16" r="15.9155"></circle>
				<circle cx="16" cy="16" r="15.9155" style="stroke-dashoffset: 100px;"></circle>
			</svg>
			<div class="percent">
				<p style="margin: 0"><span>0</span>%</p>
			</div>`, $progress;
			
	$element.className = 'circle-progress';
    $element.innerHTML = bodyHTML;
    
    $progress = querySelector('svg circle:nth-child(2)');
	$percent  = querySelector('.percent span.number');
	
	function setProgress(percent) {
	    
	    $progress.style.strokeDashoffset = (100 - percent) + 'px';
	}
		
	return {
	    dom: $element,
	    value: function() {
	        
	    }
	}
}

function createRoundSpinner() {
    
    var wrapper = document.createElement('div');
        spinner = 
            `<div class="spinner-container">
    			<svg class="spinner" viewBox="0 0 44 44">
    				<circle cx="22" cy="22" r="20"></circle>
    			</svg>
    		</div>`;
    		
    wrapper.className = 'spinner-container';
    wrapper.innerHTML = spinner;
    
    return wrapper;
}
/*
En extjs primero se arma la estructura de objetos instanciados 
{
	elemento instanciado
	items: [
		{elemento instanciado},
		{elemento instanciado}
	],
	elemento instanciado
}
Luego esa estructura se procesa creando una estructura html completa de todos los elementos, insertandolo todo de un solo golpe (renderizado)
Otra forma pero requiere de otra funcion externa 
El objeto tendria que devolver la funcion render para poder usarla y ejecutar los eventos beforerender y afterrender
for (let item of items) {
	$$component = $createUI(item);
	renderTo.appendChild($$component.$dom)
}
*/