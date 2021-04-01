function isValidPassword(pw) {
    if (pw === '') {
        return 'Password cannot be left blank';
    } else if (pw == null) {    // TODO: Addition check stuff
        return 'Password must contain at least 1 number';
    } else {
        return '';
    }
}

function isValidUsername(name) {
    if (name === '') {
        return 'Cannot be left blank';
    } else if (name == null) { // TODO: Additional check stuff
        return 'Cannot be left blank';
    } else {
        return '';
    }
}

function isValidEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    
    if (re.test(String(email).toLowerCase())) {
        return '';
    } else {
        return 'Invalid email address';
    }
}

function updateInputFields(isValid, field, help, icon, helpText) {
    help.html(helpText);

    if (isValid) {
        field.removeClass('is-danger');
        field.addClass('is-success');
        
        help.removeClass('is-danger');
        help.addClass('is-success');

        if (icon !== null) {
            icon.removeClass('fas fa-exclamation-triangle');
            icon.addClass('fas fa-check');
        }
    } else {
        field.removeClass('is-success');
        field.addClass('is-danger');

        help.removeClass('is-success');
        help.addClass('is-danger');

        if (icon !== null) {
            icon.removeClass('fas fa-check');
            icon.addClass('fas fa-exclamation-triangle');
        }
    }
}