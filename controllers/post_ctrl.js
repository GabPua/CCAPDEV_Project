const User = require('../models/user');
const Post = require('../models/recipe');
const Comment = require('../models/comment');

function isEmpty(str) {
    return str == null || str.trim() === '';
}

function isInvalidNum(n) {
    return n <= 0;
}

// checks if the credentials inside the cookie are valid
function redirect(req, res, toRun) {
    if (req.session._id && req.cookies.user_sid) {
        toRun();
    } else {
        res.redirect('/');
    }
}

const post_controller = {
    getCreateForm: (req, res) => {
        redirect(req, res, () => {
            res.render('create', {
                title: 'Create a new recipe'
            });
        });
    },

    insertToDB: (req, res) => {
        redirect(req, res, async () => {
            const {title, desc, quantity, unit, ingredient, direction} = req.body;

            console.log(req.body);

            let {serving, prep_hr, prep_min, cook_hr, cook_min} = req.body;
            serving = parseInt(serving);
            prep_hr = parseInt(prep_hr);
            prep_min = parseInt(prep_min);
            cook_hr = parseInt(cook_hr);
            cook_min = parseInt(cook_min);

            // final validation
            const err = {};

            // if editing a post
            if (req.body.is_editing) {
                err.editing = true;
            }

            if (isEmpty(title)) {
                err.title = "Missing title";
            }

            if (isEmpty(desc)) {
                err.desc = "Missing description";
            }

            if (isInvalidNum(serving) || isInvalidNum(prep_hr + prep_min) || isInvalidNum(cook_hr + cook_min)) {
                err.information = "Invalid inputs";
            }


            if (!req.files || Object.keys(req.files).length === 0) {
                err.picture = 'At least 1 image required';
            }

            let quantities, units, ingredients, directions;
            if (typeof ingredient === 'string') {
                quantities = [quantity];
                units = [unit];
                ingredients = [ingredient];
            } else {
                quantities = quantity;
                units = unit;
                ingredients = ingredient;
            }

            if (typeof direction === 'string') {
                directions = [direction];
            } else {
                directions = direction;
            }

            let emptyCount = 0;
            emptyCount += quantities.filter(isEmpty).length;
            emptyCount += units.filter(isEmpty).length;
            emptyCount += ingredients.filter(isEmpty).length;

            if (3 * ingredients.length === emptyCount) {
                err.ingredient = 'At least 1 ingredient required';
            } else if (emptyCount !== 0) {
                err.ingredient = 'Please remove empty entries';
            }

            emptyCount = directions.filter(isEmpty).length

            if (directions.length === emptyCount) {
                err.direction = 'At least 1 procedure required';
            } else if (emptyCount !== 0) {
                err.direction = 'Please remove empty entries';
            }

            console.log(req.files.pictures);

            if (Object.keys(err).length === 0) {
                const ingredient_list = [];
                for (let i = 0; i < ingredients.length; i++) {
                    ingredient_list.push(quantities[i] + ' ' + units[i] + ' ' + ingredients[i]);
                }

                let post = {
                    user: req.session._id,
                    title: title,
                    desc: desc,
                    serving: serving,
                    prep_time: prep_hr * 60 + prep_min,
                    cook_time: cook_hr * 60 + cook_min,
                    direction: directions,
                    ingredient: ingredient_list,
                    date: new Date()
                };

                await Post.create(post, async (err, result) => {
                    if (err) {
                        console.log(err);
                    } else {
                        let n_pictures = 0;
                        if (!Array.isArray(req.files.pictures)) {
                            let pic = req.files.pictures;
                            let uploadPath = './public/img/' + result._id + '_' + n_pictures + '.jpg';
                            pic.mv(uploadPath, async (err) => {
                                if (err)
                                    console.log('Upload failed');
                                else {
                                    n_pictures += 1;
                                    await Post.updateOne({_id: result._id}, {n_pictures: n_pictures}).exec();
                                }
                            });
                        } else {
                            for (let i = 0; i < req.files.pictures.length; i++) {
                                let pic = req.files.pictures[i];
                                let uploadPath = './public/img/' + result._id + '_' + i + '.jpg';
                                pic.mv(uploadPath, (err) => {
                                    if (err)
                                        console.log('Upload failed');
                                    else {
                                        console.log(uploadPath + ' uploaded successfully');
                                        n_pictures += 1;
                                        Post.updateOne({_id: result._id}, {n_pictures: n_pictures}).exec();
                                    }
                                });
                            }
                        }

                        res.redirect('/post/' + result._id);
                    }
                });
            } else {
                res.render('./create', {
                    post: req.body,
                    err: err
                });
            }
        });
    },

    getRecipe: async (req, res) => {
        redirect(req, res, async () => {
            const id = req.params.id;

            try {
                await Post.findById(id, (err, result) => {
                    if (result) {
                        // pass recipe_id as post info
                        req.body.query = {_id: id};
                        post_controller.loadRecipe(req, res);
                    } else {
                        res.redirect('/404NotFound');
                    }
                }).lean().exec();
            } catch (e) {
                res.redirect('/404NotFound');
            }
        });
    },

    loadRecipe: async (req, res) => {
        let post, comments, user;
        let skip = req.body.skip || 0;
        let query = req.body.query || null;

        // get user
        if (req.session._id && req.cookies.user_sid) {
            await User.findById(req.session._id, (err, result) => {
                user = result;
            }).lean().exec();
        }

        // find the desired post
        await Post.findOne(query, async (err, result) => {
            post = result;
        }).skip(skip).lean().exec();

        // get top level comments only
        await Comment.find({recipe: post._id, reply_to: null}, (err, result) => {
            comments = result;
        }).sort({date: 1}).populate('user').lean().exec();

        // get replies for each comment and append the array to the comment object
        for (const comment of comments) {
            await Comment.find({reply_to: comment._id}, (err, replies) => {
                comment.replies = replies;
            }).sort({date: 1}).populate('user').lean().exec();
        }

        res.render('post', {
            title: 'ShefHub | ' + post.title,
            post: post,
            user: user,
            comments: comments
        });
    },

    deletePost: (req, res) => {
        const id = req.body.recipe_id;

        Post.findByIdAndDelete(id, (err) => {
            res.send(err == null);
        });
    }
}

module.exports = post_controller;
