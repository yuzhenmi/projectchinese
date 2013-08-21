<?php
//get parameters
$type = $_GET['type'];
$id = $_GET['id'];

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
	$link = mysql_connect('fdb5.biz.nf', '1487225_mydb', '19910401')
		or die('Could not connect: ' . mysql_error());
	mysql_select_db('1487225_mydb') or die('Could not select database');
	
	//query
	$query = "SELECT name,description,content FROM $table WHERE id=$id";
	$result = mysql_query($query) or die('Query failed: ' . mysql_error());
	$array = array();
	$row = mysql_fetch_array($result, MYSQL_ASSOC);
	
	//return result
	echo json_encode($row);
	
	//free resultset
	mysql_free_result($result);
	
	//close connection
	mysql_close($link);
}
?>