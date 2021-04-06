$(document).ready(function () {
    const carousel = $('.post-header .pagination a.pagination-link');
    const pic = $('.slider');

    const upvote = $('#upvote');
    const downvote = $('#downvote');
    const votes = $('#votes');

    carousel.on('click', function () {
        let val = $(this).attr('aria-label').slice(-1);

        carousel.removeClass('is-current');
        $(this).addClass('is-current');

        let url = pic.attr('background');
        let newUrl = url.substr(0, url.length - 5) + val + '.jpg';

        pic.attr('background', 'url("' + newUrl + ')');
    });

    upvote.on('click', function () {
        if (upvote[0].classList.contains('is-active')) {
            upvote.removeClass('is-active');
            let num_votes = Number(votes.html());
            votes.html(num_votes - 1);
        } else {
            let num_votes = Number(votes.html());

            if (downvote[0].classList.contains('is-active')) {
                downvote.removeClass('is-active');
                num_votes += 1;
            }
            upvote.addClass('is-active');
            votes.html(num_votes + 1);
        }
    });

    downvote.on('click', function () {
        if (downvote[0].classList.contains('is-active')) {
            downvote.removeClass('is-active');
            let num_votes = Number(votes.html());
            votes.html(num_votes + 1);
        } else {
            let num_votes = Number(votes.html());

            if (upvote[0].classList.contains('is-active')) {
                upvote.removeClass('is-active');
                num_votes -= 1;
            }
            downvote.addClass('is-active');
            votes.html(num_votes - 1);
        }
    });
});