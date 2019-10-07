let express = require('express');
let router = express.Router();
let auth = require('../config/auth');
let isAdmin = auth.isAdmin;

//get page model
let Page = require('../models/page');

//Get pages index:
router.get('/', isAdmin, function (req, res) {

    Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
        res.render('admin/pages', {
            pages: pages
        });
    });

});

//Get add page:
router.get('/add-page', isAdmin, function (req, res) {

    let title = "";
    let slug = "";
    let content = "";

    res.render('admin/add_page', {
        title: title,
        slug: slug,
        content: content
    });

});

//Post add page:
router.post('/add-page', function (req, res) {

    req.checkBody('title', 'Title Must Have a Value.').notEmpty();
    req.checkBody('content', 'Content Must Have a Value.').notEmpty();

    let title = req.body.title;
    let slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if (slug == "") slug = title.replace(/\s+/g, '-').toLowerCase();
    let content = req.body.content;

    let errors = req.validationErrors();

    if (errors) {
        res.render('admin/add_page', {
            errors: errors,
            title: title,
            slug: slug,
            content: content
        });
    } else {
        Page.findOne({slug: slug}, function (err, page) {
            if (page) {
                req.flash('danger', 'Page slug exists. Please choose another')
                res.render('admin/add_page', {
                    title: title,
                    slug: slug,
                    content: content
                });
            } else {
                let page = new Page({
                    title: title,
                    slug: slug,
                    content: content,
                    sorting: 100
                });
                page.save(function (err) {
                    if (err) return console.log(err);

                    Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
                        if (err) {
                            console.log(err)
                        } else {
                            req.app.locals.pages = pages;
                        }
                    });

                    req.flash('success', 'Page added!');
                    res.redirect('/admin/pages')
                });
            }
        });

    }
});

//Sort pages Func
function sortPages(ids, callback) {
    let count = 0;

    for (let i = 0; i < ids.length; i++) {
        let id = ids[i];
        count++;

        //Closure, Node js is Async
        (function (count) {
            Page.findById(id, function (err, page) {
                page.sorting = count;
                page.save(function (err) {
                    if (err) return console.log(err);
                    ++count;
                    if (count >= ids.length) {
                        callback();
                    }
                })
            })
        })(count);
    }
}

//post reorder pages :
router.post('/reorder-pages', function (req, res) {

    let ids = req.body['id[]'];

    sortPages(ids, function () {
        Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
            if (err) {
                console.log(err)
            } else {
                req.app.locals.pages = pages;
            }
        });
    });
});

//Get Edit page:
router.get('/edit-page/:id', isAdmin, function (req, res) {

    Page.findById(req.params.id, function (err, page) {
        if (err) return console.log(err);

        res.render('admin/edit_page', {
            title: page.title,
            slug: page.slug,
            content: page.content,
            id: page._id
        });
    });

});

//Post edit page:
router.post('/edit-page/:id', function (req, res) {

    req.checkBody('title', 'Title Must Have a Value.').notEmpty();
    req.checkBody('content', 'Content Must Have a Value.').notEmpty();

    let title = req.body.title;
    let slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if (slug == "") slug = title.replace(/\s+/g, '-').toLowerCase();
    let content = req.body.content;
    let id = req.params.id;

    let errors = req.validationErrors();

    if (errors) {
        res.render('admin/edit_page', {
            errors: errors,
            title: title,
            slug: slug,
            content: content,
            id: id
        });
    } else {
        Page.findOne({slug: slug, _id: {"$ne": id}}, function (err, page) {
            if (page) {
                req.flash('danger', 'Page slug exists. Please choose another')
                res.render('admin/edit_page', {
                    title: title,
                    slug: slug,
                    content: content,
                    id: id
                });
            } else {

                Page.findById(id, function (err, page) {
                    if (err) console.log(err);

                    page.title = title;
                    page.slug = slug;
                    page.content = content;

                    page.save(function (err) {
                        if (err) return console.log(err);
                        //Update on front end
                        Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
                            if (err) {
                                console.log(err)
                            } else {
                                req.app.locals.pages = pages;
                            }
                        });

                        req.flash('success', 'Page Edited!');
                        res.redirect('/admin/pages/edit-page/' + id)
                    });
                });

            }
        });

    }
});

//Get Delete Page:
router.get('/delete-page/:id',isAdmin, function (req, res) {

    Page.findByIdAndRemove(req.params.id, function (err) {
        if (err) return console.log(err);

        Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
            if (err) {
                console.log(err)
            } else {
                req.app.locals.pages = pages;
            }
        });

        req.flash('success', 'Page Deleted!');
        res.redirect('/admin/pages/')
    });
});

//Exports
module.exports = router;


