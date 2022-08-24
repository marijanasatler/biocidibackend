
const Preparati = require('../models/preparati');
const Categorypreparati = require('../models/categorypreparati');

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
                error: 'FAJL NEMOZE BITI DODAT'
            });
        }
        const photo=files;

        const { title, categoriespreparati, titleEn,titleSp } = fields;

        if (!title || !title.length) {
            return res.status(400).json({
                error: 'NASLOV NA LATINICI JE OBAVEZAN'
            });
        }
    

     
        if (!categoriespreparati || categoriespreparati.length === 0) {
            return res.status(400).json({
                error: 'BAREM JEDNA KATEGORIJA JE OBAVEZNA'
            });
        }

        
          
        let preparati = new Preparati();
      
         preparati.title = title;
        preparati.titleEn=titleEn;
        preparati.titleSp=titleSp;
   
        preparati.slug = slugify(title).toLowerCase();
        preparati.mtitle = `${title} | ${process.env.APP_NAME}`;
  
        preparati.postedBy = req.auth._id;
        // categoriespreparati and tags
        let arrayOfCategoriespreparati = categoriespreparati && categoriespreparati.split(',');
 
 
        if (files.photo) {
            if (files.photo.size > 10000000) {
                return res.status(400).json({
                    error: 'Image should be less then 1mb in size'
                });
            }
            preparati.photo.data = fs.readFileSync(files.photo.path);
            preparati.photo.contentType = files.photo.type;
        }

        preparati.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            // res.json(result);
            Preparati.findByIdAndUpdate(result._id, { $push: { categoriespreparati: arrayOfCategoriespreparati } }, { new: true }).exec(
                (err, result) => {
                    if (err) {
                        return res.status(400).json({
                            error: errorHandler(err)
                        });
                    } else {
                                    res.json(result //,files,fields
                                        );
                        
                    }
                }
            );
        });
    });
    };

// list, listAllpreparatisCategoriespreparatiTags, read, remove, update

exports.list = (req, res) => {
    Preparati.find({})
        .populate('categoriespreparati', '_id name slug')

        .populate('postedBy', '_id name username')
        .select('_id title  slug titleEn titleSp  categoriespreparati postedBy createdAt updatedAt')
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

exports.listAllPreparati = (req, res) => {
    let limit = req.body.limit ? parseInt(req.body.limit) : 10000;
    let skip = req.body.skip ? parseInt(req.body.skip) : 0;

    let preparatis;
    let categoriespreparati;

    Preparati.find({})
        .populate('categoriespreparati', '_id name slug')
      
        .populate('postedBy', '_id name username profile')
        .skip(skip)
        .limit(limit)
        .select('_id title  titleEn  titleSp  slug desc  categoriespreparati  postedBy createdAt updatedAt')
   
        .sort({ createdAt: -1 })

        .exec((err, data) => {
            if (err) {
                return res.json({
                    error: errorHandler(err)
                });
            }
            preparatis = data; // preparatis
            // get all categoriespreparati
            Categorypreparati.find({})
        
            .exec((err, c) => {
                if (err) {
                    return res.json({
                        error: errorHandler(err)
                    });
                }
                categoriespreparati = c; // categoriespreparati
                // get all tags
               
                    // return all preparatis categoriespreparati tags
                    res.json({ preparatis, categoriespreparati, size: preparatis.length });
               
            });
        });
};

exports.read = (req, res) => {
    const slug = req.params.slug.toLowerCase();
    Preparati.findOne({ slug })
        // .select("-photo")
        .populate('categoriespreparati', '_id name slug')

        .populate('postedBy', '_id name username')
        .select('_id title  titleEn  titleSp  slug mtitle  ecategoriespreparati  postedBy createdAt updatedAt')
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
    Preparati.findOneAndRemove({ slug }).exec((err, data) => {
        if (err) {
            return res.json({
                error: errorHandler(err)
            });
        }
        res.json({
            message: 'PREPARAT OBRISAN'
        });
    });
};

exports.update = (req, res) => {
    const slug = req.params.slug.toLowerCase();

    Preparati.findOne({ slug }).exec((err, oldParati) => {
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

            let slugBeforeMerge = oldParati.slug;
            oldParati = _.merge(oldParati, fields);
            oldParati.slug = slugBeforeMerge;

            const { title, titleEn,titleSp, categoriespreparati } = fields;

           
            if (categoriespreparati) {
                oldParati.categoriespreparati = categoriespreparati.split(',');
            }

           

            if (files.photo) {
                if (files.photo.size > 10000000) {
                    return res.status(400).json({
                        error: 'Image should be less then 1mb in size'
                    });
                }
                oldParati.photo.data = fs.readFileSync(files.photo.path);
                oldParati.photo.contentType = files.photo.type;
            }

            oldParati.save((err, result) => {
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
    Preparati.findOne({ slug })
        .select('photo')
        .exec((err, preparati) => {
            if (err || !preparati) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.set('Content-Type', preparati.photo.contentType);
            return res.send(preparati.photo.data);
        });
};

exports.listRelated = (req, res) => {
    // console.log(req.bodyLat.preparati);
    let limit = req.body.limit ? parseInt(req.body.limit) : 3;
    const { _id, categoriespreparati } = req.body.preparati;

    Preparati.find({ _id: { $ne: _id }, categoriespreparati: { $in: categoriespreparati } })
        .limit(limit)
       // .populate('categoriespreparati', '_id name slug')
        .populate('postedBy', '_id name username profile categorypreparati categoriespreparati')
        .select('title slug excerpt excerptEn excerptSp postedBy mdesc createdAt updatedAt categorypreparati categoriespreparati')
        .sort({ createdAt: -1 })
        .exec((err, preparatis) => {
            if (err) {
                return res.status(400).json({
                    error: 'preparatis not found'
                });
            }
            res.json(preparatis);
        });
};

//
exports.listSearch = (req, res) => {
    console.log(req.query);
    const { search } = req.query;
    if (search) {
        Preparati.find(
            {
                $or: [{ title: { $regex: search, $options: 'i' } }//, { bodyLat: { $regex: search, $options: 'i' } }
            ]
            },
            (err, preparatis) => {
                if (err) {
                    return res.status(400).json({
                        error: errorHandler(err)
                    });
                }
                res.json(preparatis);
            }
        ).sort({ createdAt: -1 })
        .select('-photo -bodyLat ');
        
    }
};

exports.listSearchAll = (req, res) => {
    console.log(req.query);
    const { search } = req.query;
    if (search) {
        Preparati.find(
            {
                $or: [{ title: { $regex: search, $options: 'i' } }, { bodyLat: { $regex: search, $options: 'i' } }
            ]
            },
            (err, preparatis) => {
                if (err) {
                    return res.status(400).json({
                        error: errorHandler(err)
                    });
                }
                res.json(preparatis);
            }
        ).sort({ createdAt: -1 })
        .select('-photo -bodyLat ');
        
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
        Preparati.find({ postedBy: userId })
            .populate('categoriespreparati', '_id name slug')
            .populate('tags', '_id name slug')
            .populate('postedBy', '_id name username')
            .select('_id title   slug  postedBy createdAt updatedAt')
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
