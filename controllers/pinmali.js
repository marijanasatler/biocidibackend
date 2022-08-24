
const Pinmali = require('../models/pinmali');

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

        const { title, bodyLat,titleLat,titleEn,bodyEn,bodySp,titleSp,linkRef,linkRefSp,linkRefEn } = fields;

        if (!title || !title.length) {
            return res.status(400).json({
                error: 'title is required'
            });
        }
     
     
        
          
        let pinmali = new Pinmali();
      
         pinmali.title = title;
         pinmali.titleLat=titleLat;
        pinmali.titleEn=titleEn;
        pinmali.titleSp=titleSp;
        pinmali.bodySp = bodySp;
        pinmali.bodyEn = bodyEn;
        pinmali.bodyLat = bodyLat;
        pinmali.linkRef=linkRef;
        pinmali.linkRefSp=linkRefSp;
        pinmali.linkRefEn=linkRefEn;
        pinmali.slug = slugify(title).toLowerCase();
        pinmali.mtitle = `${title} | ${process.env.APP_NAME}`;
        pinmali.postedBy = req.auth._id;
        // pinmalicategories and tags
       

 
        if (files.photo) {
            if (files.photo.size > 30000000) {
                return res.status(400).json({
                    error: 'Image should be less then 1mb in size'
                });
            }
            pinmali.photo.data = fs.readFileSync(files.photo.path);
            pinmali.photo.contentType = files.photo.type;
        }

        pinmali.save((err, result) => {
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


// list, listAllpinmalispinmaliCategoriesTags, read, remove, update

exports.list = (req, res) => {
    Pinmali.find({})
  
        .populate('postedBy', '_id name username')
        .select('_id title  slug excerpt  linkRef linkRefEn LinkRefSp  titleEn bodyLat titleSp bodyEn bodySp titleLat  excerptEn excerptSp   mdesc pinmalicategories tags postedBy createdAt updatedAt')
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

exports.listAllPinmalis = (req, res) => {
    let limit = req.body.limit ? parseInt(req.body.limit) : 10000;
    let skip = req.body.skip ? parseInt(req.body.skip) : 0;

    let pinmalis;
    let pinmalicategories;
  
    Pinmali.find({})

        .populate('postedBy', '_id name username profile')
        .skip(skip)
        .limit(limit)
        .select('_id title  titleEn bodyLat  titleLat   titleSp bodyEn bodySp slug excerpt  excerptEn excerptSp  mdesc  pinmalicategories tags postedBy createdAt updatedAt')
   
        .sort({ createdAt: -1 })

        .exec((err, data) => {
            if (err) {
                return res.json({
                    error: errorHandler(err)
                });
            }
            pinmalis = data; // pinmalis
            // get all pinmalicategories
          
                // get all tags
             
                    // return all pinmalis pinmalicategories tags
                    res.json({ pinmalis, size: pinmalis.length });
                });
            
      
};

exports.read = (req, res) => {
    const slug = req.params.slug.toLowerCase();
    Pinmali.findOne({ slug })
        // .select("-photo")
   
        .populate('postedBy', '_id name username')
        .select('_id title  titleEn bodyLat titleSp bodyEn linkRef linkRefEn titleLat  linkRefSp bodySp slug mtitle mdesc pinmalicategories tags postedBy createdAt updatedAt')
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
    Pinmali.findOneAndRemove({ slug }).exec((err, data) => {
        if (err) {
            return res.json({
                error: errorHandler(err)
            });
        }
        res.json({
            message: 'mali pin je uspešno obrisan'
        });
    });
};

exports.update = (req, res) => {
    const slug = req.params.slug.toLowerCase();

    Pinmali.findOne({ slug }).exec((err, oldpinmali) => {
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

            let slugBeforeMerge = oldpinmali.slug;
            oldpinmali = _.merge(oldpinmali, fields);
            oldpinmali.slug = slugBeforeMerge;

            const { bodyLat,title,titleLat , titleEn,bodyEn,bodySp,titleSp, pinmalicategories, tags,linkRef,linkRefEn,linkRefSp } = fields;

         

           

            if (files.photo) {
                if (files.photo.size > 10000000) {
                    return res.status(400).json({
                        error: 'Image should be less then 1mb in size'
                    });
                }
                oldpinmali.photo.data = fs.readFileSync(files.photo.path);
                oldpinmali.photo.contentType = files.photo.type;
            }

            oldpinmali.save((err, result) => {
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
    Pinmali.findOne({ slug })
        .select('photo')
        .exec((err, pinmali) => {
            if (err || !pinmali) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.set('Content-Type', pinmali.photo.contentType);
            return res.send(pinmali.photo.data);
        });
};



//

exports.listByUser = (req, res) => {
    User.findOne({ username: req.params.username }).exec((err, user) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        let userId = user._id;
        Pinmali.find({ postedBy: userId })
       
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
