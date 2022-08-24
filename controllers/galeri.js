
const Galeri = require('../models/galeri');
const Tag = require('../models/tag');
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

        const { title,titleEn,titleSp ,tags} = fields;

        if (!title || !title.length) {
            return res.status(400).json({
                error: 'title is required'
            });
        }
       
        if (!tags || tags.length === 0) {
            return res.status(400).json({
                error: 'At least one tag is required'
            });
        }
        let galeri = new Galeri();
      
        galeri.title = title;
    galeri.titleEn = titleEn;

    galeri.titleSp = titleSp;
        galeri.slug = slugify(title).toLowerCase();
        galeri.postedBy = req.auth._id;
        let arrayOfTags = tags && tags.split(',');
        // tags and tag
 
        if (files.photo) {
            if (files.photo.size > 10000000) {
                return res.status(400).json({
                    error: 'Image should be less then 1mb in size'
                });
            }
           galeri.photo.data = fs.readFileSync(files.photo.path);
           galeri.photo.contentType = files.photo.type;
        }

       galeri.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }

            else {
          Galeri.findByIdAndUpdate(result._id, { $push: { tags: arrayOfTags } }, { new: true }).exec(
                    (err, result) => {
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
     } });
                }
            );

    };

// list, listAllgaleristagsTags, read, remove, update

exports.list = (req, res) => {
   Galeri.find({})
   .populate('tags', '_id name slug')
        .populate('postedBy', '_id name username')
        .select('_id title slug postedBy createdAt updatedAt tags')
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
exports.photo = (req, res) => {
    const slug = req.params.slug.toLowerCase();
 Galeri.findOne({ slug })
        .select('photo')
        .exec((err, galeri) => {
            if (err || !galeri) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.set('Content-Type', galeri.photo.contentType);
            return res.send(galeri.photo.data);
        });
};

exports.remove = (req, res) => {
    const slug = req.params.slug.toLowerCase();
 Galeri.findOneAndRemove({ slug }).exec((err, data) => {
        if (err) {
            return res.json({
                error: errorHandler(err)
            });
        }
        res.json({
            message: 'galeri deleted successfully'
        });
    });
};

exports.listGaleri= (req, res) => {
    let limit = req.body.limit ? parseInt(req.body.limit) : 10000;
    let skip = req.body.skip ? parseInt(req.body.skip) : 0;

    let galeris;
    let tags;


    Galeri.find({})

        .populate('tags', '_id name slug')
        .populate('postedBy', '_id name username profile')
        .skip(skip)
        .limit(limit)
        .select('_id title  titleEn bodyLat titleSp bodyEn bodySp slug excerpt  excerptEn excerptSp  mdesc  tags tags postedBy createdAt updatedAt')
   
        .sort({ createdAt: -1 })

        .exec((err, data) => {
            if (err) {
                return res.json({
                    error: errorHandler(err)
                });
            }
            galeris = data; // galeris
            // get all tags
            Tag.find({})
            .sort({ createdAt: -1 })
            .exec((err, c) => {
                if (err) {
                    return res.json({
                        error: errorHandler(err)
                    });
                }
               tags = c; // tags
                // get all tags
              
                    // return all galeris tags tags
                    res.json({ galeris,tags, size: galeris.length });
                });
           
        });
};


exports.read = (req, res) => {
    const slug = req.params.slug.toLowerCase();
  Galeri.findOne({ slug })
        // .select("-photo")
        .populate('tags', '_id name slug')

        .populate('postedBy', '_id name username')
        .select('_id title  titleEn bodyLat titleSp bodyEn bodySp slug mtitle mdesc tags  postedBy createdAt updatedAt')
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



exports.update = (req, res) => {
    const slug = req.params.slug.toLowerCase();

 Galeri.findOne({ slug }).exec((err, oldGalery) => {
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

            let slugBeforeMerge = oldGalery.slug;
            oldGalery = _.merge(oldGalery, fields);
            oldGalery.slug = slugBeforeMerge;

            const { bodyLat,title, titleEn,bodyEn,bodySp,titleSp, tags } = fields;


            if (tags) {
                oldGalery.tags = tags.split(',');
            }

         

            if (files.photo) {
                if (files.photo.size > 10000000) {
                    return res.status(400).json({
                        error: 'Image should be less then 1mb in size'
                    });
                }
                oldGalery.photo.data = fs.readFileSync(files.photo.path);
                oldGalery.photo.contentType = files.photo.type;
            }

            oldGalery.save((err, result) => {
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