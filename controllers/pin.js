
const Pin = require('../models/pin');
const PinCategory = require('../models/pincategory');
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

        const { title, bodyLat, pincategories,titleLat,titleEn,bodyEn,bodySp,titleSp,linkRef,linkRefSp,linkRefEn } = fields;

        if (!title || !title.length) {
            return res.status(400).json({
                error: 'title is required'
            });
        }
     
     
        
          
        let pin = new Pin();
      
         pin.title = title;
         pin.titleLat=titleLat;
        pin.titleEn=titleEn;
        pin.titleSp=titleSp;
        pin.bodySp = bodySp;
        pin.bodyEn = bodyEn;
        pin.bodyLat = bodyLat;
        pin.linkRef=linkRef;
        pin.linkRefSp=linkRefSp;
        pin.linkRefEn=linkRefEn;
        pin.slug = slugify(title).toLowerCase();
        pin.mtitle = `${title} | ${process.env.APP_NAME}`;
        pin.postedBy = req.auth._id;
        // pincategories and tags
       

 
        if (files.photo) {
            if (files.photo.size > 30000000) {
                return res.status(400).json({
                    error: 'Image should be less then 1mb in size'
                });
            }
            pin.photo.data = fs.readFileSync(files.photo.path);
            pin.photo.contentType = files.photo.type;
        }

        pin.save((err, result) => {
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


// list, listAllpinspinCategoriesTags, read, remove, update

exports.list = (req, res) => {
    Pin.find({})
  
        .populate('postedBy', '_id name username')
        .select('_id title  slug excerpt  linkRef linkRefEn LinkRefSp  titleEn bodyLat titleSp bodyEn bodySp titleLat  excerptEn excerptSp   mdesc pincategories tags postedBy createdAt updatedAt')
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

exports.listAllPins = (req, res) => {
    let limit = req.body.limit ? parseInt(req.body.limit) : 10000;
    let skip = req.body.skip ? parseInt(req.body.skip) : 0;

    let pins;
    let pincategories;
  
    Pin.find({})

        .populate('postedBy', '_id name username profile')
        .skip(skip)
        .limit(limit)
        .select('_id title  titleEn bodyLat  titleLat   titleSp bodyEn bodySp slug excerpt  excerptEn excerptSp  mdesc  pincategories tags postedBy createdAt updatedAt')
   
        .sort({ createdAt: -1 })

        .exec((err, data) => {
            if (err) {
                return res.json({
                    error: errorHandler(err)
                });
            }
            pins = data; // pins
            // get all pincategories
          
                // get all tags
             
                    // return all pins pincategories tags
                    res.json({ pins, size: pins.length });
                });
            
      
};

exports.read = (req, res) => {
    const slug = req.params.slug.toLowerCase();
    Pin.findOne({ slug })
        // .select("-photo")
   
        .populate('postedBy', '_id name username')
        .select('_id title  titleEn bodyLat titleSp bodyEn linkRef linkRefEn titleLat  linkRefSp bodySp slug mtitle mdesc pincategories tags postedBy createdAt updatedAt')
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
    Pin.findOneAndRemove({ slug }).exec((err, data) => {
        if (err) {
            return res.json({
                error: errorHandler(err)
            });
        }
        res.json({
            message: 'pin deleted successfully'
        });
    });
};

exports.update = (req, res) => {
    const slug = req.params.slug.toLowerCase();

    Pin.findOne({ slug }).exec((err, oldpin) => {
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

            let slugBeforeMerge = oldpin.slug;
            oldpin = _.merge(oldpin, fields);
            oldpin.slug = slugBeforeMerge;

            const { bodyLat,title,titleLat , titleEn,bodyEn,bodySp,titleSp, pincategories, tags,linkRef,linkRefEn,linkRefSp } = fields;

         

           

            if (files.photo) {
                if (files.photo.size > 10000000) {
                    return res.status(400).json({
                        error: 'Image should be less then 1mb in size'
                    });
                }
                oldpin.photo.data = fs.readFileSync(files.photo.path);
                oldpin.photo.contentType = files.photo.type;
            }

            oldpin.save((err, result) => {
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
    Pin.findOne({ slug })
        .select('photo')
        .exec((err, pin) => {
            if (err || !pin) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.set('Content-Type', pin.photo.contentType);
            return res.send(pin.photo.data);
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
        Pin.find({ postedBy: userId })
       
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
