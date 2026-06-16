<div class="uix-page blocks-editor">
	<div class="uix-page-header">
		<h2 class="page-title" style="margin: 0">Listado de plantillas</h2>
		<a href="<?php echo admin_url('admin.php?page=blocks-template&action=create'); ?>" class="uix-button button save">
			<i class="fa fa-file-o" style="margin-right: 3px"></i>
			<span class="text">CREAR</span>
		</a>
	</div>
	<div class="uix-page-body">
		<table style="width: 100%">
			<thead>
				<tr>
					<td style="width: 50px">ID</td>
					<td>Nombre</td>
					<td>Sección</td>
					<td style="width: 180px">Acciones</td>
				</tr>
			</thead>
			<tbody>
				<?php

					$database = new WP_Database();
					$templates = $database->fetch('blocks_editor_templates', '', 'ID, template_name, template_section');

					if (count($templates)):
						foreach ($templates as $key => $template):
				?>
				<tr>
					<td><?php echo $template['ID']; ?></td>
					<td><?php echo $template['template_name']; ?></td>
					<td><?php echo $template['template_section']; ?></td>
					<td>
						<a href="<?php echo admin_url("admin.php?page=blocks-template&action=update&id=".$template['ID']); ?>"><i class="fa fa-pencil"></i>Editar</a>
						|
						<?php $nonce_url = wp_nonce_url( admin_url('admin-post.php?action=blocks-editor-request&handler=delete-blocks-template&template_id='.$template['ID']), 'delete_blocks_template_'.$template['ID'], 'nonce' ); ?>
						<a href="<?php echo esc_url($nonce_url); ?>" onclick="return confirm('¿Borrar plantilla <?php echo esc_js($template['template_name']); ?> ? Esta acción no se puede deshacer.')"><i class="fa fa-trash"></i>Borrar</a>
					</td>
				</tr>
				<?php
						endforeach;
					else:
				?>
				<tr>
					<td colspan="4"><strong>No hay registros</strong></td>
				</tr>
				<?php
					endif;
				?>
			</tbody>
		</table>
	</div>
</div>