$(document).ready(function() {
    $('.upvote').on('click', function () {
        let count = $(this).siblings('.display-count');
        let num_votes = Number(count.html());
        let downvote = $(this).siblings('.downvote');
        let recipe_id = $(this).siblings('input').val();

        if ($(this).hasClass('is-active')) {
            $(this).removeClass('is-active');
            count.html(num_votes - 1);

            $.post('/vote/delete', {recipe_id: recipe_id}, (success) => {
                if (success)
                    console.log('Vote deleted successfully');
                else
                    console.log('Error deleting vote');
            });
        } else if (downvote.hasClass('is-active')) {
            downvote.removeClass('is-active');
            $(this).addClass('is-active');
            count.html(num_votes + 2);

            $.post('/vote/update', {recipe_id: recipe_id, vote_value: 1}, (success) => {
                if (success)
                    console.log('Vote updated successfully');
                else
                    console.log('Error updating vote');
            });
        } else {
            $(this).addClass('is-active');
            count.html(num_votes + 1);

            $.post('/vote/add', {recipe_id: recipe_id, vote_value: 1}, (success) => {
                if (success)
                    console.log('Voted successfully');
                else
                    console.log('Error voting');
            });
        }
    });

    $('.downvote').on('click', function () {
        let count = $(this).siblings('.display-count');
        let num_votes = Number(count.html());
        let upvote = $(this).siblings('.upvote');
        let recipe_id = $(this).siblings('input').val();

        if ($(this).hasClass('is-active')) {
            $(this).removeClass('is-active');
            count.html(num_votes + 1);

            $.post('/vote/delete', {recipe_id: recipe_id}, (success) => {
                if (success)
                    console.log('Vote deleted successfully');
                else
                    console.log('Error deleting vote');
            });
        } else if (upvote.hasClass('is-active')) {
            upvote.removeClass('is-active');
            $(this).addClass('is-active');
            count.html(num_votes - 2);

            $.post('/vote/update', {recipe_id: recipe_id, vote_value: -1}, (success) => {
                if (success)
                    console.log('Vote updated successfully');
                else
                    console.log('Error updating vote');
            });
        } else {
            $(this).addClass('is-active');
            count.html(num_votes - 1);

            $.post('/vote/add', {recipe_id: recipe_id, vote_value: -1}, (success) => {
                if (success)
                    console.log('Voted successfully');
                else
                    console.log('Error voting');
            });
        }
    });
});