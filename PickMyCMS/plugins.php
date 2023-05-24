<?php

include 'repository.php';

//plugin folders
$wpPluginsFolder = 'wp-plugins';
$typo3PluginsFolder = 'typo3-plugins';

//json urls Wordpress Plugins
$wpPlugins[] = 'https://api.wordpress.org/plugins/info/1.0/contact-form-7.json';
$wpPlugins[] = 'https://api.wordpress.org/plugins/info/1.0/drag-and-drop-multiple-file-upload-contact-form-7.json';
$wpPlugins[] = 'https://api.wordpress.org/plugins/info/1.0/advanced-custom-fields.json';
$wpPlugins[] = 'https://api.wordpress.org/plugins/info/1.0/custom-post-type-ui.json';
$wpPlugins[] = 'https://api.wordpress.org/plugins/info/1.0/editor-blocks.json';
$wpPlugins[] = 'https://api.wordpress.org/plugins/info/1.0/w3-total-cache.json';
$wpPlugins[] = 'https://api.wordpress.org/plugins/info/1.0/duplicator.json';
$wpPlugins[] = 'https://api.wordpress.org/plugins/info/1.0/duplicate-page.json';
$wpPlugins[] = 'https://api.wordpress.org/plugins/info/1.0/elementor.json';
$wpPlugins[] = 'https://api.wordpress.org/plugins/info/1.0/google-analytics-dashboard-for-wp.json';

//Wordpress plugins latest version list
$wpPluginsInfo = get_plugin_info($wpPlugins, 'wp');

//json urls Typo3 Plugins
$typo3Plugins[] = 'https://repo.packagist.org/p/in2code/powermail.json';
$typo3Plugins[] = 'https://repo.packagist.org/p/dmitryd/typo3-realurl.json';
$typo3Plugins[] = 'https://repo.packagist.org/p/georgringer/news.json';
$typo3Plugins[] = 'https://repo.packagist.org/p/dirkpersky/typo3-dp_cookieconsent.json';
$typo3Plugins[] = 'https://repo.packagist.org/p/friendsoftypo3/extension-builder.json';
$typo3Plugins[] = 'https://repo.packagist.org/p/derhansen/sf_event_mgt.json';

//Typo 3 plugins latest version list
$typo3PluginsInfo = get_plugin_info($typo3Plugins, 'typo3');


function get_plugin_info($array, $cms) {
    $arrayLength = count($array);

    //create connection array
    $multiCurl = [];

    //create plugin array
    $pluginArray = [];

    //create mutli curl handler
    $mh = curl_multi_init();

    //add curl connections to array
    for ($i = 0; $i < $arrayLength; $i++) {
        $multiCurl[$i] = curl_init();

        if($multiCurl[$i] === false) {
            die('Ein Curl Fehler ist aufgetreten');
        }

        curl_setopt($multiCurl[$i], CURLOPT_URL,$array[$i]);
        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($multiCurl[$i], CURLOPT_RETURNTRANSFER,true);
        curl_multi_add_handle($mh, $multiCurl[$i]);
    }

    //execute curl connections as long as index is set
    $index=null;
    do {
        curl_multi_exec($mh, $index);
    } while($index);

    for ($i = 0; $i < $arrayLength; $i++) {
        $results = curl_multi_getcontent($multiCurl[$i]);
        $curlArray = json_decode($results, true);

        $name = preg_replace("([^-a-zA-Z0-9^.()]+)", "", $curlArray['name']);
        $name = str_replace('/', '', $name);
        $name = trim(preg_replace('/\s+/', ' ', $name));

        if ($cms === 'wp') {
            $pluginArray[$i]['name'] = $name;
            $pluginArray[$i]['name_normalized'] = $curlArray['name'];
            $pluginArray[$i]['version'] = $curlArray['version'];
            $pluginArray[$i]['url'] = $curlArray['download_link'];
        } else {
            array_walk_recursive($curlArray, function ($value, $key) use (&$typo3RecursiveVersionsArray) {     
                if ($key === 'version') {
                    if (preg_match("([0-9]\.+)", $value) && (strpos($value, 'v') === false)) {
                        $typo3RecursiveVersionsArray[] = $value;
                    }
                }
            });

            $length = count($typo3RecursiveVersionsArray);
            $version = $typo3RecursiveVersionsArray[$length - 1];
            $results = get_recursive_data($curlArray, $version);

            $versionUrl = str_replace('.git','/archive/master.zip', $results['source']['url']);
            $name = str_replace('/', '', $results['name']);
            $name = trim(preg_replace('/\s+/', ' ', $name));
            $name = preg_replace("([^a-zA-Z0-9^.()]+)", "", $name);

            $pluginArray[$i]['name'] = $name;
            $pluginArray[$i]['name_normalized'] = $results['name'];
            $pluginArray[$i]['version'] = $version;
            $pluginArray[$i]['url'] = $versionUrl;
        }

        curl_close($multiCurl[$i]);
    }

    //close curl connections
    curl_multi_close($mh);

    return $pluginArray;
}

function get_plugin_update($pluginsFolder, $zipName, $url) {
    //specify file name and directory path
    $filePath = $pluginsFolder . '/' . $zipName . '.zip';

    //download latest plugin source files in directory
    file_put_contents($filePath, file_get_contents($url));
}


function update_plugin_repository($array, $pluginsFolder) {
    //arraylength how many urls there are
    $arrayLength = count($array);

    //call get_plugin_update() in for loop
    for ($i = 0; $i < $arrayLength; $i++) {
        $name = $array[$i]['name'];
        $version = $array[$i]['version'];
        $url = $array[$i]['url'];
        get_plugin_update($pluginsFolder, $name, $url);
        save_versionstamp($pluginsFolder, $name . '.txt', $version);
    }
}

function get_recursive_data($array, $key) {
    foreach($array as $k => $value){ 
        if ($k == $key) {
            return $value;
        }

        if (is_array($value)) { 
            $find = get_recursive_data($value, $key);
            if ($find) {
                return $find;
            } 
        }
    }
    return null;
}

function compare_plugin_versions($array, $pluginsFolder) {
    $length = count($array);

    for ($i = 0; $i < $length; $i++) {
        $name = $array[$i]['name'];
        $version = $array[$i]['version'];
        $url = $array[$i]['url'];
        if (compare_version(file_get_contents($folderPrefix . $pluginsFolder . '/' . $name .'.txt'), $version) ||
        !file_exists($pluginsFolder . '/' . $name .'.txt')) {
            get_plugin_update($pluginsFolder, $name, $url);
            save_versionstamp($pluginsFolder, $name . '.txt', $version);
            echo 'Plugin: ' . $name . ' updated <br>';
        }
    }
}

//plugins Main
if (!is_dir($folderPrefix . $wpPluginsFolder) || count(scandir($folderPrefix . $wpPluginsFolder)) <=2 ) {
    mkdir($wpPluginsFolder);
    update_plugin_repository($wpPluginsInfo, $wpPluginsFolder);
    echo 'Wordpress Plugins Repository erstellt! <br>';
} else {
    compare_plugin_versions($wpPluginsInfo, $wpPluginsFolder);
}

if (!is_dir($folderPrefix . $typo3PluginsFolder) || count(scandir($folderPrefix . $typo3PluginsFolder)) <=2) {
    mkdir($typo3PluginsFolder);
    update_plugin_repository($typo3PluginsInfo, $typo3PluginsFolder);
    echo 'Typo 3 Plugins Repository erstellt! <br>';
} else {
    compare_plugin_versions($typo3PluginsInfo, $typo3PluginsFolder);
}

?>