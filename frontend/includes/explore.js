$(document).ready(function () {
    const tab = $('.tabs li');
    const pic = $('.food-picture');

    tab.on('click', function () {
        let val = $(this).children().html();

        tab.removeClass('is-active');
        $(this).addClass('is-active');

        if (val == 1) {
            pic.attr('src', './includes/resources/foodelicious_chicken_adobo.jpg');
        } else {
            pic.attr('src', './includes/resources/foodelicious_chicken_adobo' + val + '.jpg');
        }
    });
});