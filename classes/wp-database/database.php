<?php

/**
 * WP_Database
 *
 * Pequeña capa ligera para operaciones de base de datos centrada en este
 * theme. Encapsula llamadas a `$wpdb` para consultas comunes (query, fetch,
 * insert, update) y añade un prefijo automático de tabla.
 *
 * Responsabilidad:
 * - Proveer métodos reutilizables para persistencia sencilla desde el tema
 * - Aislar el uso de `$wpdb` y centralizar prefijo de tablas
 *
 * Notas de diseño:
 * - No altera las estructuras de WordPress; utiliza la API `$wpdb`
 * - Devuelve arrays asociativos para facilitar su uso en vistas
 */
	class WP_Database {

		protected static $wpdb;
		protected static $table_prefix;
		public $prfx;

		public function __construct() {

			global $wpdb;

			self::$wpdb         = $wpdb;
			self::$table_prefix = $wpdb->base_prefix;
			$this->prfx         = $wpdb->base_prefix;
		}
		public function query($query) {

			$result = self::$wpdb->get_results($query, ARRAY_A);
			_log(self::$wpdb->last_query);

			return $result;
		}
		public function fetch($table, $where = '', $fields = '*') {

			$query = "SELECT $fields FROM ".self::$table_prefix.$table;

			if ($where)
				$query .= " WHERE $where";

			$result = self::$wpdb->get_results($query, ARRAY_A);

			return $result;
		}

		public function insert($table, $data) {

			self::$wpdb->insert(self::$table_prefix.$table, $data);
			$last_rowID = self::$wpdb->insert_id;

			return $last_rowID;
		}

		public function update($table, $data, $where) {

			$response = self::$wpdb->update(self::$table_prefix.$table, $data, $where);
			
			return $response;
		}
	}
?>