
const Pocetna = require('../models/pocetna');
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

        const { title,titleEn,bodyEn,bodySp,bodyLat,titleSp,titleLat,linkRef,linkRefSp,linkRefEn,videoLink  } = fields;

        if (!title || !title.length) {
            return res.status(400).json({
                error: 'Naslov je obavezan '
            });
        }

 

        
        let pocetna = new Pocetna();
      
        pocetna.title = title;
pocetna.titleLat=titleLat;
       pocetna.titleEn=titleEn;
       pocetna.bodyLat=bodyLat;
       pocetna.titleSp=titleSp;
       pocetna.bodySp = bodySp;
       pocetna.bodyEn = bodyEn;
      pocetna.linkRef=linkRef;
      pocetna.linkRefSp=linkRefSp;
      pocetna.videoLink=videoLink;
      pocetna.linkRefEn=linkRefEn;
       pocetna.slug = slugify(title).toLowerCase();


        pocetna.postedBy = req.auth._id;
        // categories and tag
 
        if (files.photo) {
            if (files.photo.size > 30000000) {
                return res.status(400).json({
                    error: 'Image should be less then 3mb in size'
                });
            }
           pocetna.photo.data = fs.readFileSync(files.photo.path);
           pocetna.photo.contentType = files.photo.type;
        }

       pocetna.save((err, result) => {
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

// list, listAllpocetnasCategoriesTags, read, remove, update

exports.list = (req, res) => {
   Pocetna.find({})
  
        .populate('postedBy', '_id name username')
        .select('_id title slug linkRef linkRefEn LinkRefSp    titleEn bodyLat videoLink  titleLat titleSp bodyEn bodySp postedBy createdAt updatedAt')
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



exports.listAllPocetna = (req, res) => {
    let limit = req.body.limit ? parseInt(req.body.limit) : 10000;
    let skip = req.body.skip ? parseInt(req.body.skip) : 0;

    let pocetnas;

    
  Pocetna.find({})

        .populate('postedBy', '_id name username profile')
        .skip(skip)
        .limit(limit)
        .select('_id title  titleEn bodyLat titleSp bodyEn bodySp slug postedBy createdAt updatedAt')
   
      //  .sort({ createdAt: -1 })

        .exec((err, data) => {
            if (err) {
                return res.json({
                    error: errorHandler(err)
                });
            }
            pocetnas = data; // pocetnas
            // get all categories
        
            // categories
                // get all tags
              
                    // return all pocetnas categories tags
                    res.json({ pocetnas,  size: pocetnas.length });
                });
           
       
};




exports.read = (req, res) => {
    const slug = req.params.slug.toLowerCase();
 Pocetna.findOne({ slug })
        // .select("-photo")

        .populate('postedBy', '_id name username')
        .select('_id title titleEn bodyLat titleSp bodySp bodyEn titleLat videoLink slug mtitle  postedBy createdAt updatedAt')
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
Pocetna.findOneAndRemove({ slug }).exec((err, data) => {
        if (err) {
            return res.json({
                error: errorHandler(err)
            });
        }
        res.json({
            message: 'Add deleted successfully'
        });
    });
};

exports.update = (req, res) => {
    const slug = req.params.slug.toLowerCase();

Pocetna.findOne({ slug }).exec((err, oldpocetna) => {
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

            let slugBeforeMerge = oldpocetna.slug;
            oldpocetna = _.merge(oldpocetna, fields);
            oldpocetna.slug = slugBeforeMerge;

            const { bodyEn,title,titleEn ,bodyLat, titleSp,bodySp,titleLat,videoLink } = fields;


            if (files.photo) {
                if (files.photo.size > 10000000) {
                    return res.status(400).json({
                        error: 'Image should be less then 1mb in size'
                    });
                }
                oldpocetna.photo.data = fs.readFileSync(files.photo.path);
                oldpocetna.photo.contentType = files.photo.type;
            }

            oldpocetna.save((err, result) => {
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
Pocetna.findOne({ slug })
        .select('photo')
        .exec((err, pocetna) => {
            if (err || !pocetna) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.set('Content-Type', pocetna.photo.contentType);
            return res.send(pocetna.photo.data);
        });
};




exports.listByUser = (req, res) => {
    User.findOne({ username: req.params.username }).exec((err, user) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        let userId = user._id;
     Pocetna.find({ postedBy: userId })
   
            .populate('postedBy', '_id name username')
            .select('_id title  slug titleEn bodyLat titleSp videoLink titleLat postedBy createdAt updatedAt')
            .sort({ createdAt: -1 })
            .exec((err, data) => {
                if (err) {
                    return res.status(400).json({
                        error: errorHandler(err)
                    });
                }
                res.json(data);
            });
    });
};
