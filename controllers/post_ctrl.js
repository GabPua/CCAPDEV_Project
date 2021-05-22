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

const post_controller = {
    getCreateForm: (req, res) => {
        res.render('create', {
            title: 'Create a new recipe'
        });
    },

    insertToDB: (req, res) => {
        let {id, title, desc, quantity, unit, ingredient, direction, n_pictures} = req.body;

        if (!id) {
            id = new mongoose.Types.ObjectId();
        }

        if (!n_pictures) {
            n_pictures = Number(0);
        } else {
            n_pictures = Number(n_pictures);
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

        if ((!req.files || Object.keys(req.files).length === 0) && n_pictures === 0) {
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
                date: new Date(),
                n_pictures: Number(n_pictures)
            };

            async.waterfall([
                function upsertPost(callback) {
                    Post.findByIdAndUpdate(id, post,
                        {upsert: true, useFindAndModify: false, new: true}, (err, result) => {
                        callback(err, result);
                    });
                },

                function uploadPics(result, callback) {
                    if (post.n_pictures > 0 && (!req.files || Object.keys(req.files).length === 0)) {
                        callback(null, result._id);
                    } else if (!Array.isArray(req.files.pictures)) {
                        let pic = req.files.pictures;
                        let uploadPath = './public/img/' + result._id + '_' + post.n_pictures + '.jpg';
                        pic.mv(uploadPath, (err) => {
                            if (err) {
                                console.log('Upload failed');
                            } else {
                                post.n_pictures += 1;
                            }
                            callback(err, result._id);
                        });
                    } else {
                        async.eachSeries(req.files.pictures, (pic, callback) => {
                            let uploadPath = './public/img/' + result._id + '_' + post.n_pictures + '.jpg';
                            pic.mv(uploadPath, (err) => {
                                if (err) {
                                    console.log('Upload failed');
                                } else {
                                    console.log(uploadPath + ' uploaded successfully');
                                    post.n_pictures += 1;
                                }
                                callback(err);
                            });
                        }, (err) => {
                            if (err) {
                                console.log('At least one upload failed');
                            } else {
                                console.log('All pictures uploaded successfully');
                            }
                            callback(err, result._id);
                        });
                    }
                },

                function updatePicCount(recipe_id, callback) {
                    Post.updateOne({_id: recipe_id}, post, (err) => {
                        callback(err, recipe_id);
                    });
                }

            ], (err, recipe_id) => {
                if (err) {
                    console.log(err);
                    res.redirect('/404NotFound');
                } else {
                    res.redirect('/post/' + recipe_id);
                }
            });
        } else {
            res.render('create', {
                title: 'Shefhub | Post Editor',
                post: req.body,
                err: err
            });
        }
    },

    getRecipe: (req, res) => {
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
                async.each(comments, (comment, callback) => {
                    Comment.find({reply_to: comment._id}, (err, replies) => {
                        comment.replies = replies;
                        callback(err);
                    }).sort({date: 1}).populate('user').lean();
                }, (err) => {
                    callback(err, post, comments)
                });
            },

            function getUser(post, comment, callback) {
                if (req.session._id && req.cookies.user_sid) {
                    User.findById(req.session._id, (err, result) => {
                        callback(err, post, comment, result);
                    }).lean();
                } else {
                    callback(null, post, comment, null);
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
                    title: 'ShefHub | Edit Recipe',
                    post: post,
                    err: err
                });
            }
        });
    },

    deletePost: (req, res) => {
        Post.findByIdAndDelete(req.body.recipe_id, (err) => {
            res.send(err == null);
        });
    }
}

module.exports = post_controller;
