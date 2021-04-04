$(document).ready(function () {
    const dp = $('.profile-picture');
    const sub = $("input[type='file']");

    const cancel = $('#cancel-edit-profile');
    const submit = $('#submit-edit-profile');

    const email = $('input[type="email"]');
    const pw = $('input[type="password"]');
    const prof = $('#profession');
    const place = $('#workplace');
    const desc = $('textarea');

    const email_help = $('#email-help');
    const email_help_icon = $('#email-help-icon');

    const pw_help = $('#pw-help');
    const pw_help_icon = $('#pw-help-icon');

    let def_email = email.val();
    let def_pw = pw.val();
    let def_prof = prof.val();
    let def_place = place.val();
    let def_desc = desc.val();

    // Validators
    email.on('focusout', function() {
        let help_text = isValidEmail(email.val());

        if (help_text === '') {
            updateInputFields(true, email, email_help, email_help_icon, 'Valid email address');
        } else {
            updateInputFields(false, email, email_help, email_help_icon, help_text);
        }
    });

    pw.on('focusout', function() {
        let help_text = isValidPassword(pw.val());

        if (help_text === '') {
            updateInputFields(true, pw, pw_help, pw_help_icon, 'Valid password');
        } else {
            updateInputFields(false, pw, pw_help, pw_help_icon, help_text);
        }
    });

    // Profile picture updating
    sub.change(function() {
        let input = this;
        let url = $(this).val();
        let ext = url.substring(url.lastIndexOf('.') + 1).toLowerCase();

        if (input.files && input.files[0] && (ext === 'gif' || ext === 'png' || ext === 'jpeg' || ext === 'jpg')) {
            let reader = new FileReader();
    
            reader.onload = function (e) {
                dp.attr('src', e.target.result);
                dp.height(dp.width());
            }

           reader.readAsDataURL(input.files[0]);
        }
    });

    // Button effects
    submit.on('click', function(event) {
        event.preventDefault();

        email.trigger('focusout');
        pw.trigger('focusout');

        let valid = email.hasClass('is-success') && pw.hasClass('is-success');

        if (valid) {
            $('#profile-form').submit();
        }
    })

    cancel.on('click', function(event) {
        event.preventDefault();

        // refresh data
        submit.prop('disabled', true);
        email.val(def_email);
        pw.val(def_pw);
        prof.val(def_prof);
        place.val(def_place);
        desc.val(def_desc);

        // remove validations
        email.removeClass('is-danger is-success');
        email_help.html('')
        email_help_icon.removeClass();

        pw.removeClass('is-danger is-success');
        pw_help.html('');
        pw_help_icon.removeClass();
    });

    // Changing inputs enables update profile button
    email.on('keydown', function() {
        submit.prop('disabled', false);
    });

    pw.on('keydown', function() {
        submit.prop('disabled', false);
    });
    
    prof.on('keydown', function() {
        submit.prop('disabled', false);
    });
    
    place.on('keydown', function() {
        submit.prop('disabled', false);
    });

    desc.on('keydown', function() {
        submit.prop('disabled', false);
    });
})
