
const Zavod = require('../models/zavod');
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

     
        
          
        let zavod = new Zavod();
      
         zavod.title = title;
        zavod.titleEn=titleEn;
        zavod.titleSp=titleSp;
        zavod.bodySp = bodySp;
        zavod.bodyEn = bodyEn;
        zavod.bodyLat = bodyLat;
        zavod.excerpt = smartTrim(bodyLat, 260, ' ', ' ...');
        zavod.excerptEn = smartTrim(bodyEn, 260, ' ', ' ...');
        zavod.excerptSp = smartTrim(bodySp, 260, ' ', ' ...');
        zavod.slug = slugify(title).toLowerCase();
        zavod.mtitle = `${title} | ${process.env.APP_NAME}`;
        zavod.mdesc = smartTrim(bodyLat, 120, ' ', ' ...');
        zavod.postedBy = req.auth._id;
        // categories and tags
   
 
        if (files.photo) {
            if (files.photo.size > 30000000) {
                return res.status(400).json({
                    error: 'Image should be less then 1mb in size'
                });
            }
            zavod.photo.data = fs.readFileSync(files.photo.path);
            zavod.photo.contentType = files.photo.type;
        }

        zavod.save((err, result) => {
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

// list, listAllzavodsCategoriesTags, read, remove, update

exports.list = (req, res) => {
    Zavod.find({})
        .populate('categories', '_id name slug')
        .populate('tags', '_id name slug')
        .populate('postedBy', '_id name username')
        .select('_id title  slug excerpt  titleEn bodyLat titleSp bodyEn bodySp   excerptEn excerptSp   mdesc postedBy createdAt updatedAt')
     
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
    Zavod.findOne({ slug })
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
    Zavod.findOneAndRemove({ slug }).exec((err, data) => {
        if (err) {
            return res.json({
                error: errorHandler(err)
            });
        }
        res.json({
            message: 'zavod deleted successfully'
        });
    });
};

exports.update = (req, res) => {
    const slug = req.params.slug.toLowerCase();

    Zavod.findOne({ slug }).exec((err, oldZavod) => {
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

            let slugBeforeMerge = oldZavod.slug;
            oldZavod = _.merge(oldZavod, fields);
            oldZavod.slug = slugBeforeMerge;

            const { bodyLat,title, titleEn,bodyEn,bodySp,titleSp, categories, tags } = fields;

            if (bodyLat) {
                oldZavod.excerpt = smartTrim(bodyLat, 260, ' ', ' ...');
    
            }

            if (bodySp) {
                oldZavod.excerptSp = smartTrim(bodySp, 260, ' ', ' ...');
               
            }


            if (bodyEn) {
                oldZavod.excerptEn = smartTrim(bodyEn, 260, ' ', ' ...');
            
            }

            if (files.photo) {
                if (files.photo.size > 30000000) {
                    return res.status(400).json({
                        error: 'Image should be less then 1mb in size'
                    });
                }
                oldZavod.photo.data = fs.readFileSync(files.photo.path);
                oldZavod.photo.contentType = files.photo.type;
            }

            oldZavod.save((err, result) => {
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
    Zavod.findOne({ slug })
        .select('photo')
        .exec((err, zavod) => {
            if (err || !zavod) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.set('Content-Type', zavod.photo.contentType);
            return res.send(zavod.photo.data);
        });
};


//
