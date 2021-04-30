const User = require('../models/user');
const Follow = require('../models/follow');
const Post = require('../models/recipe');

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
        let user, friends = [], posts = [];

        // get user
        await User.findById(req.session._id ,(err, result) => {
            user = result;
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
        await Post.find({user_id: {$in: friends}}, (err, result) => {
            if (err) {
                console.log(err);
            } else {
                posts = result;
            }
        }).sort({ date: -1 }).lean().exec();

        res.render('newsfeed', {
            title: 'ShefHub | Home',
            post: posts,
            user: user
        });
    },

    getCreate: (req, res) => {
        redirect(req, res, async () => {
            let user;

            // get user
            await User.findById(req.session._id ,(err, result) => {
                user = result;
            }).lean().exec();

            res.render('create', {
                title: 'Create a new recipe',
                user: user
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
                    user_id: req.session._id,
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
                let user;
                
                // get user
                await User.findById(req.session._id ,(err, result) => {
                    user = result;
                }).lean().exec();

                res.render('./create', {
                    post: req.body,
                    err: err,
                    user: user
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

            let user, followers, following, posts;

            // get user details using id stored in session
            await User.findById(id ,(err, result) => {
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
            await Post.find( { user_id: id }, (err, result) => {
                posts = result.length;
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

            // TODO: verify info and update profile in db
            const { email, password, profession, workplace, desc } = req.body;
            let user = {
                email: email,
                password: password,
                profession: profession,
                workplace: workplace,
                desc: desc
            };

            await User.updateOne({_id: req.session._id}, user).lean().exec();

            res.redirect('/profile');
        });
    },

    getPosts: (req, res) => {
        redirect(req, res, async () => {
            let id = req.params.id;

            if (id == null) {
                id = req.session._id;
            } else if (id === req.session._id) {
                res.redirect('/posts');
                return;
            }

            let posts;
            await Post.find( { user_id: id }, (err, result) => {
               posts = result;
            }).lean().exec();

            let user;
            // get user
            await User.findById(req.session._id ,(err, result) => {
                user = result;
            }).lean().exec();

            res.render('profile', {
                user: user,
                title: "ShefHub | " + req.session._id,
                posts: posts,
                template: 'posts'
            });
        });
    },

    getLikes: (req, res) => {
        redirect(req, res, async () => {

        });
    },

    getFollow: (req, res) => {
        redirect(req, res, async () => {
            let users = [];
            const path = req.path.replace('/', '');

            if (path === 'followers') {
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

            let user;
            // get user
            await User.findById(req.session._id ,(err, result) => {
                user = result;
            }).lean().exec();

            res.render('profile', {
                user: user,
                title: "ShefHub | " + req.session._id,
                users: users,
                template: 'follow',
                path: path
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

            let user;
            // get user
            await User.findById(req.session._id ,(err, result) => {
                user = result;
            }).lean().exec();

            res.render('post', {
                title: 'ShefHub | ' + post.title,
                post: post,
                user: user
            });
        });
    },

    getSearch: (req, res) => {
        redirect(req, res, async () => {
            const { keyword } = req.query

            let user;
            // get user
            await User.findById(req.session._id ,(err, result) => {
                user = result;
            }).lean().exec();

            if (keyword) {
                let results;
                const pattern = new RegExp(keyword, 'i');

                // query
                await Post.find({title: {$regex: pattern} },(err, result) => {
                    results = result;
                }).lean().exec();

                res.render('query', {
                    title: 'Shefhub Search | ' + keyword,
                    query: keyword,
                    results: results,
                    user: user
                });
            } else {
                res.render('search', {
                    title: 'ShefHub | Search Recipes',
                    user: user
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

    getCheckPassword: async (req, res) => {
        let password = req.query.password;
        let _id = req.session._id;

        await User.findOne({_id: _id, password: password}, null, null, (err, result) => {
            if (result !== null)
                res.send('good');
            else
                res.send(result);
        }).lean().exec();
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
            console.log(result);
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
    }
}

module.exports = user_controller;
