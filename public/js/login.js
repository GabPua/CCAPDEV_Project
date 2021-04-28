$(document).ready(() => {
    const name = $("input[type='text']");
    const name_help = $('#username-help');

    const pw = $("input[type='password']");
    const pw_help = $('#password-help');

    // check first before submitting
    $('#submit-login').click((event) => {
        event.preventDefault();
    
        name.trigger('focusout');
        pw.trigger('focusout');

       if (name.hasClass('is-success') && pw.hasClass('is-success')) {
           $('form').submit();
       }
    });

    name.focusout(() => {
        let help_text = isValidUsername(name.val());

        if (help_text === '') {
            updateInputFields(true, name, name_help, null, help_text);
        } else {
            updateInputFields(false, name, name_help, null, help_text);
        }
    });

    pw.focusout(() => {
        let help_text = isValidPassword(pw.val());

        if (help_text === '') {
            updateInputFields(true, pw, pw_help, null, help_text);
        } else {
            updateInputFields(false, pw, pw_help, null, help_text);
        }
    });
});