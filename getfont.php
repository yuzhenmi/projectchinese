<?php
//get parameters
$id = $_GET['id'];

//connect to database
$link = mysql_connect('fdb5.biz.nf', '1487225_mydb', 'pass')
	or die('Could not connect: ' . mysql_error());
mysql_select_db('1487225_mydb') or die('Could not select database');

//query
$query = "SELECT svg FROM ChineseFont WHERE id=$id";
$result = mysql_query($query) or die('Query failed: ' . mysql_error());
$row = mysql_fetch_array($result, MYSQL_ASSOC);

//return result
echo json_encode($row);

//free resultset
mysql_free_result($result);

//close connection
mysql_close($link);
?>