$(document).ready(function () {
    const tab = $('.tabs li');
    const pic = $('.food-picture');

    tab.on('click', function () {
        let val = $(this).children().html();

        tab.removeClass('is-active');
        $(this).addClass('is-active');

        let url = pic.attr('src');
        let newUrl = url.substr(0, url.length - 5) + val + '.jpg';

        pic.attr('src', newUrl);
    });
});