$(document).ready(function () {
    const carousel = $('.post-header .pagination a.pagination-link');
    const pic = $('#food-pic');

    const left = $('#left');
    const right = $('#right');

    const upvote = $('#upvote');
    const downvote = $('#downvote');
    const votes = $('#votes');

    carousel.on('click', function () {
        let val = $(this).attr('aria-label').slice(-1);

        carousel.removeClass('is-current');
        $(this).addClass('is-current');

        let url = pic.attr('style');
        let newUrl = url.substr(0, url.length - 7) + val + '.jpg")';

        pic.attr('style', newUrl);
    });

    left.on('click', function () {
        const curr = $('.post-header .pagination a.pagination-link.is-current');

        let val = Number(curr.attr('aria-label').slice(-1)) - 1;
        if (val < 1) val += 4;

        const next = $('.post-header .pagination').find('[aria-label=\'image ' + val + '\']');

        curr.removeClass('is-current');
        next.addClass('is-current');

        let url = pic.attr('style');
        let newUrl = url.substr(0, url.length - 7) + val + '.jpg")';

        pic.attr('style', newUrl);
    });

    right.on('click', function () {
        const curr = $('.post-header .pagination a.pagination-link.is-current');

        let val = Number(curr.attr('aria-label').slice(-1)) + 1;
        if (val > 4) val -= 4;
        
        const next = $('.post-header .pagination').find('[aria-label=\'image ' + val + '\']');

        curr.removeClass('is-current');
        next.addClass('is-current');

        let url = pic.attr('style');
        let newUrl = url.substr(0, url.length - 7) + val + '.jpg")';

        pic.attr('style', newUrl);
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