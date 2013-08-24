<?php
//get parameters
$type = $_GET['type'];

//get table
$table = '';
if ($type == 'word') {
	$table = 'StandardChineseWords';
}
elseif ($type == 'phrase') {
	$table = 'StandardChinesePhrases';
}
elseif ($type == 'paragraph') {
	$table = 'StandardChineseParagraphs';
}

if ($table != '') {
	//connect to database
	$link = mysql_connect('fdb5.biz.nf', '1487225_mydb', 'pass')
		or die('Could not connect: ' . mysql_error());
	mysql_select_db('1487225_mydb') or die('Could not select database');
	
	//query
	$query = "SELECT id,name,description FROM $table";
	$result = mysql_query($query) or die('Query failed: ' . mysql_error());
	$array = array();
	while ($row = mysql_fetch_array($result, MYSQL_ASSOC)) {
		array_push($array, $row);
	}
	
	//return result
	echo json_encode($array);
	
	//free resultset
	mysql_free_result($result);
	
	//close connection
	mysql_close($link);
}
?>