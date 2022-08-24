
const Cenovnik = require('../models/cenovnik');
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

 

        
        let cenovnik = new Cenovnik();
      
        cenovnik.title = title;
       cenovnik.titleEn=titleEn;
       cenovnik.bodyLat=bodyLat;
       cenovnik.titleSp=titleSp;
       cenovnik.bodySp = bodySp;
       cenovnik.bodyEn = bodyEn;
       cenovnik.slug = slugify(title).toLowerCase();
       cenovnik.mtitle = `${title} | ${process.env.APP_NAME}`;
       cenovnik.mdesc = smartTrim(bodyLat, 160, ' ', ' ...');

        cenovnik.postedBy = req.auth._id;
        // categories and tag
 
        if (files.photo) {
            if (files.photo.size > 10000000) {
                return res.status(400).json({
                    error: 'Image should be less then 1mb in size'
                });
            }
           cenovnik.photo.data = fs.readFileSync(files.photo.path);
           cenovnik.photo.contentType = files.photo.type;
        }

       cenovnik.save((err, result) => {
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
   Cenovnik.find({})
  
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

exports.listCenovnik = (req, res) => {
    let limit = req.bodyLat.limit ? parseInt(req.bodyLat.limit) : 10000;
    let skip = req.bodyLat.skip ? parseInt(req.bodyLat.skip) : 0;

    let cenovniks;


 Cenovnik.find({})

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
           cenovniks = data; // blogs
            // get all categories
          
                    // return all blogs categories tags
                    res.json({ cenovniks,  size: cenovniks.length });
                });
         
};

exports.read = (req, res) => {
    const slug = req.params.slug.toLowerCase();
 Cenovnik.findOne({ slug })
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
Cenovnik.findOneAndRemove({ slug }).exec((err, data) => {
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

Cenovnik.findOne({ slug }).exec((err, oldcenovnik) => {
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

            let slugBeforeMerge = oldcenovnik.slug;
            oldcenovnik = _.merge(oldcenovnik, fields);
            oldcenovnik.slug = slugBeforeMerge;

            const { bodyEn,title,titleEn ,bodyLat, titleSp,bodySp } = fields;


            if (files.photo) {
                if (files.photo.size > 10000000) {
                    return res.status(400).json({
                        error: 'Image should be less then 1mb in size'
                    });
                }
                oldcenovnik.photo.data = fs.readFileSync(files.photo.path);
                oldcenovnik.photo.contentType = files.photo.type;
            }

            oldcenovnik.save((err, result) => {
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
Cenovnik.findOne({ slug })
        .select('photo')
        .exec((err, cenovnik) => {
            if (err || !cenovnik) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.set('Content-Type', cenovnik.photo.contentType);
            return res.send(cenovnik.photo.data);
        });
};


exports.listSearch = (req, res) => {
    console.log(req.query);
    const { search } = req.query;
    if (search) {
    Cenovnik.find(
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
     Cenovnik.find({ postedBy: userId })
   
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
