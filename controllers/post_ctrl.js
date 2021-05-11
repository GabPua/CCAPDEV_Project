const User = require('../models/user');
const Post = require('../models/recipe');
const Comment = require('../models/comment');
const Vote = require('../models/vote');
const mongoose = require('mongoose');
const async = require('async');

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
            let {id, title, desc, quantity, unit, ingredient, direction} = req.body;

            if (!id) {
                id = null;
            }

            let {serving, prep_hr, prep_min, cook_hr, cook_min} = req.body;
            serving = parseInt(serving);
            prep_hr = parseInt(prep_hr);
            prep_min = parseInt(prep_min);
            cook_hr = parseInt(cook_hr);
            cook_min = parseInt(cook_min);

            // final validation
            const err = {};

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

            if (typeof ingredient === 'string') {
                req.body.quantity = quantity = [quantity];
                req.body.unit = unit = [unit];
                req.body.ingredient = ingredient = [ingredient];
            }

            if (typeof direction === 'string') {
                req.body.direction = direction = [direction];
            }

            let emptyCount = 0;
            emptyCount += quantity.filter(isEmpty).length;
            emptyCount += unit.filter(isEmpty).length;
            emptyCount += ingredient.filter(isEmpty).length;

            if (3 * ingredient.length === emptyCount) {
                err.ingredient = 'At least 1 ingredient required';
            } else if (emptyCount !== 0) {
                err.ingredient = 'Please remove empty entries';
            }

            emptyCount = direction.filter(isEmpty).length

            if (direction.length === emptyCount) {
                err.direction = 'At least 1 procedure required';
            } else if (emptyCount !== 0) {
                err.direction = 'Please remove empty entries';
            }

            if (Object.keys(err).length === 0) {
                const ingredient_list = [];
                for (let i = 0; i < ingredient.length; i++) {
                    ingredient_list.push(quantity[i] + ' ' + unit[i] + ' ' + ingredient[i]);
                }

                let post = {
                    user: req.session._id,
                    title: title,
                    desc: desc,
                    serving: serving,
                    prep_time: prep_hr * 60 + prep_min,
                    cook_time: cook_hr * 60 + cook_min,
                    direction: direction,
                    ingredient: ingredient_list,
                    date: new Date()
                };

                async.waterfall([
                    function upsertPost(callback) {
                        Post.findByIdAndUpdate(id, {$push: post, $setOnInsert: new mongoose.Types.ObjectId()},
                            {upsert: true, useFindAndModify: false}, (err, result) => {
                            callback(err, result)
                        });
                    },

                    // TODO: picture stuff
                ])

                await Post.create(post, async (err, result) => {
                    if (err) {
                        console.log(err);
                    } else {
                        let n_pictures = 0;
                        if (!Array.isArray(req.files.pictures)) {
                            let pic = req.files.pictures;
                            let uploadPath = './public/img/' + result._id + '_' + n_pictures + '.jpg';
                            await pic.mv(uploadPath, async (err) => {
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
                                await pic.mv(uploadPath, (err) => {
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
                res.render('create', {
                    post: req.body,
                    err: err
                });
            }
        });
    },

    getRecipe: (req, res) => {
        redirect(req, res, () => {
            async.waterfall([
                function findPost(callback) {
                    try {
                        Post.findById(req.params.id, (err, result) => {
                            callback(err, result);
                        }).lean();
                    } catch (e) {
                        callback('Invalid ID');
                    }
                }
            ], (err, result) => {
                if (!result) {
                    console.log(err);
                    res.redirect('/404NotFound');
                } else {
                    req.body.query = {_id: result._id};
                    post_controller.loadRecipe(req, res);
                }
            });
        });
    },

    loadRecipe: (req, res) => {
        let skip = req.body.skip || 0;
        let query = req.body.query || null;

        async.waterfall([
            function findPost(callback) {
                Post.findOne(query, (err, result) => {
                    // get sum of down votes and up votes
                    result.likes = result.likes.reduce((n, {value}) => n + value, 0);
                    callback(err, result);
                }).skip(skip).populate('likes').lean({virtuals: true});
            },

            function getComments(post, callback) {
                Comment.find({recipe: post._id, reply_to: null}, (err, result) => {
                    callback(err, post, result);
                }).sort({date: 1}).populate('user').lean();
            },

            function getRepliesForEachComment(post, comments, callback) {
                for (const comment of comments) {
                    Comment.find({reply_to: comment._id}, (err, replies) => {
                        comment.replies = replies;
                    }).sort({date: 1}).populate('user').lean();
                }

                callback(null, post, comments)
            },

            function getUser(post, comment, callback) {
                if (req.session._id && req.cookies.user_sid) {
                    User.findById(req.session._id, (err, result) => {
                        callback(err, post, comment, result);
                    }).lean();
                }
            },

            function isLikedByUser(post, comment, user, callback) {
                Vote.findOne({user: req.session._id, recipe: post._id}, 'value', (err, result) => {
                    post.is_liked = result ? result.value : 0;
                    callback(err, post, comment, user);
                });
            },
        ], (err, post, comments, user) => {
            if (err) {
                console.log(err);
                res.redirect('/404NotFound');
            } else {
                res.render('post', {
                    title: 'ShefHub | ' + post.title,
                    post: post,
                    user: user,
                    comments: comments
                });
            }
        });
    },

    editPost: (req, res) => {
        redirect(req, res, () => {
            const recipe_id = req.params.id;

            async.waterfall([
                function validateUserIsAuthor(callback) {
                    Post.findById(recipe_id, (err, result) => {
                        if (result.user === req.session._id) {
                            callback(err, result);
                        } else {
                            callback('Invalid User');
                        }
                    }).lean();
                },
            ], (err, post) => {
                if (err) {
                    res.redirect('/404NotFound');
                } else {
                    // processing to fit with create.hbs template
                    const quantity = [], unit = [], ingredient = [];

                    for (let i = 0; i < post.ingredient.length; i++) {
                        const substr = post.ingredient[i].split(' ', 3);

                        quantity.push(substr[0]);
                        unit.push(substr[1]);
                        ingredient.push(substr[2]);
                    }

                    post.ingredient = ingredient;
                    post.quantity = quantity;
                    post.unit = unit;
                    post.prep_hr = Math.floor(post.prep_time / 60);
                    post.prep_min = post.prep_time % 60;
                    post.cook_hr = Math.floor(post.cook_time / 60);
                    post.cook_min = post.cook_time % 60;

                    res.render('create', {
                        post: post,
                        err: err
                    });
                }
            });
        })
    },

    deletePost: (req, res) => {
        const id = req.body.recipe_id;

        Post.findByIdAndDelete(id, (err) => {
            res.send(err == null);
        });
    }
}

module.exports = post_controller;
