const User = require('../models/user');
const Follow = require('../models/follow');
const Post = require('../models/recipe');
const Vote = require('../models/vote');
const crypto = require('crypto-js');
const dotenv = require('dotenv');

dotenv.config();
const key = process.env.SECRET || 'hushPuppy123';

// checks if the credentials inside the cookie are valid
function redirect (req, res, toRun) {
    if (req.session._id && req.cookies.user_sid) {
        toRun();
    } else {
        res.redirect('/');
    }
}

const user_controller = {
    // this is only accessible from home_ctrl, which already verifies login; no need to call for redirect().
    getNewsfeed: async (req, res) => {
        let friends = [], posts = [];

        // get users that are followed by the logged-in user
        await Follow.find({follower: req.session._id}, 'following', (err, result) => {
            if (err) {
                console.log(err);
            } else {
                friends = result.map(e => e.following);
            }
        }).lean().exec();

        // get all posts from followed users sorted from most to least recent
        await Post.find({user: {$in: friends}}, (err, result) => {
            posts = result;
        }).sort({ date: -1 }).populate('user').populate('likes').lean({virtuals: true}).exec();

        for (const post of posts) {
            // get sum of down votes and up votes
            post.likes = post.likes.reduce((n, {value}) => n + value, 0);

            // if up voted/down voted by the logged in user
            await Vote.findOne({user: req.session._id, recipe: post._id}, 'value', (err, result) => {
                post.is_liked = result? result.value : 0;
            });
        }

        res.render('newsfeed', {
            title: 'ShefHub | Home',
            post: posts
        });
    },

    getProfile: (req, res) => {
        redirect(req, res, async () => {
            let id = req.params.id;

            if (id == null) {
                id = req.session._id;
            } else if (id === req.session._id) {
                res.redirect('/profile');
                return;
            }

            let user, followers, following, posts;

            // get user details using id stored in session
            await User.findById(id, (err, result) => {
                user = result;
            }).lean().exec();

            // get number of followers
            await Follow.countDocuments({ following: id },(err, result) => {
                followers = result;
            }).lean().exec();

            // get number of following
            await Follow.countDocuments({ follower: id },(err, result) => {
                following = result;
            }).lean().exec();

            // get number of posts
            await Post.countDocuments( { user: id }, (err, result) => {
                posts = result;
            }).lean().exec();

            res.render('profile', {
                title: "ShefHub | " + id,
                user: user,
                followers: followers,
                following: following,
                post: posts,
                template: 'profile'
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
        redirect(req, res, async () => {
            let id = req.params.id;
            const route = req.path.split('/').pop();

            if (id == null) {
                id = req.session._id;
            } else if (id === req.session._id) {
                res.redirect('/' + route);
                return;
            }

            let posts;
            if (route === 'posts') {
                await Post.find( { user: id }, (err, result) => {
                    posts = result;
                }).lean().exec();
            } else {
                let post_ids;
                await Vote.find({user: id, value: 1}, (err, result) => {
                    post_ids = result.map(a => a.recipe);
                }).lean().exec();

                await Post.find({_id: {$in: post_ids}}, (err, result) => {
                    posts = result;
                }).lean().exec();
            }

            res.render('profile', {
                user: { _id: id },
                title: "ShefHub | " + id,
                posts: posts,
                template: 'posts',
                route: route
            });
        });
    },

    getFollow: (req, res) => {
        redirect(req, res, async () => {
            let users = [];
            const route = req.path.replace('/', '');

            if (route === 'followers') {
                await Follow.find({following: req.session._id}, 'follower', (err, result) => {
                    users = result.map(a => a.follower);
                }).populate('follower').lean().exec();
            } else {
                await Follow.find({follower: req.session._id}, 'following', (err, result) => {
                    users = result.map(a => a.following);
                }).populate('following').lean().exec();
            }

            res.render('profile', {
                user: { _id: req.session._id },
                title: "ShefHub | " + req.session._id,
                users: users,
                template: 'follow',
                route: route
            });
        });
    },

    getSearch: (req, res) => {
        redirect(req, res, async () => {
            const { keyword } = req.query

            if (keyword) {
                let results;
                const pattern = new RegExp(keyword, 'i');

                // query
                await Post.find({title: {$regex: pattern} },(err, result) => {
                    results = result;
                }).populate('user').lean().exec();

                res.render('query', {
                    title: 'Shefhub Search | ' + keyword,
                    query: keyword,
                    results: results
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

    getCheckEmail: async (req, res) => {
        let email = req.query.email;

        await User.findOne({email: email}, null, null, (err, result) => {
            if (result !== null && result._id === req.session._id)
                res.send('good');
            else
                res.send(result);
        }).lean().exec();
    },

    verifyPassword: async (req, res) => {
        let password = req.body.password;

        await User.findById( req.session._id, (err, result) => {
            res.send(result != null && password === crypto.AES.decrypt(result.password, key).toString(crypto.enc.Utf8));
        }).lean().exec();
    },

    updatePassword: async (req, res) => {
        const { old_pass, new_pass } = req.body;
        let isValid;

        // final verification
        await User.findById(req.session._id, (err, result) => {
            isValid = result != null && old_pass === crypto.AES.decrypt(result.password, key).toString(crypto.enc.Utf8);
        }).lean().exec();

        if (isValid) {
            await User.findByIdAndUpdate(req.session._id, { password: crypto.AES.encrypt(new_pass, key).toString() }).lean().exec();
        }

        res.send(isValid);
    },

    getCheckProf: async (req, res) => {
        let profession = req.query.profession;
        let _id = req.session._id;

        await User.findOne({_id: _id, profession: profession}, null, null, (err, result) => {
            if (result !== null)
                res.send('good');
            else
                res.send(result);
        }).lean().exec();
    },

    getCheckPlace: async (req, res) => {
        let place = req.query.place;
        let _id = req.session._id;

        await User.findOne({_id: _id, workplace: place}, null, null, (err, result) => {
            if (result !== null)
                res.send('good');
            else
                res.send(result);
        }).lean().exec();
    },

    getCheckDesc: async (req, res) => {
        let desc = req.query.desc;
        let _id = req.session._id;

        await User.findOne({_id: _id, desc: desc}, null, null, (err, result) => {
            if (result !== null)
                res.send('good');
            else
                res.send(result);
        }).lean().exec();
    },

    getCheckFollow: async (req, res) => {
        const following = req.query.user_id;
        const follower = req.session._id;

        await Follow.findOne({follower: follower, following: following}, null, null, (err, result) => {
            res.send(result);
        }).exec();
    },

    postFollow: async (req, res) => {
        const { follow_id = null,  user_id: following = null} = req.body;

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
                res.send(await Follow.findOneAndUpdate(follow, follow, {new: true, upsert: true}));
            }
        }
    },

    getDeleteAccount: (req, res) => {
        redirect(req, res, async () => {
            const id = req.session._id;

            // delete user's following and followers
            let delFollowing = await Follow.deleteMany({follower: id}).exec();
            let delFollower = await Follow.deleteMany({following: id}).exec();

            // TODO: Delete user's comments and comments of others on user's posts

            // delete user's posts
            let delPost = await Post.deleteMany({user: id}).exec();

            // delete user
            await User.findByIdAndDelete(id).exec();

            console.log('Followings removed: ' + delFollowing.deletedCount);
            console.log('Followers removed: ' + delFollower.deletedCount);
            console.log('Posts removed: ' + delPost.deletedCount);

            res.redirect('/logout');
        });
    }
}

module.exports = user_controller;
