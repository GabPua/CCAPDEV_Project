$(document).ready(function () {
    var dp = $('.profile-picture');
    var sub = $("input[type='file']");
    
    var cancel = $('#cancel-edit-profile');
    var submit = $('#submit-edit-profile');

    var email = $('input[type="email"]');
    var pw = $('input[type="password"]');
    var prof = $('#profession');
    var place = $('#workplace');
    var desc = $('textarea');

    var email_help = $('#email-help');
    var email_help_icon = $('#email-help-icon');

    var pw_help = $('#pw-help');
    var pw_help_icon = $('#pw-help-icon');

    // Validators
    email.on('focusout', function(event) {
        help_text = isValidEmail(email.val());

        if (help_text === '') {
            updateInputFields(true, email, email_help, email_help_icon, 'Valid email address');
        } else {
            updateInputFields(false, email, email_help, email_help_icon, help_text);
        }
    });

    pw.on('focusout', function(event) {
        help_text = isValidPassword(pw.val());

        if (help_text === '') {
            updateInputFields(true, pw, pw_help, pw_help_icon, 'Valid password');
        } else {
            updateInputFields(false, pw, pw_help, pw_help_icon, help_text);
        }
    });

    // Profile picture updating
    sub.change(function() {
        var input = this;
        var url = $(this).val();
        var ext = url.substring(url.lastIndexOf('.') + 1).toLowerCase();

        if (input.files && input.files[0] && (ext == "gif" || ext == "png" || ext == "jpeg" || ext == "jpg")) {
            var reader = new FileReader();
    
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

        valid = email.hasClass('is-success') && pw.hasClass('is-success');

        if (valid) {
            $('#profile-form').submit();
        }
    })

    cancel.on('click', function() {
        // refresh data
        submit.prop('disabled', true);
        email.val('jared_sy@dlsu.edu.ph');
        pw.val('Hello1234');
        prof.val('Chef');
        place.val('Pepper Lunch');
        desc.val("A househusband who loves cooking for his family.");

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
