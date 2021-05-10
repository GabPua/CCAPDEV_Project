$(document).ready(function () {
    $(window).resize(function() {
        $('.tabs.profile-tab').width($('#profile').outerWidth());
    });

    const follow = $('#follow-button');

    // if there is a follow button
    if (follow.length === 1) {
        const user_id = $('#name').val();
        const count = $('#follower-count');

        getFollowId(user_id, (isFollowing) => {
            follow.html(isFollowing? 'Unfollow' : 'Follow');
        });

        follow.click(async function (event) {
            event.preventDefault();

            getFollowId(user_id, (follow_id) => {
                if (follow_id) {
                    $.post('/follow', {follow_id: follow_id}, () => {
                        follow.html('Follow');
                        count.html(parseInt(count.html()) - 1);
                    });
                } else {
                    $.post('/follow', { user_id: user_id }, () => {
                        follow.html('Unfollow')
                        count.html(parseInt(count.html()) + 1);
                    });
                }
            });
        });

        return;
    }

    const search = $('.search');
    const data = $('.data');

    search.keyup(() => {
        const val = $.trim(search.val()).toUpperCase();

        if (val === '') {
            data.show();
        } else {
            data.hide();
            data.filter(function() {
                return -1 !== $(this).find('p').html().toUpperCase().indexOf(val);
            }).show();
        }
    });

    const dp = $('.profile-picture');
    const sub = $('input[type="file"]');

    const cancel = $('#cancel-edit-profile');
    const submit = $('#submit-edit-profile');

    const email = $('input[type="email"]');
    const prof = $('#profession');
    const place = $('#workplace');
    const desc = $('textarea');

    const email_help = $('#email-help');
    const email_help_icon = $('#email-help-icon');

    let def_email = email.val();
    let def_prof = prof.val();
    let def_place = place.val();
    let def_desc = desc.val();

    function updateSubmitButton() {
        if (email.hasClass('is-updated') || prof.hasClass('is-updated') ||
            place.hasClass('is-updated') || desc.hasClass('is-updated')) {
            submit.prop('disabled', false);
        } else {
            submit.prop('disabled', true);
        }
    }

    // Validators
    email.on('focusout', function() {
        let mail = email.val().toLowerCase();

        // check if already taken
        $.get('/getCheckEmail', {email: mail}, function (result) {
            let help_text = '';

            email.addClass('is-updated');

            if (mail === '') {
                help_text = 'Cannot be left blank';
            } else if (result.email === mail) {
                help_text = 'Email taken';
            }

            if (help_text === '') {
                updateInputFields(true, email, email_help, email_help_icon, 'Valid email address');
            } else {
                updateInputFields(false, email, email_help, email_help_icon, help_text);
            }

            if (result === 'good') {
                email.removeClass('is-updated');
                email_help.html('');
                email_help.removeClass('is-danger is-success');
                email_help_icon.removeClass('fas fa-exclamation-triangle fa-check');
            }

            updateSubmitButton();
        });
    });

    prof.focusout(function () {
        let profession = prof.val();

        $.get('/getCheckProf', {profession: profession}, function (result) {
            prof.addClass('is-updated');

            if (result === 'good') {
                prof.removeClass('is-updated');
            }

            updateSubmitButton();
        });
    });

    place.focusout(function () {
        let workplace = place.val();

        $.get('/getCheckPlace', {place: workplace}, function (result) {
            place.addClass('is-updated');

            if (result === 'good') {
                place.removeClass('is-updated');
            }

            updateSubmitButton();
        });
    });

    desc.focusout(function () {
        let descript = desc.val();

        $.get('/getCheckDesc', {desc: descript}, function (result) {
            desc.addClass('is-updated');

            if (result === 'good') {
                desc.removeClass('is-updated');
            }

            updateSubmitButton();
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
            sub.addClass('is-updated');
            submit.prop('disabled', false);

            reader.readAsDataURL(input.files[0]);
        }
    });

    // Button effects
    submit.click(function(event) {
        event.preventDefault();

        if (!email.hasClass('is-danger')) {
            $('#profile-form').submit();
        }
    })

    cancel.click(function(event) {
        event.preventDefault();

        // refresh data
        submit.prop('disabled', true);
        email.val(def_email);
        prof.val(def_prof);
        place.val(def_place);
        desc.val(def_desc);

        // remove validations
        email.removeClass('is-danger is-success is-updated');
        email_help.html('')
        email_help_icon.removeClass();

        prof.removeClass('is-updated');
        place.removeClass('is-updated');
        desc.removeClass('is-updated');
    });

    // change password

    const old_pass = $('#old-pass');
    const new_pass = $('#new-pass');
    const confirm_pass = $('#confirm-pass');
    const pw_inputs = $('.modal .input');

    const old_pass_help = $('#old-pass-help');
    const new_pass_help = $('#new-pass-help');
    const confirm_pass_help = $('#confirm-pass-help');

    const pw_feedback = $('#pw-change-feedback');

    old_pass.focusout(() => {
        $.post('/verifyPassword', { password: old_pass.val() }, function (isMatch) {
            if (isMatch) {
                updateInputFields(true, old_pass, old_pass_help, null, '');
            } else {
                updateInputFields(false, old_pass, old_pass_help, null, 'Password is incorrect');
            }
        });
    });

    new_pass.focusout(() => {
        let help_text = isValidPassword(new_pass.val());

        updateInputFields(help_text === '', new_pass, new_pass_help, null, help_text);
    });

    confirm_pass.focusout(() => {
        if (new_pass.val() === confirm_pass.val()) {
            updateInputFields(true, confirm_pass, confirm_pass_help, null, 'Matches with new password')
        } else {
            updateInputFields(false, confirm_pass, confirm_pass_help, null, 'Does not match with new password');
        }
    });

    $('body').click(function (event) {
        if (event.target.classList.contains('modal-background')) {
            $('.modal').removeClass('is-active');
            $('html').removeClass('is-clipped');
        }     
    });

    $('#change-password-button').click(() => {
        $('#pw-modal').addClass('is-active');
        $('html').addClass('is-clipped');
    });

    $('#delete-profile').click(() => {
        $('#delete-modal').addClass('is-active');
        $('html').addClass('is-clipped');
    });

    $('#confirm-delete').click(() => {
        $.post('/deleteAccount', (isSuccess) => {
            if (isSuccess) {
                window.location.replace('/logout');
            } else {
                location.reload();
            }
        });
    })

    $('.close').click((event) => {
        event.preventDefault();
        $('.modal').removeClass('is-active');
        $('html').removeClass('is-clipped');

        pw_inputs.val('').removeClass('is-success is-danger');
        $('.modal .help').html('');
        pw_feedback.html('');
    });

    pw_inputs.keydown(event => {
       if (event.keyCode === 13) {
           event.preventDefault();
           $('.modal a.is-success').trigger('click');
       }
    });

    $('.modal a.is-success').click(() => {
        pw_inputs.trigger('focusout');

        if (pw_inputs.filter('.is-success').length === pw_inputs.length) {
            $.post('/updatePassword', {old_pass: old_pass.val(), new_pass: new_pass.val()}, (isSuccess) => {
                if (isSuccess) {
                    pw_feedback.html('Password has been changed').addClass('is-success');
                } else {
                    pw_feedback.html('An error has occurred. Password was not changed.').addClass('is-danger');
                }

                $('.modal').removeClass('is-active');
                $('html').removeClass('is-clipped');
            });
        }
    });
});

function getFollowId(user_id, callback) {
    let res;

    $.get('/follow/', {user_id: user_id}, (result) => {
        res = result;
    }).done(() => {
        callback(res);
    }).fail(() => {
        callback(false);
    });
}
