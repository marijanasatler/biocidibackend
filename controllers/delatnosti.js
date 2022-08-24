
const Delatnosti = require('../models/delatnosti');
const Category = require('../models/category');
const Tag = require('../models/tag');
const User = require('../models/user');
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

        const { title, bodyLat, titleEn,bodyEn,bodySp,titleSp } = fields;

        if (!title || !title.length) {
            return res.status(400).json({
                error: 'title is required'
            });
        }
        if (!titleSp || !titleSp.length) {
            return res.status(400).json({
                error: 'Naslov na cirilici je obavezan'
            });
        }
        if (!titleEn || !titleEn.length) {
            return res.status(400).json({
                error: 'Naslov na engleskom je obavezan'
            });
        }


        if (!bodyLat || bodyLat.length < 200) {
            return res.status(400).json({
                error: 'Content is too short'
            });
        }

     
        
          
        let delatnosti = new Delatnosti();
      
         delatnosti.title = title;
        delatnosti.titleEn=titleEn;
        delatnosti.titleSp=titleSp;
        delatnosti.bodySp = bodySp;
        delatnosti.bodyEn = bodyEn;
        delatnosti.bodyLat = bodyLat;
        delatnosti.excerpt = smartTrim(bodyLat, 260, ' ', ' ...');
        delatnosti.excerptEn = smartTrim(bodyEn, 260, ' ', ' ...');
        delatnosti.excerptSp = smartTrim(bodySp, 260, ' ', ' ...');
        delatnosti.slug = slugify(title).toLowerCase();
        delatnosti.mtitle = `${title} | ${process.env.APP_NAME}`;
        delatnosti.mdesc = smartTrim(bodyLat, 120, ' ', ' ...');
        delatnosti.postedBy = req.auth._id;
        // categories and tags
   
 
        if (files.photo) {
            if (files.photo.size > 10000000) {
                return res.status(400).json({
                    error: 'Image should be less then 1mb in size'
                });
            }
            delatnosti.photo.data = fs.readFileSync(files.photo.path);
            delatnosti.photo.contentType = files.photo.type;
        }

        delatnosti.save((err, result) => {
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

// list, listAlldelatnostisCategoriesTags, read, remove, update

exports.list = (req, res) => {
    Delatnosti.find({})
        .populate('categories', '_id name slug')
        .populate('tags', '_id name slug')
        .populate('postedBy', '_id name username')
        .select('_id title  slug excerpt  titleEn bodyLat titleSp bodyEn bodySp   excerptEn excerptSp   mdesc postedBy createdAt updatedAt')
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



exports.read = (req, res) => {
    const slug = req.params.slug.toLowerCase();
    Delatnosti.findOne({ slug })
        // .select("-photo")

        .populate('postedBy', '_id name username')
        .select('_id title slug titleEn bodyLat titleSp bodyEn bodySp  mtitle mdesc  postedBy createdAt updatedAt')
        .sort({ createdAt: -1 })
        .exec((err, data) => {
            if (err) {
                return res.json({
                    error: errorHandler(err)
                });
            }
            res.json(data);
        });
};

exports.remove = (req, res) => {
    const slug = req.params.slug.toLowerCase();
    Delatnosti.findOneAndRemove({ slug }).exec((err, data) => {
        if (err) {
            return res.json({
                error: errorHandler(err)
            });
        }
        res.json({
            message: 'delatnosti deleted successfully'
        });
    });
};

exports.update = (req, res) => {
    const slug = req.params.slug.toLowerCase();

    Delatnosti.findOne({ slug }).exec((err, oldDelatnosti) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }

        let form = new formidable.IncomingForm();
        form.keepExtensions = true;

        form.parse(req, (err, fields, files) => {
            if (err) {
                return res.status(400).json({
                    error: 'Image could not upload'
                });
            }

            let slugBeforeMerge = oldDelatnosti.slug;
            oldDelatnosti = _.merge(oldDelatnosti, fields);
            oldDelatnosti.slug = slugBeforeMerge;

            const { bodyLat,title, titleEn,bodyEn,bodySp,titleSp, categories, tags } = fields;

            if (bodyLat) {
                oldDelatnosti.excerpt = smartTrim(bodyLat, 260, ' ', ' ...');
    
            }

            if (bodySp) {
                oldDelatnosti.excerptSp = smartTrim(bodySp, 260, ' ', ' ...');
               
            }


            if (bodyEn) {
                oldDelatnosti.excerptEn = smartTrim(bodyEn, 260, ' ', ' ...');
            
            }

            if (files.photo) {
                if (files.photo.size > 10000000) {
                    return res.status(400).json({
                        error: 'Image should be less then 1mb in size'
                    });
                }
                oldDelatnosti.photo.data = fs.readFileSync(files.photo.path);
                oldDelatnosti.photo.contentType = files.photo.type;
            }

            oldDelatnosti.save((err, result) => {
                if (err) {
                    return res.status(400).json({
                        error: errorHandler(err)
                    });
                }
                // result.photo = undefined;
                res.json(result);
            });
        });
    });
};

exports.photo = (req, res) => {
    const slug = req.params.slug.toLowerCase();
    Delatnosti.findOne({ slug })
        .select('photo')
        .exec((err, delatnosti) => {
            if (err || !delatnosti) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.set('Content-Type', delatnosti.photo.contentType);
            return res.send(delatnosti.photo.data);
        });
};


//
