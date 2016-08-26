var count = 0;
var cursor;
$(function () {
    addListenersForKeyPress();
});

function addListenersForKeyPress() {
    outputCommandLine();
    $('#textarea' + count).focus();

    $('#cmd' + count).click(function () {
        $('#textarea' + count).focus();
        cursor = window.setInterval(function () {
            if ($('#cursor').css('visibility') === 'visible') {
                $('#cursor').css({
                    visibility: 'hidden'
                });
            } else {
                $('#cursor').css({
                    visibility: 'visible'
                });
            }
        }, 500);
    });

    $('#textarea' + count).keydown(function (e) {
        var code = (e.keyCode ? e.keyCode : e.which);
        if(code == 13) { 
            if($('#textarea' + count).val() == 'Help') {
                outputHelp();
            } else {
                $('#command-window').append("<li style=\"font-family: 'Inconsolata', monospace;\"><p style=\"max-height: 18px;\">Invalid command: \"" + $('#textarea' + count).val() + "\"</p></li>");
            }

            count++;
            $("#cursor").remove();
            addListenersForKeyPress();
            e.preventDefault();
            return false;
        }
    });

    $('#textarea' + count).keyup(function (e) {
        var code = (e.keyCode ? e.keyCode : e.which);
        if(code != 13) { 
            $('#cmd' + count + ' span').text($('#textarea' + count).val());
            return true;
        }
    });

    $('#textarea' + count).blur(function () {
        clearInterval(cursor);
        $('#cursor').css({
            visibility: 'visible'
        });
    });
}

function outputCommandLine() {
    $("#command-window").append("<li><text class=\"cmd-prompt\" style=\"font-family: 'Inconsolata', monospace;\">Matthew-Bowen-Server:~ user</text><div style=\"display: inline-block;\" \
        id=\"cmd" + count + "\"><span style=\"max-height: 18px; float: left; padding-left: 3px; white-space: normal; font-family: 'Inconsolata', monospace;\"></span><div id=\"cursor\"></div>\
        </div><textarea " + "id=\"textarea" + count + "\"style=\" width: 0; height: 0; opacity: 0;\"></textarea></li>");
}

function outputHelp() {
    $("#command-window").append("<ul style=\"list-style-type: none; font-family: 'Inconsolata', monospace;\"><li>ls</li><li>cd</li><li>Chess</li></ul>")
}

