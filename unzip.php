<?php
// Prevent unauthorized access by checking a simple passcode or query parameter
if (!isset($_GET['run']) || $_GET['run'] !== 'true') {
    die("<h1>Access Denied</h1><p>Please visit this page with '?run=true' in the URL to start unzipping.</p>");
}

$zip = new ZipArchive;
$fileName = '';

if (file_exists('update.zip')) {
    $fileName = 'update.zip';
} elseif (file_exists('1997laundry-main.zip')) {
    $fileName = '1997laundry-main.zip';
}

if ($fileName !== '') {
    if ($zip->open($fileName) === TRUE) {
        $zip->extractTo(__DIR__);
        $zip->close();
        echo "<h1>Success! Unzipped {$fileName} successfully!</h1>";
        echo "<p>Please delete this file (unzip.php) and the zip file from your server for security.</p>";
    } else {
        echo "<h1>Error! Failed to extract {$fileName}. Please check folder permissions.</h1>";
    }
} else {
    echo "<h1>Error! Zip file not found.</h1><p>Make sure 'update.zip' or '1997laundry-main.zip' is uploaded in the same folder as this unzip.php script.</p>";
}
?>
