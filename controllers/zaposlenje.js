
const Zaposlenje = require('../models/zaposlenje');
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

        const { title,titleEn,bodyEn,bodySp,bodyLat,titleSp,sifra,kraj,pocetak } = fields;

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

 

        
        let zaposlenje = new Zaposlenje();
      
        zaposlenje.title = title;
        zaposlenje.pocetak=pocetak;
        zaposlenje.kraj=kraj;
        zaposlenje.sifra=sifra;
       zaposlenje.titleEn=titleEn;
       zaposlenje.bodyLat=bodyLat;
       zaposlenje.titleSp=titleSp;
       zaposlenje.bodySp = bodySp;
       zaposlenje.bodyEn = bodyEn;
       zaposlenje.slug = slugify(title).toLowerCase();
       zaposlenje.mtitle = `${title} | ${process.env.APP_NAME}`;
  

        zaposlenje.postedBy = req.auth._id;
        // categories and tag
 
        if (files.photo) {
            if (files.photo.size > 40000000) {
                return res.status(400).json({
                    error: 'Image should be less then 1mb in size'
                });
            }
           zaposlenje.photo.data = fs.readFileSync(files.photo.path);
           zaposlenje.photo.contentType = files.photo.type;
        }

       zaposlenje.save((err, result) => {
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
   Zaposlenje.find({})
  
        .populate('postedBy', '_id name username')
        .select('_id title slug   titleEn bodyLat titleSp   pocetak kraj sifra bodyEn bodySp postedBy createdAt updatedAt')
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

exports.listzaposlenje = (req, res) => {
    let limit = req.bodyLat.limit ? parseInt(req.bodyLat.limit) : 10000;
    let skip = req.bodyLat.skip ? parseInt(req.bodyLat.skip) : 0;

    let zaposlenjes;


Zaposlenje.find({})

        .populate('postedBy', '_id name username profile')
        .skip(skip)
        .limit(limit)
        .select('_id title  slug pocetak kraj sifra titleEn bodyLat titleSp  bodyLat  postedBy createdAt updatedAt')
   
        .sort({ createdAt: -1 })

        .exec((err, data) => {
            if (err) {
                return res.json({
                    error: errorHandler(err)
                });
            }
           zaposlenjes = data; // blogs
            // get all categories
          
                    // return all blogs categories tags
                    res.json({ zaposlenjes,  size: zaposlenjes.length });
                });
         
};

exports.read = (req, res) => {
    const slug = req.params.slug.toLowerCase();
 Zaposlenje.findOne({ slug })
        // .select("-photo")

        .populate('postedBy', '_id name username')
        .select('_id title titleEn bodyLat titleSp bodySp bodyEn slug mtitle  pocetak kraj sifra  postedBy createdAt updatedAt')
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
Zaposlenje.findOneAndRemove({ slug }).exec((err, data) => {
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

Zaposlenje.findOne({ slug }).exec((err, oldZaposlenje) => {
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

            let slugBeforeMerge = oldZaposlenje.slug;
            oldZaposlenje = _.merge(oldZaposlenje, fields);
            oldZaposlenje.slug = slugBeforeMerge;

            const { bodyEn,title,titleEn ,bodyLat, titleSp,bodySp ,pocetak, kraj, sifra } = fields;


            if (files.photo) {
                if (files.photo.size > 10000000) {
                    return res.status(400).json({
                        error: 'Image should be less then 1mb in size'
                    });
                }
                oldZaposlenje.photo.data = fs.readFileSync(files.photo.path);
                oldZaposlenje.photo.contentType = files.photo.type;
            }

            oldZaposlenje.save((err, result) => {
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
Zaposlenje.findOne({ slug })
        .select('photo')
        .exec((err, zaposlenje) => {
            if (err || !zaposlenje) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.set('Content-Type', zaposlenje.photo.contentType);
            return res.send(zaposlenje.photo.data);
        });
};


exports.listSearch = (req, res) => {
    console.log(req.query);
    const { search } = req.query;
    if (search) {
    Zaposlenje.find(
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
     Zaposlenje.find({ postedBy: userId })
   
            .populate('postedBy', '_id name username')
            .select('_id title  slug titleEn bodyLat titleSp pocetak kraj sifra  postedBy createdAt updatedAt')
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
