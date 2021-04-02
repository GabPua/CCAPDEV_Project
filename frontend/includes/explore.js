$(document).ready(function () {
    const tab = $('.tabs li');
    const tabItems = $('.tab-content section');

    tab.on('click', function () {
        let value = $(this).data('tab');

        tab.removeClass('is-active');
        $(this).addClass('is-active');

        tabItems.removeClass('is-active');

        tabItem = $('section[data-content=\'' + value + '\']');
        tabItem.addClass('is-active');
    });
});