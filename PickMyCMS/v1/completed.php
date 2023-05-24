<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN">
<?php include 'plugins.php';?>
<html>
    <style>
        .your-plugins {
            opacity: 0;
        }

        .visible {
            opacity: 1;
            transition: all .3s;
        }

        .hidden {
            visibility: hidden;
        }
    </style>
    <script>
        var radioData;
        var checkboxData = [];
        var typo3v = $('.typo3-version').attr('version');

        $('.choose-cms input').on('click', function() {
            if ($(this).attr('value') === 'wp') {
                $('input:checkbox').prop('checked', false);
                radioData;
                checkboxData = [];
                radioData = 'wp';
                $('.typo3-plugins').hide(0);
                $('.your-plugins').addClass('visible');
                $('.wp-plugins').show(500);
            } else {
                $('input:checkbox').prop('checked', false);
                radioData;
                checkboxData = [];
                radioData = 'typo3';
                $('.wp-plugins').hide(0);
                $('.typo3-plugins').show(500);
            }
        });

        $('.choose-plugins input[type="checkbox"]').click(function() {
            checkboxData = [];
                $('.choose-plugins input[type="checkbox"]:checked').each(function() {
                checkboxData.push($(this).val());
                //alert('clicked!');
            });
        });

        $("#submit").click(function() {
            if (!radioData) {
                return;
            }
            $('body').css('opacity','.5');
            $('body').css('cursor','progress');
            var jcheck = JSON.stringify(checkboxData);
            var downloadLink;
            $.ajax({
                type: "POST",
                url: "retrieve.php",
                data: {data: jcheck, radio: radioData, typo3: typo3v},
                success: function (result) {
                    $('body').css('opacity','1');
                    $('body').css('cursor','default');
                    var origin = window.location.origin;
                    if (radioData === 'wp') {
                        downloadLink = '<a class="cms-download" href="' + origin + '/download-temp/wordpress.zip" download><button>Download CMS/Plugins</button></a>';
                    } else {
                        downloadLink = '<a class="cms-download" href="' + origin + '/download-temp/typo3.zip" download><button>Download CMS/Plugins</button></a>';
                    }
                    $('#submit').remove();
                    $('.centered').append(downloadLink);
                },
                error: function (xhr, ajaxOptions, thrownError) {alert("ERROR:" + xhr.responseText+" - "+thrownError);}
            });     
        });
    </script>
    <h1>Wilkommen bei Pick My CMS</h1>
	<div class="loader">
		<div class="loader-message">
			<p>Plugin und CMS Dateien wurden auf den aktuellsten Stand gebracht :)</p>
		</div>
	</div>
    <br>
    <div class="choose-cms" style="text-align:left;">
        <h2>Bitte w&auml;hlen Sie das gew&uuml;nschte CMS aus:</h2>
        <input type="radio" id="male" name="gender" value="wp">
        <label for="male">Wordpress</label><br>
        <input type="radio" id="female" name="gender" value="typo3">
        <label for="female">Typo3</label><br>
    </div>
    <br>
    <h2 class="your-plugins">Bitte w&auml;hlen Sie die gew&uuml;nschten Plugins aus:</h2>
    <br>
    <div class="choose-plugins wp-plugins" style="text-align:left;display:none;">
        <?php
            $length = count($wpPluginsInfo);
            for ($i = 0; $i < $length; $i++) {
                $name = $wpPluginsInfo[$i]['name_normalized'];
                $pluginName = $wpPluginsInfo[$i]['name'];
                echo '<input type="checkbox" id=' . '"' . $name . '"' . 'name="' . $name . '"' . 'value="' . $pluginName . '">';
                echo '<label for="' . $name . '">' . $name . '</label><br>';
            }
        ?>
    </div>
    <br>
    <div class="choose-plugins typo3-plugins" style="text-align:left;display:none;">
        <?php
            $length = count($typo3PluginsInfo);
            for ($i = 0; $i < $length; $i++) {
                $name = $typo3PluginsInfo[$i]['name_normalized'];
                $pluginName = $typo3PluginsInfo[$i]['name'];
                echo '<input type="checkbox" id="' . $name . '"' . 'name="' . $name . '"' . 'value="' . $pluginName . '">';
                echo '<label for="' . $name . '">' . $name . '</label><br>';
            }
        ?>
    </div>
    <button type="button" id="submit">CMS/Plugins bereitstellen</button> 
    <?php echo '<p class="hidden typo3-version" version="' . $typo3VersionStamp . '"></p>';?>
</html>