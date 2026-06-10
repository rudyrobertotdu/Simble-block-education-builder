<?php

	class WP_Database { //WP_DataBase Alternative name

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
			// log_it(self::$wpdb->last_query);

			return $result;
		}

		public function insert($table, $data) {

			self::$wpdb->insert(self::$table_prefix.$table, $data);
			$last_rowID = self::$wpdb->insert_id;

			return $last_rowID;
		}

		public function update($table, $data, $where) {

			$response = self::$wpdb->update(self::$table_prefix.$table, $data, $where);
			// log_it(self::$wpdb->last_query);
			
			return $response;
		}
	}
?>