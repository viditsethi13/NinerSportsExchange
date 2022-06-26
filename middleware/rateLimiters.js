const rateLimit = require("express-rate-limit");

exports.logInLimiter = rateLimit({
	windowMs: 60*1000,
	max: 5,
	handler: (req,res,next) =>{
		let err = new Error("Too Many login requests. Try again later");
		err.status = 429;
		return next(err);
	}
});

exports.SignUpLimiter = rateLimit({
	windowMs: 60*1000,
	max: 5,
	handler: (req,res,next) =>{
		let err = new Error("Too Many Sign Up requests. Try again later");
		err.status = 429;
		return next(err);
	}
});