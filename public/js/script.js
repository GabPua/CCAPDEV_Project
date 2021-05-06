function isNotEmpty(str) {
    if (str == null || str.trim() === '') {
        return 'Field cannot be left blank';
    } else {
        return '';
    }
}

function isValidUsername(name) {
    if (name == null || name === '') {
        return 'Username cannot be left blank';
    } else {
        return '';
    }
}

function isValidPassword(pw) {
    const re = /\d/g;

    if (pw == null || pw.trim() === '') {
        return 'Password cannot be left blank';
    } else if (!re.test(pw)) {
        return 'Password must contain at least 1 number';
    } else {
        return '';
    }
}

function isValidEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    
    if (re.test(String(email).toLowerCase())) {
        return '';
    } else {
        return 'Invalid email address';
    }
}

function isValidImageFormat(ext) {
    return ext === 'gif' || ext === 'png' || ext === 'jpeg' || ext === 'jpg';
}

function isValidNum(t1, t2) {
    return (parseInt(t1) + parseInt(t2) === 0)? 'Must be greater than 0' : '';
}

function updateInputFields(isValid, field, help, icon, helpText) {
    help?.html(helpText);

    if (isValid) {
        field.removeClass('is-danger');
        field.addClass('is-success');
        
        help?.removeClass('is-danger');
        help?.addClass('is-success');

        icon?.removeClass('fas fa-exclamation-triangle');
        icon?.addClass('fas fa-check');
    } else {
        field.removeClass('is-success');
        field.addClass('is-danger');

        help?.removeClass('is-success');
        help?.addClass('is-danger');

        icon?.removeClass('fas fa-check');
        icon?.addClass('fas fa-exclamation-triangle');
    }
}

$(document).ready(function () {
    const form = $('.search-form');

    if (form.length > 0) {
        const searchbar = form.children().children('input[type="text"]');

        form.submit((event) => {
            if (searchbar.val() == null || searchbar.val() === '') {
                event.preventDefault();
            }
        });
    }

    // Check for click events on the navbar burger icon
    $(".navbar-burger").click(function() {

        // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
        $(".navbar-burger").toggleClass("is-active");
        $(".navbar-menu").toggleClass("is-active");
    });
});