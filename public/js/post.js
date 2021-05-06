$(document).ready(function () {
    const carousel = $('.post-header .pagination a.pagination-link');
    const pic = $('#food-pic');

    const left = $('#left');
    const right = $('#right');

    const upvote = $('.upvote');
    const downvote = $('.downvote');
    const votes = $('#votes');

    const close = $('#close');
    const len = $('.pagination-list').children().length;

    carousel.click(function () {
        let val = $(this).attr('aria-label').slice(-1);

        carousel.toggleClass('is-current');
        $(this).toggleClass('is-current');

        let url = pic.attr('style');
        let newUrl = url.substr(0, url.length - 7) + val + '.jpg")';

        pic.attr('style', newUrl);
    });

    left.click(() => loadPicture(-1, len, pic));
    right.click(() => loadPicture(1, len, pic));

    const modal = $('.modal');

    if (modal.length > 0) {
        $(document).on('click', function (e) {
            if (e.target.id !== 'modal-body' && !e.target.classList.contains('logged-out')) {
                modal.removeClass('is-active');
                $('html').removeClass('is-clipped');
            }
        });

        close.on('click', function () {
            modal.removeClass('is-active');
            $('html').removeClass('is-clipped');
        });

        upvote.click(e => {
           modal.addClass('is-active');
            $('html').addClass('is-clipped');
            e.stopPropagation();
        });

        downvote.click(e => {
            modal.addClass('is-active');
            $('html').addClass('is-clipped');
            e.stopPropagation();
        });
    } else {
        upvote.on('click', function () {
            if (upvote.hasClass('is-active')) {
                upvote.removeClass('is-active');
                let num_votes = Number(votes.html());
                votes.html(num_votes - 1);
            } else {
                let num_votes = Number(votes.html());

                if (downvote.hasClass('is-active')) {
                    downvote.removeClass('is-active');
                    num_votes += 1;
                }
                upvote.addClass('is-active');
                votes.html(num_votes + 1);
            }
        });

        downvote.on('click', function () {
            if (downvote.hasClass('is-active')) {
                downvote.removeClass('is-active');
                let num_votes = Number(votes.html());
                votes.html(num_votes + 1);
            } else {
                let num_votes = Number(votes.html());

                if (upvote.hasClass('is-active')) {
                    upvote.removeClass('is-active');
                    num_votes -= 1;
                }
                downvote.addClass('is-active');
                votes.html(num_votes - 1);
            }
        });
    }
});

function loadPicture(value, len, pic) {
    const curr = $('.post-header a.pagination-link.is-current');

    let val = Number(curr.attr('aria-label').slice(-1)) + value;
    if (val === len) val -= len;
    else if (val < 0) val += len;

    const next = $('.post-header .pagination').find('[aria-label=\'image ' + val + '\']');

    curr.toggleClass('is-current');
    next.toggleClass('is-current');

    let url = pic.attr('style');
    let newUrl = url.substr(0, url.length - 7) + val + '.jpg")';

    pic.attr('style', newUrl);
}