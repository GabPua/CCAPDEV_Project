const User = require('../models/user');
const Follow = require('../models/follow');
const Post = require('../models/recipe');
const Vote = require('../models/vote');
const crypto = require('crypto-js');
const dotenv = require('dotenv');
const async = require('async');

dotenv.config();
const key = process.env.SECRET || 'hushPuppy123';

// checks if the credentials inside the cookie are valid
function redirect (req, res, toRun) {
    const { user_sid } = req.cookies;
    if (req.session._id && user_sid) {
        toRun();
    } else {
        res.redirect('/');
    }
}

const user_controller = {
    // this is only accessible from home_ctrl, which already verifies login; no need to call for redirect().
    getNewsfeed: (req, res) => {
        async.waterfall([
            function getFollowing(callback) {
                Follow.find({follower: req.session._id}, 'following', (err, result) => {
                    callback(err, result.map(e => e.following));
                }).lean();
            },

            function getPostsFromFollowing(friends, callback) {
                Post.find({user: {$in: friends}}, (err, result) => {
                    callback(err, result);
                }).sort({ date: -1 }).populate('user').populate('likes').lean({virtuals: true});
            },

            function getVoteStatus(posts, callback) {
                async.each(posts, function (post, callback) {
                    // get sum of down votes and up votes
                    post.likes = post.likes.reduce((n, {value}) => n + value, 0);

                    // if user liked this post
                    Vote.findOne({user: req.session._id, recipe: post._id}, 'value', (err, result) => {
                        post.is_liked = result? result.value : 0;
                        callback(err);
                    });
                }, (err) => {
                    callback(err, posts);
                });
            },
        ], (err, posts) => {
            res.render('newsfeed', {
                title: 'ShefHub | Home',
                post: posts
            });
        });
    },

    getProfile: (req, res) => {
        redirect(req, res,  () => {
            let id = req.params.id;

            if (id == null) {
                id = req.session._id;
            } else if (id === req.session._id) {
                res.redirect('/profile');
                return;
            }

            async.series([
                function getLoggedInUser(callback) {
                    User.findById(id, (err, result) => {
                        callback(err, result);
                    }).lean();
                },

                function getNumFollowers(callback) {
                    Follow.countDocuments({ following: id },(err, result) => {
                        callback(err, result);
                    }).lean();
                },

                function getNumFollowing(callback) {
                    Follow.countDocuments({ follower: id },(err, result) => {
                        callback(err, result);
                    }).lean();
                },

                function getNumPosts(callback) {
                    Post.countDocuments( { user: id }, (err, result) => {
                        callback(err, result);
                    }).lean();
                }
            ], (err, results) => {
                res.render('profile', {
                    title: "ShefHub | " + id,
                    user: results[0],
                    followers: results[1],
                    following: results[2],
                    post: results[3],
                    template: 'profile'
                });
            });
        });
    },

    postProfile: (req, res) => {
        redirect(req, res, async () => {

            const { email, profession, workplace, desc } = req.body;
            let user = {
                email: email,
                profession: profession,
                workplace: workplace,
                desc: desc
            };

            await User.updateOne({_id: req.session._id}, user).exec();

            if (req.files && Object.keys(req.files).length > 0) {
                let pic = req.files.file;
                let path = '/public/img/profile/' + req.session._id + '.jpg';
                let uploadPath = '.' + path;

                await pic.mv(uploadPath, async (err) => {
                    if (err)
                        console.log('Upload failed');
                    else {
                        console.log(req.session._id + '.jpg uploaded successfully');
                        user.picture_path = path;
                        
                        await User.updateOne({_id: req.session._id}, user).exec();
                    }
                });
            }

            res.redirect('/profile');
        });
    },

    getPosts: (req, res) => {
        redirect(req, res, () => {
            let id = req.params.id;
            const route = req.path.split('/').pop();

            if (id == null) {
                id = req.session._id;
            } else if (id === req.session._id) {
                res.redirect('/' + route);
                return;
            }

            async.waterfall([
                function getPosts(callback) {
                    if (route === 'posts') {
                        Post.find( { user: id }, (err, results) => {
                            callback(err, results);
                        }).lean();
                    } else {
                        Vote.find({user: id, value: 1}, (err, results) => {
                            callback(err, results.map(a => a.recipe));
                        }).populate('recipe').lean();
                    }
                }
            ], (err, posts) => {
                res.render('profile', {
                    user: { _id: id },
                    title: "ShefHub | " + id,
                    posts: posts,
                    template: 'posts',
                    route: route
                });
            });
        });
    },

    getFollow: (req, res) => {
        redirect(req, res, () => {
            const route = req.path.replace('/', '');

            async.waterfall([
                function getUsers(callback) {
                    if (route === 'followers') {
                        Follow.find({following: req.session._id}, 'follower', (err, result) => {
                            callback(err, result.map(a => a.follower));
                        }).populate('follower').lean();
                    } else {
                        Follow.find({follower: req.session._id}, 'following', (err, result) => {
                            callback(err, result.map(a => a.following));
                        }).populate('following').lean();
                    }
                }
            ], (err, users) => {
                res.render('profile', {
                    user: { _id: req.session._id },
                    title: "ShefHub | " + req.session._id,
                    users: users,
                    template: 'follow',
                    route: route
                });
            });
        });
    },

    getSearch: (req, res) => {
        redirect(req, res, () => {
            const { keyword } = req.query

            if (keyword) {
                const pattern = new RegExp(keyword, 'i');

                async.waterfall([
                    function findPosts(callback) {
                        Post.find({title: {$regex: pattern} },(err, results) => {
                            callback(err, results);
                        }).populate('user').lean();
                    }
                ], (err, posts) => {
                    res.render('query', {
                        title: 'Shefhub Search | ' + keyword,
                        query: keyword,
                        results: posts
                    });
                });
            } else {
                res.render('search', {
                    title: 'ShefHub | Search Recipes'
                });
            }
        });
    },

    getLogout: (req, res) => {
        redirect(req, res, () => {
            req.session.destroy();
            res.clearCookie('user_sid');
            res.redirect('/');
        });
    },

    getCheckEmail: (req, res) => {
        let email = req.query.email;

        User.findOne({email: email}, null, null, (err, result) => {
            if (result !== null && result._id === req.session._id)
                res.send('good');
            else
                res.send(result);
        }).lean();
    },

    verifyPassword: (req, res) => {
        let password = req.body.password;

        User.findById( req.session._id, (err, result) => {
            res.send(result != null && password === crypto.AES.decrypt(result.password, key).toString(crypto.enc.Utf8));
        }).lean().exec();
    },

    updatePassword: (req, res) => {
        const { old_pass, new_pass } = req.body;

        async.waterfall([
            function validateUserAndPassword(callback) {
                User.findById(req.session._id, (err, result) => {
                    callback(err, result != null && old_pass === crypto.AES.decrypt(result.password, key).toString(crypto.enc.Utf8));
                }).lean();
            },

            function updatePassword(isValid, callback) {
                if (isValid) {
                    User.findByIdAndUpdate(req.session._id, {password: crypto.AES.encrypt(new_pass, key).toString()}).lean();
                }
                callback(null, isValid);
            }
        ], (err, isValid) => {
            res.send(isValid);
        });
    },

    getCheckProf: (req, res) => {
        let profession = req.query.profession;
        let _id = req.session._id;

         User.findOne({_id: _id, profession: profession}, null, null, (err, result) => {
            if (result !== null)
                res.send('good');
            else
                res.send(result);
        }).lean();
    },

    getCheckPlace: (req, res) => {
        let place = req.query.place;
        let _id = req.session._id;

        User.findOne({_id: _id, workplace: place}, null, null, (err, result) => {
            if (result !== null)
                res.send('good');
            else
                res.send(result);
        }).lean();
    },

    getCheckDesc: (req, res) => {
        let desc = req.query.desc;
        let _id = req.session._id;

        User.findOne({_id: _id, desc: desc}, null, null, (err, result) => {
            if (result !== null)
                res.send('good');
            else
                res.send(result);
        }).lean();
    },

    getCheckFollow: (req, res) => {
        const following = req.query.user_id;
        const follower = req.session._id;

        Follow.findOne({follower: follower, following: following}, null, null, (err, result) => {
            res.send(result);
        });
    },

    postFollow: async (req, res) => {
        const { follow_id = null,  user_id: following = null } = req.body;

        // _id given for a follow doc
        if (follow_id) {
            await Follow.findByIdAndDelete(follow_id, (err, result) => {
                res.send(result);
            }).exec();
        } else {
            const follower = req.session._id;
            let isValid;

            // verify user to be followed
            await User.findById(following, '_id', null, (err, result) => {
                isValid = result != null;
            }).exec();

            if (isValid) {
                let follow = {
                    follower: follower,
                    following: following
                };

                // prevents duplicates
                res.send(await Follow.updateOne(follow, follow, {new: true, upsert: true}));
            }
        }
    },

    deleteAccount: (req, res) => {
        redirect(req, res, () => {
            const id = req.session._id;
            User.findByIdAndDelete(id, (err, result) => {
                res.send(result != null);
            });
        });
    }
}

module.exports = user_controller;
