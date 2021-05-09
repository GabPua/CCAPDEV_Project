let no_comments_msg, comments;

$(document).ready(function () {
    const recipe_id = $('input[name="recipe_id"]').val();
    const carousel = $('.post-header .pagination a.pagination-link');
    const pic = $('#food-pic');

    const left = $('#left');
    const right = $('#right');

    const upvote = $('.upvote');
    const downvote = $('.downvote');
    const votes = $('#votes');

    const close = $('#close');
    const len = $('.pagination-list').children().length;

    no_comments_msg = $('#no-comments');
    comments = $('.comments');

    comments.click(() => {
        if (comments.children().length === 0) {
            no_comments_msg.show();
        } else {
            no_comments_msg.hide();
        }
    }).trigger('click');

    $(document).on('click', '.dropdown-trigger', function () {
        $(this).parent().toggleClass('is-active');
    });

    comments.on('click', '.delete-comment', function () {
        const id = $(this).siblings('input').val();

        $.post('/comment/delete', {id: id, recipe_id: recipe_id}, (isSuccess) => {
            if (isSuccess) {
                $(this).closest('.media').remove();
            }
        });
    });

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
    const post_dropdown = $('#post-dropdown');

    $(document).click(function (e) {
        if (e.target.id !== 'modal-body') {
            modal.removeClass('is-active');
            $('html').removeClass('is-clipped');
        }

        const dropdown = $(e.target).parent().parent();

        if (dropdown.attr('id') !== 'post-dropdown') {
            post_dropdown.removeClass('is-active');
        }

        $('.comment-dropdown').not(dropdown).removeClass('is-active');
    });

    // a user is not logged in
    if (modal.length > 0) {
        close.click(function () {
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
        const textarea = $('.textarea');

        textarea.focusout(() => {
            if (!textarea.val()) {
                textarea.addClass('is-danger');
            } else {
                textarea.removeClass('is-danger');
            }
        });

        $('#edit-post').click(() => {
            window.location = '/edit/' + recipe_id;
        });

        $('#delete-post').click(() => {
            $.post('/post/delete', {recipe_id: recipe_id}, (success) => {
                if (success) {
                    window.location.replace('/posts');
                } else {
                    location.reload();
                }
            });
        });

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

        $('#post-comment').click(() => {
            textarea.trigger('focusout');

            if (!textarea.hasClass('is-danger')) {
                const text = textarea.val();

                $.post('/comment/add', {recipe_id: recipe_id, text: text}, (obj) => {
                    const { comment_id, user_id, picture_path } = obj;
                    if (comment_id) {
                        const new_comment = $(
                            `<article class='media'>
                                <figure class='media-left'>
                                    <p class='image is-64x64'>
                                        <img class='is-rounded' src='${picture_path}' alt='${user_id}'>
                                    </p>
                                </figure>
                                <div class='media-content'>
                                    <div class='content'>
                                        <p>
                                            <a href='/user/${user_id}'><strong>${user_id}</strong></a>
                                            <br>
                                            ${text}
                                            <br>
                                            <small><a>Reply</a> · Just Now</small>
                                        </p>
                                    </div>
                                </div>
                                
                                <div class='dropdown comment-dropdown'>
                                    <div class='dropdown-trigger'>
                                        <i class='icon fas fa-ellipsis-h fa-lg' aria-haspopup='true' aria-controls='post-options'></i>
                                    </div>
                                    <div class='dropdown-menu' role='menu'>
                                        <div class='dropdown-content'>
                                            <input type='hidden' value='${comment_id}'>
                                            <a class='dropdown-item edit-comment'>Edit</a>
                                            <a class='dropdown-item delete-comment'>Delete</a>
                                        </div>
                                    </div>
                                </div>
                            </article>`);

                        comments.append(new_comment);
                        textarea.val('');
                    } else {
                        textarea.val('ERROR ENCOUNTERED');
                    }
                });
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