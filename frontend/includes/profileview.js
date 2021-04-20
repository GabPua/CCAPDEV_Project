$(document).ready(function () {
    let button = $('.button');
    let count = $('#follower-count');

    button.on('click', function () {
        button.toggleClass('is-active');
        if (button.hasClass('is-active')) {
            button.html('Following');
            count.html(parseInt(count.html()) + 1)
        } else {
            button.html('Follow');
            count.html(parseInt(count.html()) - 1)
        }
    });
});