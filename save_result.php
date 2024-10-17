<?php
    print "<div style='width:800px; margin: 0 auto;margin-top: 10%;'><center><h1>Please submit the following Completion code</h1></center>";
    print "<center><h1>Completion code: CSQYP5DN</h1></center>";
    print "<center><h1>Thank you for your cooperation!</h1></center></div>";

    // $fname = "/home/ss-takashi/www/".$_POST["to"].$_POST["fname"];
    $fname = $_POST["to"].$_POST["fname"];
    $result = $_POST["csvData"];

    $fp = fopen($fname, 'w');
    fwrite($fp, $result);
    fclose($fp);
?>
