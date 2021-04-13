$(document).ready(function() {
    $('.upvote').on('click', function () {
        let count = $(this).siblings('.display-count');

        if ($(this).hasClass('is-active')) {
            $(this).removeClass('is-active');
            let num_votes = Number(count.html());
            count.html(num_votes - 1);
        } else {
            let num_votes = Number(count.html());
            let downvote = $(this).siblings('.downvote');

            if (downvote.hasClass('is-active')) {
                downvote.removeClass('is-active');
                num_votes += 1;
            }
            $(this).addClass('is-active');
            count.html(num_votes + 1);
        }
    });

    $('.downvote').on('click', function () {
        let count = $(this).siblings('.display-count');

        if ($(this).hasClass('is-active')) {
            $(this).removeClass('is-active');
            let num_votes = Number(count.html());
            count.html(num_votes + 1);
        } else {
            let num_votes = Number(count.html());
            let upvote = $(this).siblings('.upvote');

            if (upvote.hasClass('is-active')) {
                upvote.removeClass('is-active');
                num_votes -= 1;
            }
            $(this).addClass('is-active');
            count.html(num_votes - 1);
        }
    });
});