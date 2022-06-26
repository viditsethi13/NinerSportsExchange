const model = require('../models/user');
const Equipments = require('../models/equipments');
const Exchange = require('../models/exchange');


exports.new = (req, res)=>{
    res.render('./user/new');
};

exports.create = (req, res, next)=>{
    //res.send('Created a new story');
    let user = new model(req.body);//create a new story document
    user.save()//insert the document to the database
    .then(user=> {
        req.flash('success', 'You have successfully Signed Up');
        res.redirect('/users/login')
    })
    .catch(err=>{
        if(err.name === 'ValidationError' ) {
            req.flash('error', err.message);  
            return res.redirect('back');
        }

        if(err.code === 11000) {
            req.flash('error', 'Email has been used');  
            return res.redirect('/users/new');
        }
        
        next(err);
    });     
};

exports.getUserLogin = (req, res, next) => {
    res.render('./user/login');
}

exports.login = (req, res, next)=>{
    let email = req.body.email;
    let password = req.body.password;
    model.findOne({ email: email })
    .then(user => {
        if (!user) {
            console.log('wrong email address');
            req.flash('error', 'wrong email address');  
            res.redirect('/users/login');
            } else {
            user.comparePassword(password)
            .then(result=>{
                if(result) {
                    req.session.user = user._id;
                    console.log("logged in");
                    req.flash('success', 'You have successfully logged in');
                    res.redirect('/users/profile');
            } else {
                req.flash('error', 'wrong password');      
                res.redirect('/users/login');
            }
            });     
        }     
    })
    .catch(err => next(err));
};

exports.profile = (req, res, next)=>{
    let id = req.session.user;

    Promise.all([model.findById(id).populate('watchEquipments'),Equipments.find({owner:id})]) 
    .then((results)=>{
        const [user,equipments] = results;
        const watchEquipments = user.watchEquipments;
        let exchangeEquipments=new Array();
        
        if(equipments.length==0){
            return res.render('./user/profile', {user,equipments,watchEquipments,exchangeEquipments});
        }

        let exchangeableEquipments=new Array();
        equipments.forEach(equipment=>{
            if(equipment.exchanges!=null ){
                exchangeableEquipments.push(equipment.exchanges);
            }
        });

        let exchEquipments = new Array();
        exchangeableEquipments.forEach(equipment=>{
            var f1 = Exchange.findById(equipment).populate('equipment1').populate('equipment2').populate('owner')
            exchEquipments.push(f1);
        });
        Promise.all(exchEquipments)
        .then((result)=>{
            
            result.forEach(rr=>{
                if(rr){

                    exchangeEquipments.push(rr);
                }
            });
            res.render('./user/profile', {user,equipments,watchEquipments,exchangeEquipments});
        })
        .catch(err=>next(err));
    })
    .catch(err=>next(err));
};


exports.logout = (req, res, next)=>{
    req.session.destroy(err=>{
        if(err) 
           return next(err);
       else
            res.redirect('/');  
    });
   
 };

exports.exchange = (req, res, next)=>{
    let equipment1_id = req.body.equipment1_id;
    let equipment2_id = req.body.equipment2_id;
    let id = req.session.user;
    
    let newExchange = new Exchange({equipment1:equipment1_id, equipment2:equipment2_id, owner:id});
    newExchange.save()
    .then((exchange)=>{
        if(exchange){
            // console.log("Exchange "+ exchange);
            let trade_id = exchange._id;

            Promise.all([Equipments.findById(equipment1_id),Equipments.findById(equipment2_id)])
            .then((result)=>{
                const [equipment1,equipment2] = result;
                equipment1.status = "Pending";
                equipment1.exchanges = trade_id;
                equipment1.save();
                equipment2.status = "Pending";
                equipment2.exchanges = trade_id;
                equipment2.save();
                req.flash('success', 'You have successfully created an Exchange');
                return res.redirect('/users/profile');
            })
            .catch(err=>next(err));
        }
    })
    .catch(err=>next(err));
};

exports.manageOffer = (req, res, next) =>{
    let trade_id = req.params.id;
    let current_user = req.session.user;
    Exchange.findById(trade_id).populate('equipment1').populate('equipment2').populate('owner')
    .then((result)=>{
        let equipment1 = result.equipment1;
        let equipment2 = result.equipment2;
        let owner = result.owner;
        res.render('./user/manageOffer',{equipment1, equipment2, owner, current_user,trade_id});
    })
    .catch(err=>next(err));
};

exports.reject = (req, res, next) =>{
    let trade_id = req.params.id;
    Exchange.findById(trade_id).populate('equipment1').populate('equipment2').populate('owner')
    .then((result)=>{
        let equipment1_id = result.equipment1._id;
        let equipment2_id = result.equipment2._id;

        Promise.all([Equipments.findById(equipment1_id),Equipments.findById(equipment2_id)])
        .then((results)=>{
            const [equipment1,equipment2] = results;
            equipment1.status = "Available";
            equipment1.exchanges = null;
            equipment1.save();
            equipment2.status = "Available";
            equipment2.exchanges = null;
            equipment2.save();
            req.flash('success', 'You have rejected the Exchange');
            return res.redirect('/users/profile');
        })
        .catch(err=>next(err));
    })
    .catch(err=>next(err));
};

exports.accept = (req, res, next) =>{
    let trade_id = req.params.id;
    Exchange.findById(trade_id).populate('equipment1').populate('equipment2').populate('owner')
    .then((result)=>{
        let equipment1_id = result.equipment1._id;
        let equipment2_id = result.equipment2._id;

        Promise.all([Equipments.findById(equipment1_id),Equipments.findById(equipment2_id)])
        .then((results)=>{
            const [equipment1,equipment2] = results;
            equipment1.status = "Traded";
            equipment1.exchanges = null;
            equipment1.save();
            equipment2.status = "Traded";
            equipment2.exchanges = null;
            equipment2.save();
            req.flash('success', 'You have accepted the Exchange');
            return res.redirect('/users/profile');
        })
        .catch(err=>next(err));
    })
    .catch(err=>next(err));
};