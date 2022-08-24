
const Laboratori = require('../models/laboratori');
const Category = require('../models/category');
const Tag = require('../models/tag');
const User = require('../models/user');
const formidable = require('formidable');
const slugify = require('slugify');
const stripHtml = require('string-strip-html');
const _ = require('lodash');
const { errorHandler } = require('../helpers/dbErrorHandler');
const fs = require('fs');
const { smartTrim } = require('../helpers/laboratori');

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

        const { title,titleEn,bodyEn,bodySp,bodyLat,titleSp } = fields;

        if (!title || !title.length) {
            return res.status(400).json({
                error: 'Naslov je obavezan '
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

 

        
        let laboratori = new Laboratori();
      
        laboratori.title = title;
       laboratori.titleEn=titleEn;
       laboratori.bodyLat=bodyLat;
       laboratori.titleSp=titleSp;
       laboratori.bodySp = bodySp;
       laboratori.bodyEn = bodyEn;
       laboratori.slug = slugify(title).toLowerCase();
       laboratori.mtitle = `${title} | ${process.env.APP_NAME}`;
       laboratori.mdesc = smartTrim(bodyLat, 160, ' ', ' ...');

        laboratori.postedBy = req.auth._id;
        // categories and tag
 
        if (files.photo) {
            if (files.photo.size > 30000000) {
                return res.status(400).json({
                    error: 'Image should be less then 3mb in size'
                });
            }
           laboratori.photo.data = fs.readFileSync(files.photo.path);
           laboratori.photo.contentType = files.photo.type;
        }

       laboratori.save((err, result) => {
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
   Laboratori.find({})
  
        .populate('postedBy', '_id name username')
        .select('_id title slug   titleEn bodyLat titleSp bodyEn bodySp postedBy createdAt updatedAt')
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

exports.listLaboratori = (req, res) => {
    let limit = req.bodyLat.limit ? parseInt(req.bodyLat.limit) : 10000;
    let skip = req.bodyLat.skip ? parseInt(req.bodyLat.skip) : 0;

    let laboratoris;


 Laboratori.find({})

        .populate('postedBy', '_id name username profile')
        .skip(skip)
        .limit(limit)
        .select('_id title  slug  titleEn bodyLat titleSp  bodyLat  postedBy createdAt updatedAt')
   
        .sort({ createdAt: -1 })

        .exec((err, data) => {
            if (err) {
                return res.json({
                    error: errorHandler(err)
                });
            }
           laboratoris = data; // blogs
            // get all categories
          
                    // return all blogs categories tags
                    res.json({ laboratoris,  size: laboratoris.length });
                });
         
};

exports.read = (req, res) => {
    const slug = req.params.slug.toLowerCase();
 Laboratori.findOne({ slug })
        // .select("-photo")

        .populate('postedBy', '_id name username')
        .select('_id title titleEn bodyLat titleSp bodySp bodyEn slug mtitle  postedBy createdAt updatedAt')
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
Laboratori.findOneAndRemove({ slug }).exec((err, data) => {
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

Laboratori.findOne({ slug }).exec((err, oldLaboratori) => {
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

            let slugBeforeMerge = oldLaboratori.slug;
            oldLaboratori = _.merge(oldLaboratori, fields);
            oldLaboratori.slug = slugBeforeMerge;

            const { bodyEn,title,titleEn ,bodyLat, titleSp,bodySp } = fields;


            if (files.photo) {
                if (files.photo.size > 10000000) {
                    return res.status(400).json({
                        error: 'Image should be less then 1mb in size'
                    });
                }
                oldLaboratori.photo.data = fs.readFileSync(files.photo.path);
                oldLaboratori.photo.contentType = files.photo.type;
            }

            oldLaboratori.save((err, result) => {
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
Laboratori.findOne({ slug })
        .select('photo')
        .exec((err, laboratori) => {
            if (err || !laboratori) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.set('Content-Type', laboratori.photo.contentType);
            return res.send(laboratori.photo.data);
        });
};


exports.listSearch = (req, res) => {
    console.log(req.query);
    const { search } = req.query;
    if (search) {
    Laboratori.find(
            {
                $or: [{ title: { $regex: search, $options: 'i' } }//, { bodyEn: { $regex: search, $options: 'i' } }
            ]
            },
            (err, blogs) => {
                if (err) {
                    return res.status(400).json({
                        error: errorHandler(err)
                    });
                }
                res.json(blogs);
            }
        ).sort({ createdAt: -1 })
        .select('-photo -bodyEn ');
        
    }
};

exports.listByUser = (req, res) => {
    User.findOne({ username: req.params.username }).exec((err, user) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        let userId = user._id;
     Laboratori.find({ postedBy: userId })
   
            .populate('postedBy', '_id name username')
            .select('_id title  slug titleEn bodyLat titleSp  postedBy createdAt updatedAt')
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
