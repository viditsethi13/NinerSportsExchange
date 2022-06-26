const Equipments = require('../models/equipments');

exports.isGuest = (req,res,next)=>{
	if(!req.session.user){
        next();
    }
    else{
        req.flash('error','You are already logged in');
        return res.redirect('/users/profile');
    }
};

exports.isLoggedIn = (req,res,next)=>{
	if(req.session.user){
        next();
    }
    else{
        req.flash('error','You need to Log In first');
        return res.redirect('/users/login');
    }
};

exports.isOwner = (req,res,next)=>{
    let id = req.params.id;
    Equipments.findById(id)
    .then(equipments=>{
        if(equipments){
            if(equipments.owner == req.session.user){
                next();
            }
            else{
                req.flash('error','Unauthorized to access to the Resource');
                return res.redirect('/');
            }
        }

    })
    .catch(err=>next(err));
};