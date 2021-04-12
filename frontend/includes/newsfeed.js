$(document).ready(function() {
    $('.fa-thumbs-up').onclick(function() {
        let count = $(this).siblings('.display-count');
        count.html(parseInt(count.html()) + 1);

        //more cases here
    });

    $('.fa-thumbs-down').onclick(function() {
        let count = $(this).siblings('.display-count');
        count.html(parseInt(count.html()) - 1);

        //more cases here
    });
});