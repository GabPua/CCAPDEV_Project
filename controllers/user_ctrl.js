const User = require('../models/user');
const Follow = require('../models/follow');
const Post = require('../models/recipe');
const Vote = require('../models/vote');
const crypto = require('crypto-js');
const dotenv = require('dotenv');

dotenv.config();
const key = process.env.SECRET || 'hushPuppy123';

function isEmpty(str) {
    return str == null || str.trim() === '';
}

function isInvalidNum(n) {
    return n <= 0;
}

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
        let path, friends = [], posts = [];

        // get user picture
        await User.findById(req.session._id ,(err, result) => {
            path = result.picture_path;
        }).lean().exec();

        // get users that are followed by the logged-in user
        await Follow.find({follower: req.session._id}, 'following', (err, result) => {
            if (err) {
                console.log(err);
            } else {
                result.forEach(e => friends.push(e.following));
            }
        }).exec();

        // get all posts from followed users sorted from most to least recent
        await Post.find({user: {$in: friends}}, (err, result) => {
            if (err) {
                console.log(err);
            } else {
                posts = result;
            }
        }).sort({ date: -1 }).populate('user').lean().exec();

        res.render('newsfeed', {
            title: 'ShefHub | Home',
            post: posts,
            path: path
        });
    },

    getCreate: (req, res) => {
        redirect(req, res, async () => {
            let path;

            // get user picture
            await User.findById(req.session._id ,(err, result) => {
                path = result.picture_path;
            }).lean().exec();

            res.render('create', {
                title: 'Create a new recipe',
                path: path
            });
        });
    },

    postCreate: (req, res) => {
        redirect(req, res, async () => {
            const { title, picture = [], desc, ingredient = [], direction = []} = req.body;
            let { serving, prep_hr, prep_min, cook_hr, cook_min } = req.body;
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

            let emptyCount = picture.filter(isEmpty).length;

            if (picture.length === emptyCount) {
                err.picture = 'At least 1 image required';
            } else if (emptyCount !== 0) {
                err.picture = 'Please remove empty entries';
            }

            emptyCount = ingredient.filter(e => {return Object.values(e).filter(isEmpty).length !== 0;}).length;

            if(picture.length === emptyCount) {
                err.ingredient = 'At least 1 ingredient required';
            } else if(emptyCount !== 0) {
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
                ingredient.forEach(e => ingredient_list.push(Object.values(e).join(" ")));

                let post = {
                    user: req.session._id,
                    title: title,
                    desc: desc,
                    serving: serving,
                    picture: picture,
                    prep_time: prep_hr * 60 + prep_min,
                    cook_time: cook_hr * 60 + cook_min,
                    direction: direction,
                    ingredient: ingredient_list,
                    date: new Date()
                };

                await Post.create(post, (err, result) => {
                    if (err) {
                        console.log(err);
                    } else {
                        res.redirect('/post/' + result._id);
                    }
                });
            } else {
                let path;
                
                // get user picture
                await User.findById(req.session._id ,(err, result) => {
                    path = result.picture_path;
                }).lean().exec();

                res.render('./create', {
                    post: req.body,
                    err: err,
                    path: path
                });
            }
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

            let user, followers, following, posts, path;

            // get user picture
            await User.findById(req.session._id, (err, result) => {
                path = result.picture_path;
            }).lean().exec();

            // get user details using id stored in session
            await User.findById(id, (err, result) => {
                user = result;
            }).lean().exec();

            // get number of followers
            await Follow.find({ following: id },(err, result) => {
                followers = result.length;
            }).lean().exec();

            // get number of following
            await Follow.find({ follower: id },(err, result) => {
                following = result.length;
            }).lean().exec();

            // get number of posts
            await Post.find( { user: id }, (err, result) => {
                posts = result.length;
            }).lean().exec();

            res.render('profile', {
                title: "ShefHub | " + id,
                user: user,
                followers: followers,
                following: following,
                post: posts,
                template: 'profile',
                path: path
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

            if (req.files && Object.keys(req.files).length > 0) {
                let pic = req.files.file;
                let uploadPath = './public/img/profile/' + req.session._id + '.jpg';

                pic.mv(uploadPath, (err) => {
                    if (err)
                        console.log('Upload failed');
                    else {
                        console.log(req.session._id + '.jpg uploaded successfully');
                        user['picture_path'] = uploadPath;
                    }
                });
            }

            await User.updateOne({_id: req.session._id}, user).exec();

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

            let path;
            // get user picture
            await User.findById(req.session._id ,(err, result) => {
                path = result.picture_path;
            }).lean().exec();

            res.render('profile', {
                user: { _id: id },
                path: path,
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
                    result.forEach(async (item) => {
                        let id = item.follower;
                        await User.findById(id, (err, result) => {
                            users.push(result);
                        }).lean().exec();
                    });
                }).lean().exec();
            } else {
                await Follow.find({follower: req.session._id}, 'following', (err, result) => {
                    result.forEach(async (item) => {
                        let id = item.following;
                        await User.findById(id, (err, result) => {
                            users.push(result);
                        }).lean().exec();
                    });
                }).lean().exec();
            }

            let path;

            // get user picture
            await User.findById(req.session._id ,(err, result) => {
                path = result.picture_path;
            }).lean().exec();

            res.render('profile', {
                user: { _id: req.session._id },
                title: "ShefHub | " + req.session._id,
                users: users,
                template: 'follow',
                path: path,
                route: route
            });
        });
    },

    getRecipe: (req, res) => {
        redirect(req, res, async () => {
            const id = req.params.id;
            let post, invalid = false;

            try {
                await Post.findById(id, (err, result) => {
                    if (!err) {
                        post = result;
                    }
                }).lean().exec();
            } catch (err) {
                invalid = true;
            }

            if (invalid || post == null) {
                res.redirect('/404NotFound');
                return;
            }

            let path, user;

            // get user picture
            await User.findById(req.session._id ,(err, result) => {
                user = result;
                path = result.picture_path;
            }).lean().exec();

            let comments;

            await Comment.find({recipe: post._id, reply_to: null}).sort({date: 1}).populate('user').lean().exec((err, results) => {
                let ctr = 0;
                comments = results;

                // get replies for each comment and append the array to the comment object
                comments.forEach(async e => {
                    await Comment.find({reply_to: e._id}, (err, replies) => {
                        e.replies = replies;
                    }).sort({date: 1}).populate('user').lean().exec();
                    ctr++;


                    if (ctr === results.length) {
                        res.render('post', {
                            title: 'ShefHub | ' + post.title,
                            post: post,
                            path: path,
                            user: user,
                            comments: comments
                        });
                    }
                });
            });
        });
    },

    getSearch: (req, res) => {
        redirect(req, res, async () => {
            const { keyword } = req.query

            let path;

            // get user picture
            await User.findById(req.session._id ,(err, result) => {
                path = result.picture_path;
            }).lean().exec();

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
                    results: results,
                    path: path
                });
            } else {
                res.render('search', {
                    title: 'ShefHub | Search Recipes',
                    path: path
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

            // deleete user's posts
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
