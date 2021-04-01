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

    console.log(email)

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

    cancel.on('click', function() {
        submit.prop('disabled', true);
        email.val('jared_sy@dlsu.edu.ph');
        pw.val('Hello1234');
        prof.val('Chef');
        place.val('Pepper Lunch');
        desc.val("A househusband who loves cooking for his family.");
    });

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
