let express = require('express');
let router = express.Router();
let auth = require('../config/auth');
let isAdmin = auth.isAdmin;


//get category model
let Category = require('../models/category');


//Get category index:
router.get('/', isAdmin, function (req, res) {
    Category.find(function (err, categories) {
        if (err) return console.log(err);
        res.render('admin/categories', {
            categories: categories
        });
    });

});

//Get add category:
router.get('/add-category', isAdmin, function (req, res) {

    let title = "";

    res.render('admin/add_category', {
        title: title,
    });

});

//Post add category:
router.post('/add-category', function (req, res) {

    req.checkBody('title', 'Title Must Have a Value.').notEmpty();


    let title = req.body.title;
    let slug = title.replace(/\s+/g, '-').toLowerCase();


    let errors = req.validationErrors();

    if (errors) {
        res.render('admin/add_category', {
            errors: errors,
            title: title
        });
    } else {
        Category.findOne({slug: slug}, function (err, category) {
            if (category) {
                req.flash('danger', 'Category title exists. Please choose another')
                res.render('admin/add_category', {
                    title: title
                });
            } else {
                let category = new Category({
                    title: title,
                    slug: slug
                });
                category.save(function (err) {
                    if (err) return console.log(err);

                    Category.find(function (err, categories) {
                        if (err) {
                            console.log(err)
                        } else {
                            req.app.locals.categories = categories;
                        }
                    });
                    req.flash('success', 'Category added!');
                    res.redirect('/admin/categories')
                });
            }
        });

    }
});


//Get Edit category:
router.get('/edit-category/:id', isAdmin, function (req, res) {

    Category.findById(req.params.id, function (err, category) {
        if (err) return console.log(err);

        res.render('admin/edit_category', {
            title: category.title,
            id: category._id
        });
    });

});

//Post edit category:
router.post('/edit-category/:id', function (req, res) {

    req.checkBody('title', 'Title Must Have a Value.').notEmpty();

    let title = req.body.title;
    let slug = title.replace(/\s+/g, '-').toLowerCase();
    let id = req.params.id;

    let errors = req.validationErrors();

    if (errors) {
        res.render('admin/edit_category', {
            errors: errors,
            title: title,
            id: id
        });
    } else {
        Category.findOne({slug: slug, _id: {"$ne": id}}, function (err, category) {
            if (category) {
                req.flash('danger', 'Category Title exists. Please choose another')
                res.render('admin/edit_category', {
                    title: title,
                    id: id
                });
            } else {

                Category.findById(id, function (err, category) {
                    if (err) console.log(err);

                    category.title = title;
                    category.slug = slug;

                    category.save(function (err) {
                        if (err) return console.log(err);

                        Category.find(function (err, categories) {
                            if (err) {
                                console.log(err)
                            } else {
                                req.app.locals.categories = categories;
                            }
                        });

                        req.flash('success', 'Category Edited!');
                        res.redirect('/admin/categories/edit-category/' + id)
                    });
                });

            }
        });

    }
});

//Get Delete category:
router.get('/delete-category/:id', isAdmin, function (req, res) {

    Category.findByIdAndRemove(req.params.id, function (err, page) {
        if (err) return console.log(err)

        Category.find(function (err, categories) {
            if (err) {
                console.log(err)
            } else {
                req.app.locals.categories = categories;
            }
        });

        req.flash('success', 'Category Deleted!');
        res.redirect('/admin/categories/')
    });
});

//Exports
module.exports = router;


