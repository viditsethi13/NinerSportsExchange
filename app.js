const express = require('express');
const morgan = require('morgan');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');

const app = express();

let port = 8080;
let host = '0.0.0.0';

app.set('view engine', 'ejs');

//connect to Database
mongoose.connect('mongodb://localhost:27017/college', 
                {useNewUrlParser: true, useUnifiedTopology: true})
.then(()=>{
    //start app
    app.listen(port, host, ()=>{
        console.log('Server is running on port', port);
    });
})
.catch((err)=>console.log(err.message));

app.use(
    session({
        secret: "ajfeirf90aeu9eroejfoefj",
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({mongoUrl: 'mongodb://localhost:27017/college'}),
        cookie: {maxAge: 60*60*1000}
        })
);
app.use(flash());

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.errorMessages = req.flash('error');
    res.locals.successMessages = req.flash('success');
    next();
});

app.use(express.static('public'));
app.use(express.urlencoded({extended:true}));
app.use(morgan('tiny'));
app.use(methodOverride('_method'));


const exchangeRouter = require('./routes/exchangeRoutes.js');
const basicRouter = require('./routes/basicRoutes.js');
const userRoutes = require('./routes/userRoutes');

app.use('/exchange',exchangeRouter);
app.use('/users', userRoutes);
app.use('/',basicRouter);


app.use((req,res,next)=>{
	let err = new Error('The Server cannot locate '+ req.url);
	err.status = 404;
	next(err)
});

app.use((err,req,res,next)=>{
	console.log(err);
	if(!err.status){
		err.status = "500";
		err.message = "Internal Server Error";
	}
	res.status = err.status;
	res.render('error',{error:err});
});