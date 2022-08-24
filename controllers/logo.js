
const Logo = require('../models/logo');

const formidable = require('formidable');
const slugify = require('slugify');
const stripHtml = require('string-strip-html');
const _ = require('lodash');
const { errorHandler } = require('../helpers/dbErrorHandler');
const fs = require('fs');
const { smartTrim } = require('../helpers/recommended');

exports.create = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        console.log("fields, files => ", fields, files);
        if (err) {
            return res.status(400).json({
                error: 'Image could not upload'
            });
        }
        const photo=files;

        const { title } = fields;

        if (!title || !title.length) {
            return res.status(400).json({
                error: 'title is required'
            });
        }
       
        let logo = new Logo();
      
        logo.title = title;
        logo.slug = slugify(title).toLowerCase();
        logo.postedBy = req.auth._id;
        // categories and tag
 
        if (files.photo) {
            if (files.photo.size > 10000000) {
                return res.status(400).json({
                    error: 'Image should be less then 1mb in size'
                });
            }
           logo.photo.data = fs.readFileSync(files.photo.path);
           logo.photo.contentType = files.photo.type;
        }

       logo.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            // res.json(result);
    else {
                                    res.json(result ,files,fields );
                                }
                            }
                        );
                    
                }
            );

    };

// list, listAllBlogsCategoriesTags, read, remove, update

exports.list = (req, res) => {
   Logo.find({})
  
        .populate('postedBy', '_id name username')
        .select('_id title slug postedBy createdAt updatedAt')
       // .sort({ createdAt: -1 })
        .exec((err, data) => {
            if (err) {
                return res.json({
                    error: errorHandler(err)
                });
            }
            res.json(data);
        });
};
exports.photo = (req, res) => {
    const slug = req.params.slug.toLowerCase();
 Logo.findOne({ slug })
        .select('photo')
        .exec((err, logo) => {
            if (err || !logo) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.set('Content-Type', logo.photo.contentType);
            return res.send(logo.photo.data);
        });
};

exports.remove = (req, res) => {
    const slug = req.params.slug.toLowerCase();
 Logo.findOneAndRemove({ slug }).exec((err, data) => {
        if (err) {
            return res.json({
                error: errorHandler(err)
            });
        }
        res.json({
            message: 'logo deleted successfully'
        });
    });
};
