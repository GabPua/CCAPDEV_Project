$(document).ready(function () {
    const name = $("input[type='text']");
    const name_help = $('#username-help');

    const pw = $("input[type='password']");
    const pw_help = $('#password-help');

    $('#cancel-login').on('click', function(event) {
        event.preventDefault();
        window.location.replace('index.html');
    });

    $('#submit-login').on('click', function(event) {
        event.preventDefault();
    
        name.trigger('focusout');
        pw.trigger('focusout');

        let valid = name.hasClass('is-success') && pw.hasClass('is-success');

        if (valid) {
            let user = name.val();
            let url = './users/' + user + '.html';

            window.location.replace(url + '?user=' + user);
        }
    });

    name.on('focusout', function() {
        let help_text = isValidUsername(name.val());

        if (help_text === '') {
            updateInputFields(true, name, name_help, null, help_text);
        } else {
            updateInputFields(false, name, name_help, null, help_text);
        }
    });

    name.on('keydown', function() {
        // name_help.html('');
        // name_help.removeClass('is-danger is-success');
        // name.removeClass('is-danger is-success');
    });

    pw.on('focusout', function() {
        let help_text = isValidPassword(pw.val());

        if (help_text === '') {
            updateInputFields(true, pw, pw_help, null, help_text);
        } else {
            updateInputFields(false, pw, pw_help, null, help_text);
        }
    });
});