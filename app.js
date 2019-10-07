let express = require('express');
let path = require('path');
let mongoose = require('mongoose');
let config = require("./config/database");
let bodyParser = require('body-parser');
let session = require('express-session');
let expressValidator = require('express-validator');
let fileUpload = require('express-fileupload')
let passport = require('passport');


//connect to db
mongoose.connect(config.database, {useNewUrlParser: true});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("Connected to mongodb");
});


//Init app
let app = express();

//View Engine Set up
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//set public folder

app.use(express.static(path.join(__dirname, 'public')));

//Set global errors var
app.locals.errors = null;

//Get Page Model
let Page = require('./models/page');

//Get All pages to pass to header.ejs
Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
  if (err){
      console.log(err)
  } else {
      app.locals.pages = pages;
  }
});

//Get Category Model
let Category = require('./models/category');

//Get All Categories to pass to header.ejs
Category.find(function (err, categories) {
    if (err){
        console.log(err)
    } else {
        app.locals.categories = categories;
    }
});

//Express file upload Middlewear
app.use(fileUpload());

//Body parser
//
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));
// parse application/json
app.use(bodyParser.json());

//Express Session
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    // cookie: { secure: true }
}));


//Express Validator Middlewear
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        let namespace = param.split('.'),
            root = namespace.shift(),
            formParam = root;
        while (namespace.lenght) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    },
    customValidators: {
        isImage: function (value, filename) {
            let extension = (path.extname(filename)).toLowerCase();
            switch (extension) {
                case '.jpg':
                    return '.jpg';
                case '.jpeg':
                    return '.jpeg';
                case '.png':
                    return '.png';
                case '':
                    return '.jpg';
                default:
                    return false;
            }
        }
    }

}));


//Express Messages
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

//Passport config
require('./config/passport')(passport);
//Passport Middlewear
app.use(passport.initialize());
app.use(passport.session());

app.get('*',function (req,res,next) {
    res.locals.cart = req.session.cart;
    res.locals.user = req.user || null;
    next();
});

//Set Routes
let pages = require('./routes/pages.js');
let products = require('./routes/products.js');
let cart = require('./routes/cart.js');
let users = require('./routes/users.js');
let adminPages = require('./routes/admin_pages.js');
let adminCategories = require('./routes/admin_categories.js');
let adminProducts = require('./routes/admin_products.js');


app.use('/admin/pages', adminPages);
app.use('/admin/categories', adminCategories);
app.use('/admin/products', adminProducts);
app.use('/products', products);
app.use('/cart', cart);
app.use('/users', users);
app.use('/', pages);


//Start the server
let port = 3500;
app.listen(port, function () {

    console.log('Server started on port:' + port)

});