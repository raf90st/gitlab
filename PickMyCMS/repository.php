<?php

//Folder-Prefix for faster lookup if folders exist
$folderPrefix = '/html' . '/';

//folder names in root directory
$wpTempFolder = 'wp-temp';

$typo3TempFolder = 'typo3-temp';

//urls to get latest cms versions
$wpVersion = 'https://wordpress.org/latest.zip';
$wpVersionChecker = 'https://api.wordpress.org/core/version-check/1.7/';
$wpVersionStamp = curl_data($wpVersionChecker, 'version', 'wp');

$typo3Version = 'https://get.typo3.org/v1/api/major/10/release/latest';
$typo3VersionStamp = curl_data($typo3Version, 'version', 'typo3');
$latestTypo3Version = 'https://get.typo3.org/' . $typo3VersionStamp . '/zip';


/**
 * Initiates Curl connection to url
 * converts curl string to json object
 * returns string
 *
 * @param string url to run curl connection on
 * 
 * @author Rafael Staiger
 * @return string the string of specified url
 */ 
function curl_data($url, $query, $cms) {
    $ch = curl_init();

    if ($ch === false) {
        die('Ein Curl Fehler ist aufgetreten');
    }

    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_HEADER, 0);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $result = curl_exec($ch);

    if ($result === false) {
        echo 'Curl Fehler Nr: ' . curl_errno($ch) . '<br>';
        die (curl_error($ch)); 
    }

    curl_close($ch);

    $curlData = json_decode($result, true);

    if ($cms === 'wp') {
        return $curlData['offers'][0][$query];
    } else {
        return $curlData[$query];
    }

}
 
/**
 * Download latest CMS Version to temp directory
 *
 * @param string tmpFolder where zip file to be stored
 * @param string zipName how zip file should ne named
 * @param string version formatted version string of cms
 * 
 * @author Rafael Staiger
 * @return void
 */ 
function get_cms_update($tmpFolder, $zipName, $version) {
    //specify file name and directory path
    $filePath = $tmpFolder . '/' . $zipName;

    //download latest CMS source files in temp directory
    file_put_contents($filePath, file_get_contents($version));
}

function save_versionstamp($tmpFolder, $txtName, $versionStamp) {

    $filePath = $tmpFolder . '/' . $txtName;
    file_put_contents($filePath, $versionStamp);
}

function compare_version($folderVersion, $remoteVersion) {
    if (strcasecmp($folderVersion, $remoteVersion) !== 0) {
        return true;
    } else {
        return false;
    }
}

//Repository main
//check if folders exist otherwise create them
if (!is_dir($folderPrefix . $wpTempFolder) || count(scandir($folderPrefix . $wpTempFolder)) <= 2) {
    mkdir($wpTempFolder);
    get_cms_update($wpTempFolder, 'wp.zip', $wpVersion);
    save_versionstamp($wpTempFolder, 'wpversion.txt', $wpVersionStamp);
    echo 'Wordpress Installation heruntergeladen<br>';
} else {
    if (compare_version(file_get_contents($folderPrefix . $wpTempFolder . '/wpversion.txt'), $wpVersionStamp) ||
    !file_exists($folderPrefix . $wpTempFolder . '/wpversion.txt')) {
        get_cms_update($wpTempFolder, 'wp.zip', $wpVersion);
        save_versionstamp($wpTempFolder, 'wpversion.txt', $wpVersionStamp);
        echo 'Wordpress Version wurde aktualisiert<br>';
    }
}

if (!is_dir($folderPrefix . $typo3TempFolder) || count(scandir($folderPrefix . $typo3TempFolder)) <= 2) {
    mkdir($typo3TempFolder);
    get_cms_update($typo3TempFolder, 'typo3.zip', $latestTypo3Version);
    save_versionstamp($typo3TempFolder, 'typo3version.txt', $typo3VersionStamp);
    echo 'Typo3 Installation heruntergeladen<br>';
} else {
    if (compare_version(file_get_contents($folderPrefix . $typo3TempFolder . '/typo3version.txt'), $typo3VersionStamp) ||
    !file_exists($folderPrefix . $typo3TempFolder . '/typo3version.txt')) {
        get_cms_update($typo3TempFolder, 'typo3.zip', $latestTypo3Version);
        save_versionstamp($typo3TempFolder, 'typo3version.txt', $typo3VersionStamp);
        echo 'Typo3 Version wurde aktualisiert!<br>';
    }
}
    
?>