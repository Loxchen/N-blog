
/*
 * GET home page.
 */
var crypto = require('crypto'),
	User = require('../models/user'),
	Post = require('../models/post');

module.exports = function(app) {
	app.get('/', function(req, res) {
		Post.find({ }, function(err, posts) {
			if (err) {
				posts = [];
			}
			res.render('index', { 
				title: '主页',
				user_id: req.session.user_id,
				posts: posts,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});

	app.get('/reg', checkNotLogin);
	app.get('/reg', function(req, res) {
		res.render('reg', { 
			title: '注册',
			user_id: req.session.user_id,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});

	app.post('/reg', checkNotLogin);
	app.post('/reg', function(req, res) {
		var name = req.body.name,
			password = req.body.password,
			password_re = req.body['password-repeat'];
		if (password_re !== password) {
			req.flash('error', '两次输入的密码不一致!');
			return res.redirect('/reg');
		}

		// md5 - update()添加数据 before digest加密数据并返回，清空md5
		var md5 = crypto.createHash('md5'),
			password = md5.update(req.body.password).digest('base64');
		var newUser = new User({
			name: name,
			password: password,
			email: req.body.email
		});

		// 添加用户
		User.findOne({'name': name}, function(err, user) {
			if(user) {
				req.flash('error', '用户已存在!');
				return res.redirect('/reg');
			}
			newUser.save(function(err) {
				if(err) {
					req.flash('error', err);
					return res.redirect('/reg');
				}
				req.session.user_id = user._id;
				req.flash('success', '注册成功');
				res.redirect('/');
			});
		});
	});

	app.get('/login', checkNotLogin);
	app.get('/login', function(req, res) {
		res.render('login', { 
			title: '登录',
			user_id: req.session.user_id,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});

	app.post('/login', checkNotLogin);
	app.post('/login', function(req, res) {
		// 生成密码的md5值
		var md5 = crypto.createHash('md5'),
			password = md5.update(req.body.password).digest('base64');
		// 检查用户是否存在
		User.findOne({'name': req.body.name}, function(err, user) {
			if(!user) {
				req.flash('error', '用户不存在!');
				return res.redirect('/login');
			}
			if (user.password != password) {
				req.flash('error', '密码错误!');
				return res.redirect('/login');
			}
			req.session.user_id = user._id;
			req.flash('success', '登录成功!');
			res.redirect('/');
		});

	});

	app.get('/post', checkLogin);
	app.get('/post', function(req, res) {
		res.render('post', { 
			title: '发表',
			user_id: req.session.user_id,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});

	// Usages of middleware
	app.post('/post', checkLogin, getUserSession);
	//app.post('/post', getUserSession);
	app.post('/post', function(req, res) {
		var post = new Post({
			name: req.user.name, //use session in req.user
			title: req.body.title,
			post: req.body.post
		});

		post.save(function(err){
			if (err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			req.flash('success', '发布成功!');
			res.redirect('/');
		});

	});
	
	app.get('/logout', checkLogin);
	app.get('/logout', function(req, res) {
		req.session.user_id = null;
		req.flash('success', '登出成功!');
		res.redirect('/');
	});

	// Middlewares
	function checkLogin(req, res, next) {
		if (!req.session.user_id) {
			req.flash('error', '未登录!');
			res.redirect('/login');
		}
		next();
	}

	function checkNotLogin(req, res, next) {
		if (req.session.user_id) {
			req.flash('error', '已登录');
			res.redirect('back'); // go back to HTTP referrer
		}
		next();
	}

	// middelware to restore user from mongodb to req.user
	function getUserSession(req, res, next) {
		if (req.session.user_id) {
			User.findById(req.session.user_id, function(err, user) {
				if (!err && user) {
					req.user = user;
					next();
				} else {
					next(new Error('Could not restore user from session!'));
				}
			});
		}
	}
};
