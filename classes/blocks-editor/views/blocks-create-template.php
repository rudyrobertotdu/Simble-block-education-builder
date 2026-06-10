<h1>Crear plantilla</h1>
<?php

	$db = new WP_Database();
	$pages = [
		[
			"post_title" => "Inicio",
			"post_content" => "",
			"post_name" => "inicio",
			"post_type" => "page",
			"post_status" => "publish",
			"post_author" => 1
		],
		[
			"post_title" => "Presentación",
			"post_content" => "",
			"post_name" => "presentacion",
			"post_type" => "page",
			"post_status" => "publish",
			"post_author" => 1
		],
		[
			"post_title" => "Misión, visión y valores",
			"post_content" => "",
			"post_name" => "mision-vision-valores",
			"post_type" => "page",
			"post_status" => "publish",
			"post_author" => 1
		],
		[
			"post_title" => "Reseña histórica",
			"post_content" => "",
			"post_name" => "resenia-historica",
			"post_type" => "page",
			"post_status" => "publish",
			"post_author" => 1
		],
		[
			"post_title" => "FODA",
			"post_content" => "",
			"post_name" => "foda",
			"post_type" => "page",
			"post_status" => "publish",
			"post_author" => 1
		],
		[
			"post_title" => "Organigrama",
			"post_content" => "",
			"post_name" => "organigrama",
			"post_type" => "page",
			"post_status" => "publish",
			"post_author" => 1
		],
		[
			"post_title" => "Plana jerárquica",
			"post_content" => "",
			"post_name" => "plana-jerarquica",
			"post_type" => "page",
			"post_status" => "publish",
			"post_author" => 1
		],
		[
			"post_title" => "Plana docente",
			"post_content" => "",
			"post_name" => "plana-docente",
			"post_type" => "page",
			"post_status" => "publish",
			"post_author" => 1
		],
		[
			"post_title" => "Objetivos y politicas institucionales",
			"post_content" => "",
			"post_name" => "objetivos-politicas-institucionales",
			"post_type" => "page",
			"post_status" => "publish",
			"post_author" => 1
		],
		[
			"post_title" => "Becas y créditos",
			"post_content" => "",
			"post_name" => "becas-creditos",
			"post_type" => "page",
			"post_status" => "publish",
			"post_author" => 1
		],
		[
			"post_title" => "Areas y Unidades",
			"post_content" => "",
			"post_name" => "areas-unidades",
			"post_type" => "page",
			"post_status" => "publish",
			"post_author" => 1
		],
		[
			"post_title" => "Contactanos",
			"post_content" => "",
			"post_name" => "contactanos",
			"post_type" => "page",
			"post_status" => "publish",
			"post_author" => 1
		],
		[
			"post_title" => "Trámite documentario",
			"post_content" => "",
			"post_name" => "tramite-documentario",
			"post_type" => "page",
			"post_status" => "publish",
			"post_author" => 1
		],
		[
			"post_title" => "Galeria",
			"post_content" => "",
			"post_name" => "galeria",
			"post_type" => "page",
			"post_status" => "publish",
			"post_author" => 1
		],
		[
			"post_title" => "Investigación e Innovación",
			"post_content" => "",
			"post_name" => "investigacion-innovacion",
			"post_type" => "page",
			"post_status" => "publish",
			"post_author" => 1
		]
	];

	$count = 0;

	foreach ($pages as $key => $page) {

		$name = explode('-', $page['post_name'])[0];

		$result = $db->query(
			"SELECT ID FROM {$db->prfx}posts WHERE post_name LIKE '%$name%'"
		);

		if (empty($result)) {

			$count++;
			wp_insert_post($page);
		}
	}

	echo "Se crearon $count paginas";
?>