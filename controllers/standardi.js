
const Standardi = require('../models/standardi');

const formidable = require('formidable');
const slugify = require('slugify');
const stripHtml = require('string-strip-html');
const _ = require('lodash');
const { errorHandler } = require('../helpers/dbErrorHandler');
const fs = require('fs');
const { smartTrim } = require('../helpers/blog');

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
       
        let standardi = new Standardi();
      
        standardi.title = title;
        standardi.slug = slugify(title).toLowerCase();
        standardi.postedBy = req.auth._id;
        // categories and tag
 
        if (files.photo) {
            if (files.photo.size > 10000000) {
                return res.status(400).json({
                    error: 'Image should be less then 1mb in size'
                });
            }
           standardi.photo.data = fs.readFileSync(files.photo.path);
           standardi.photo.contentType = files.photo.type;
        }

       standardi.save((err, result) => {
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
   Standardi.find({})
  
        .populate('postedBy', '_id name username')
        .select('_id title slug postedBy createdAt updatedAt')
        //.sort({ createdAt: -1 })
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
 Standardi.findOne({ slug })
        .select('photo')
        .exec((err, standardi) => {
            if (err || !standardi) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.set('Content-Type', standardi.photo.contentType);
            return res.send(standardi.photo.data);
        });
};

exports.remove = (req, res) => {
    const slug = req.params.slug.toLowerCase();
 Standardi.findOneAndRemove({ slug }).exec((err, data) => {
        if (err) {
            return res.json({
                error: errorHandler(err)
            });
        }
        res.json({
            message: 'standardi deleted successfully'
        });
    });
};
