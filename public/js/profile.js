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
        let mail = email.val().toLowerCase();

        // check if already taken
        $.get('/getCheckEmail', {email: mail}, function (result) {
            let help_text = '';

            email.addClass('is-updated');

            if (mail === '') {
                help_text = 'Cannot be left blank';
            } else if (result === 'good') {
                help_text = '';
                email.removeClass('is-updated');
            } else if (result.email === mail) {
                help_text = 'Email taken';
            }

            if (help_text === '') {
                updateInputFields(true, email, email_help, email_help_icon, 'Valid email address');
            } else {
                updateInputFields(false, email, email_help, email_help_icon, help_text);
            }

            if (email.hasClass('is-updated') || pw.hasClass('is-updated') || prof.hasClass('is-updated') ||
                place.hasClass('is-updated') || desc.hasClass('is-updated')) {
                submit.prop('disabled', false);
            } else {
                submit.prop('disabled', true);
            }
        });
    });

    pw.on('focusout', function() {
        let pass = pw.val();

        $.get('/getCheckPassword', {password: pass}, function (result) {
            let help_text = isValidPassword(pass);
            
            pw.addClass('is-updated');

            if (result === 'good') {
                help_text = '';
                pw.removeClass('is-updated');
            }

            if (help_text === '') {
                updateInputFields(true, pw, pw_help, pw_help_icon, 'Valid password');
            } else {
                updateInputFields(false, pw, pw_help, pw_help_icon, help_text);
            }

            if (email.hasClass('is-updated') || pw.hasClass('is-updated') || prof.hasClass('is-updated') ||
                place.hasClass('is-updated') || desc.hasClass('is-updated')) {
                submit.prop('disabled', false);
            } else {
                submit.prop('disabled', true);
            }
        });
    });

    prof.on('focusout', function () {
        let profession = prof.val();

        $.get('/getCheckProf', {profession: profession}, function (result) {
            prof.addClass('is-updated');

            if (result === 'good') {
                prof.removeClass('is-updated');
            }

            if (email.hasClass('is-updated') || pw.hasClass('is-updated') || prof.hasClass('is-updated') ||
                place.hasClass('is-updated') || desc.hasClass('is-updated')) {
                submit.prop('disabled', false);
            } else {
                submit.prop('disabled', true);
            }
        });
    });

    place.on('focusout', function () {
        let workplace = place.val();

        $.get('/getCheckPlace', {place: workplace}, function (result) {
            place.addClass('is-updated');

            if (result === 'good') {
                place.removeClass('is-updated');
            }

            if (email.hasClass('is-updated') || pw.hasClass('is-updated') || prof.hasClass('is-updated') ||
                place.hasClass('is-updated') || desc.hasClass('is-updated')) {
                submit.prop('disabled', false);
            } else {
                submit.prop('disabled', true);
            }
        });
    });

    desc.on('focusout', function () {
        let descript = desc.val();

        $.get('/getCheckDesc', {desc: descript}, function (result) {
            desc.addClass('is-updated');

            if (result === 'good') {
                desc.removeClass('is-updated');
            }

            if (email.hasClass('is-updated') || pw.hasClass('is-updated') || prof.hasClass('is-updated') ||
                place.hasClass('is-updated') || desc.hasClass('is-updated')) {
                submit.prop('disabled', false);
            } else {
                submit.prop('disabled', true);
            }
        });
    });

    // Profile picture updating
    sub.change(function() {
        let input = this;
        let url = $(this).val();
        let ext = url.substring(url.lastIndexOf('.') + 1).toLowerCase();

        if (input.files && input.files[0] && isValidImageFormat(ext)) {
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
        email.removeClass('is-danger is-success is-updated');
        email_help.html('')
        email_help_icon.removeClass();

        pw.removeClass('is-danger is-success is-updated');
        pw_help.html('');
        pw_help_icon.removeClass();

        prof.removeClass('is-updated');
        place.removeClass('is-updated');
        desc.removeClass('is-updated');
    });
})
