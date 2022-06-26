const model = require('../models/equipments.js');
const user = require('../models/user.js');
const Exchange = require('../models/exchange');

const mongoose = require('mongoose');

exports.index = (req, res,next)=>{
    //res.send('send all stories');
    model.find()
    .then((equipments)=>res.render('./exchange/index',{equipments}))
    .catch(err=>next(err));
};

exports.new = (req,res)=>{
	res.render('./exchange/newExchange');
};

exports.show = (req, res, next)=>{
    let id = req.params.id;
    Promise.all([model.findById(id).populate('owner','firstName lastName'), user.findById(req.session.user)])
    .then((results)=>{
        const [equipment,us] = results;
        if(equipment) {
            res.render('./exchange/exchange',{equipment,us});
        } 
        else {
            req.flash('error','Cannot find a equipment with id ' + id);
            return res.redirect('/');
        }
    })
    .catch(err=>next(err));

};

exports.edit = (req, res, next)=>{
    let id = req.params.id;

    model.findById(id)
    .then((equipment)=>{
        if(equipment) {
            res.render('./exchange/edit',{equipment});
        } 
        else {
            req.flash('error','Cannot find a equipment with id ' + id);
            return res.redirect('/');
        }
    })
    .catch(err => next(err));
};

exports.create = (req, res,next)=>{
    //res.send('Created a new story');
    let newEquipment = new model(req.body);
    newEquipment.owner = req.session.user;
    newEquipment.status = "Available";
    newEquipment.exchanges = null;
    newEquipment.save()
    .then((newEquipment)=>{
        req.flash('success', 'You have successfully set an equipment for trade');
        res.redirect('/exchange');
    })
    .catch(err=>{
        if(err.name === 'ValidationError'){
            req.flash('error',err.message);
            res.redirect('back');
        }
        next(err);
    });    
};


exports.delete = (req, res, next)=>{
    let id = req.params.id;
    model.findById(id)
    .then((equipment)=>{
        if(equipment){
            console.log("11");
            if(equipment.exchanges !=null){
                console.log("22");
                Exchange.findById(equipment.exchanges).populate('equipment1').populate('equipment2')
                .then((exchange)=>{
                    console.log("88");
                    console.log("exchange.equipment2._id: "+ exchange.equipment2._id);
                    console.log("exchange.equipment1._id: "+ exchange.equipment1._id); 
                    console.log("id: "+ id);     
                    if(id == exchange.equipment1._id){
                        console.log("same deleted")
                        Promise.all([model.findById(exchange.equipment2._id),model.findByIdAndDelete(id,{useFindAndModify: false})])
                        .then((results)=>{
                            const [equipment2,equipment] = results;
                            equipment2.status= "Available";
                            equipment2.exchanges = null;
                            equipment2.save();
                            req.flash('success', 'You have successfully deleted equipment');
                            res.redirect('/exchange');
                        })
                        .catch(err=>next(err));
                    } 
                    else{
                        console.log("other delete");
                        Promise.all([model.findById(exchange.equipment1._id),model.findByIdAndDelete(id,{useFindAndModify: false})])
                        .then((results)=>{
                            const [equipment1,equipment] = results;
                            equipment1.status= "Available";
                            equipment1.exchanges = null;
                            equipment1.save();
                            req.flash('success', 'You have successfully deleted equipment');
                            res.redirect('/exchange');
                        })
                        .catch(err=>next(err));
                    }
                    // res.redirect('/exchange');
                })
                .catch(err=>next(err));
                
            }
            else{
                console.log("33");
                model.findByIdAndDelete(id,{useFindAndModify: false})
                .then((equipment)=>{
                    console.log("44");
                    req.flash('success', 'You have successfully deleted equipment');
                    res.redirect('/exchange');
                })
                .catch(err=>next(err));
            }
        }
        else{
            req.flash('error','Cannot find a equipment with id ' + id);
            return res.redirect('/');
        }
    })
    .catch(err=>next(err));


    // model.findByIdAndDelete(id,{useFindAndModify: false})
    // .then((equipment)=>{
    //     if(equipment) {
    //         if(equipment.exchanges !=null){
    //             Exchange.findById(equipment.exchanges).populate('equipment1').populate('equipment2')
    //             .then((exchange)=>{
    //                 model.findById(exchange.equipment2._id)
    //                 .then((equp)=>{
    //                     equp.status= "Available";
    //                     equp.exchanges = null;
    //                     equp.save();
    //                 })
    //                 .catch(err=>next(err));
    //             })
    //             .catch(err=>next(err));
    //         }
    //         req.flash('success', 'You have successfully deleted equipment');
    //         res.redirect('/exchange');
    //     } 
    //     else {
	   //      req.flash('error','Cannot find a equipment with id ' + id);
    //         return res.redirect('/');
    //     }
    // })
    // .catch((err) =>next(err));
};


exports.update = (req, res, next)=>{
    let newEquipment = req.body;
    let id = req.params.id;


    model.findByIdAndUpdate(id,newEquipment,{useFindAndModify: false, runValidators: true})
    .then((newEquipment)=>{
        if(newEquipment) {
            req.flash('success', 'You have successfully updated equipment');
            res.redirect('/exchange/'+id);
        } 
        else {
            req.flash('error','Cannot find a equipment with id ' + id);
            return res.redirect('/');
        }
    })
    .catch((err) =>{
        if(err.name === 'ValidationError'){
            req.flash('error',err.message);
            res.redirect('back');
        }
        next(err);
    });
};

exports.watch = (req,res,next)=>{
    let user_id = req.session.user;
    let equipment_id = req.params.id;
    user.findOne({ _id: user_id })
    .then(user=>{
        if(user){
            let flag = 1;
            user.watchEquipments.forEach(equipment => {
                if(equipment == equipment_id){
                    flag = 0;
                    console.log("Found Delete");
                    
                    user.watchEquipments.pull(equipment_id);
                    req.flash('success', 'You have unwatched an equipment');
                }
            });
            if(flag == 1){
                console.log("Not Found Add");
                
                user.watchEquipments.push(equipment_id);
                req.flash('success', 'You have watched an equipment');
            }
            user.save();
        }
        else{
            console.log("User not found");
        }
    })
    .catch(err=>next(err));
    req.flash('success', 'You have watched/unwatched an equipment');
    return res.redirect('/users/profile');
};

exports.equipments = (req,res,next)=>{
    let user_id = req.session.user;
    let equipment2_id = req.params.id;
    model.find({owner:user_id})
    .then((equipments)=>{
        res.render('./user/equipments', {equipments,equipment2_id});
    })
    .catch(err=>{
        next(err);
    });
};