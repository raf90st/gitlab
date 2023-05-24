<?php

/*ini_set('display_startup_errors', 1);
ini_set('display_errors', 1);
error_reporting(-1);*/

$wpTemp = 'wp-temp/';
$wpPlug = 'wp-plugins/';
$typo3Temp = 'typo3-temp/';
$typo3Plug = 'typo3-plugins/';
$downloadTemp = 'download-temp/';

$cms = $_POST['radio'];
$chosenOnes = $_POST['data'];
$typo3VersionStamp = $_POST['typo3'];

$plugins = json_decode($chosenOnes, true);
$pluginLength = count($plugins);

function unzip_file($sourcePath, $targetPath) {
    $sourcePath = './' . $sourcePath;
    $targetPath = './' . $targetPath;

    $zipFile = new ZipArchive();
    $zipPointer = $zipFile->open($sourcePath);

    if ($zipPointer === true) {
        $zipFile->extractTo($targetPath);
        $zipFile->close();
      } else {
        echo 'Es ist beim Öffnen der Zip Datei ein Fehler aufgetreten';
    }
}

function zip_folder($fileName, $targetPath) {
    $rootPath = realpath($targetPath);
    $zip = new ZipArchive();
    $zip->open($fileName, ZipArchive::CREATE | ZipArchive::OVERWRITE);

    // Create recursive directory iterator
    /** @var SplFileInfo[] $files */
    $files = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($rootPath),
        RecursiveIteratorIterator::LEAVES_ONLY
    );

    foreach ($files as $name => $file) {
        // Skip directories (they would be added automatically)
        if (!$file->isDir()) {
            // Get real and relative path for current file
            $filePath = $file->getRealPath();
            $relativePath = substr($filePath, strlen($rootPath) + 1);

            // Add current file to archive
            $zip->addFile($filePath, $relativePath);
        }
    }

    // Zip archive will be created only after closing object
    $zip->close();
}

function delete_dir($dir) {
    if (is_dir($dir)) {
        $objects = scandir($dir);
        foreach ($objects as $object) {
            if ($object != "." && $object != "..") {
                if (filetype($dir."/".$object) == "dir") {
                    delete_dir($dir."/".$object);
                } else {
                    unlink($dir."/".$object);
                }
            }
        }
        reset($objects);
        rmdir($dir);
    }
}

//main
if (!is_dir($downloadTemp)) {
    mkdir($downloadTemp);
}

if ($cms === 'wp') {
    $pluginTarget = 'download-temp/wordpress/wp-content/plugins/';
    $toZipDir = $downloadTemp . 'wordpress';

    unzip_file($wpTemp . 'wp.zip', $downloadTemp);

    for ($i = 0; $i < $pluginLength; $i++) {
        $filename = $plugins[$i] . '.zip';
        unzip_file($wpPlug . $filename, $pluginTarget);
    }

    zip_folder($downloadTemp . 'wordpress.zip', $toZipDir);
    delete_dir($toZipDir);


} else {
    $pluginTarget = 'download-temp/typo3_src-' . $typo3VersionStamp . '/typo3/sysext/';
    $toZipDir = $downloadTemp . 'typo3_src-' . $typo3VersionStamp;

    unzip_file($typo3Temp . 'typo3.zip', $downloadTemp);

    for ($i = 0; $i < $pluginLength; $i++) {
        $filename = $plugins[$i] . '.zip';
        unzip_file($typo3Plug . $filename, $pluginTarget);
    }

    zip_folder($downloadTemp . 'typo3.zip', $toZipDir);
    delete_dir($toZipDir);
}

?>