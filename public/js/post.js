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

    const dp = $('#comment-dp');

    no_comments_msg = $('#no-comments');
    comments = $('.comments');

    if (comments.children('.media').length === 0) {
        no_comments_msg.show();
    } else {
        no_comments_msg.hide();
    }

    const observer = new MutationObserver((mutations) => {
        for (let mutation of mutations) {
            if (mutation.type === 'childList') {
                if (comments.children('.media').length === 0) {
                    no_comments_msg.show();
                } else {
                    no_comments_msg.hide();
                }
            }
        }
    });

    observer.observe(comments[0], { childList: true });

    $(document).on('click', '.dropdown-trigger', function () {
        $(this).parent().toggleClass('is-active');
    });

    $(document).on('keydown', '.textarea', function() {
        $(this).removeClass('is-danger')
    })

    // add new field when "Reply" is clicked
    comments.on('click', '.reply', function () {
        const reply = $(
            `<article class='media'>
                <figure class='media-left'>
                    <p class='image is-48x48'>
                        <img class='is-rounded' src='${dp.attr('src')}' alt='${dp.attr('alt')}'>
                    </p>
                </figure>
                <div class='media-content'>
                    <div class='field'>
                        <p class='control'>
                            <textarea class='textarea has-fixed-size reply-body' placeholder='Reply to a comment...' name='reply'></textarea>
                        </p>
                    </div>
                    <div class='field'>
                        <p class='control'>
                            <button class='button post-reply'>Post reply</button>
                        </p>
                    </div>
                </div>
            </article>`);

        $(this).closest('.media-content').append(reply);
        reply.find('.textarea').focus();
    });

    // when "post reply" is clicked
    comments.on('click', '.post-reply', function () {
        const post_reply_wrapper = $(this).closest('.media');
        const parent_comment = post_reply_wrapper.parent().closest('.media');
        const textarea = post_reply_wrapper.find('.textarea');
        const reply_to = parent_comment.find('input[type=hidden]').val();

        if (textarea.val()) {
            const text = textarea.val();

            $.post('/comment/add', {recipe_id: recipe_id, text: text, reply_to: reply_to}, (obj) => {
                const {comment_id, user_id, picture_path} = obj;
                if (comment_id) {
                    parent_comment.children('.media-content').append(createNewCommentDiv(comment_id, user_id, picture_path, true, text));
                    post_reply_wrapper.remove();
                } else {
                    textarea.val('ERROR ENCOUNTERED');
                }
            });
        } else {
            textarea.addClass('is-danger');
        }
    });

    comments.on('click', '.delete-comment', function () {
        const id = $(this).siblings('input').val();

        $.post('/comment/delete', {id: id, recipe_id: recipe_id}, (isSuccess) => {
            if (isSuccess) {
                $(this).closest('.media').remove();
            }
        });
    });

    comments.on('click', '.edit-comment', function () {
        const body = $(this).closest('.media').find('.comment-body').first();
        body.attr('contenteditable', 'true').focus();
        $(this).closest('.dropdown').hide();
    });

    comments.on('keydown', '.comment-body', function (event) {
        if (event.keyCode === 13 && !event.shiftKey) {
            return false;
        }
    });

    comments.on('keyup', '.comment-body', function (event) {
        const body = $(this);
        const dropdown = body.closest('.media').find('.dropdown');

        if (event.keyCode === 13 && !event.shiftKey) {
            if (body.html()) {
                $.post('/comment/edit', {id: dropdown.find('input').val(), body: body.html()}, (isSuccess) => {
                    if (isSuccess) {
                        body.attr('contenteditable', 'false');
                        dropdown.show();
                    } else {
                        location.reload();
                    }
                });
            } else {
                body.val('Must not be empty');
            }

            return false;
        } else if (event.keyCode === 27) { // esc key
            $.post('/comment', {id: dropdown.find('input').val()}, (text) => {
                if (text) {
                    body.html(text);
                    body.attr('contenteditable', 'false');
                    dropdown.show();
                } else {
                    location.reload();
                }
            });
        }
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

    // user is not logged in
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
        $('#edit-post').click(() => {
            window.location = '/post/edit/' + recipe_id;
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
            let num_votes = Number(votes.html());

            if (upvote.hasClass('is-active')) {
                upvote.removeClass('is-active');
                votes.html(num_votes - 1);

                $.post('/vote/delete', {recipe_id: recipe_id}, (success) => {
                    if (success)
                        console.log('Vote deleted successfully');
                    else
                        console.log('Error deleting vote');
                });
            } else if (downvote.hasClass('is-active')) {
                downvote.removeClass('is-active');
                upvote.addClass('is-active');
                votes.html(num_votes + 2);

                $.post('/vote/update', {recipe_id: recipe_id, vote_value: 1}, (success) => {
                    if (success)
                        console.log('Vote updated successfully');
                    else
                        console.log('Error updating vote');
                });
            } else {
                upvote.addClass('is-active');
                votes.html(num_votes + 1);

                $.post('/vote/add', {recipe_id: recipe_id, vote_value: 1}, (success) => {
                    if (success)
                        console.log('Voted successfully');
                    else
                        console.log('Error voting');
                });
            }
        });

        downvote.on('click', function () {
            let num_votes = Number(votes.html());

            if (downvote.hasClass('is-active')) {
                downvote.removeClass('is-active');
                votes.html(num_votes + 1);

                $.post('/vote/delete', {recipe_id: recipe_id}, (success) => {
                    if (success)
                        console.log('Vote deleted successfully');
                    else
                        console.log('Error deleting vote');
                });
            } else if (upvote.hasClass('is-active')) {
                upvote.removeClass('is-active');
                downvote.addClass('is-active');
                votes.html(num_votes - 2);

                $.post('/vote/update', {recipe_id: recipe_id, vote_value: -1}, (success) => {
                    if (success)
                        console.log('Vote updated successfully');
                    else
                        console.log('Error updating vote');
                });
            } else {
                downvote.addClass('is-active');
                votes.html(num_votes - 1);

                $.post('/vote/add', {recipe_id: recipe_id, vote_value: -1}, (success) => {
                    if (success)
                        console.log('Voted successfully');
                    else
                        console.log('Error voting');
                });
            }
        });

        $('#post-comment').click(() => {
            const textarea = $('#new-comment');

            if (textarea.val()) {
                const text = textarea.val();

                $.post('/comment/add', {recipe_id: recipe_id, text: text}, (obj) => {
                    const { comment_id, user_id, picture_path } = obj;
                    if (comment_id) {
                        comments.append(createNewCommentDiv(comment_id, user_id, picture_path, false, text));
                        textarea.val('');
                    } else {
                        textarea.val('ERROR ENCOUNTERED');
                    }
                });
            } else {
                textarea.addClass('is-danger');
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

function createNewCommentDiv(comment_id, user_id, picture_path, isReply, text) {
    const size = isReply ? '48x48' : '64x64';

    return $(
        `<article class='media'>
        <figure class='media-left'>
            <p class='image is-${size}'>
                <img class='is-rounded' src='${picture_path}' alt='${user_id}'>
            </p>
        </figure>
        <div class='media-content'>
            <div class='content'>
            ${isReply ? '' : `<input type='hidden' value='${comment_id}'>`}
                <p><a href='/user/${user_id}'><strong>${user_id}</strong></a></p>
                <p class='comment-body'>${text}</p>
                <p><small>${isReply ? '' : "<a class='reply'>Reply</a> · "}Just Now</small></p>
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
}
