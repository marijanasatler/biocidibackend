
const Video = require('../models/video');

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

        const { title,titleEn,titleSp,linkRef } = fields;

        if (!title || !title.length) {
            return res.status(400).json({
                error: 'title is required'
            });
        }
       
        let video = new Video();
      
        video.title = title;
    video.titleEn = titleEn;
video.linkRef=linkRef;
    video.titleSp = titleSp;
        video.slug = slugify(title).toLowerCase();
        video.postedBy = req.auth._id;
        // categories and tag
 
        if (files.photo) {
            if (files.photo.size > 500000000) {
                return res.status(400).json({
                    error: 'Image should be less then 50mb in size'
                });
            }
           video.photo.data = fs.readFileSync(files.photo.path);
           video.photo.contentType = files.photo.type;
        }

       video.save((err, result) => {
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
   Video.find({})
  
        .populate('postedBy', '_id name username')
        .select('_id title slug linkRef titleSp titleEn postedBy createdAt updatedAt')
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
 Video.findOne({ slug })
        .select('photo')
        .exec((err, video) => {
            if (err || !video) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.set('Content-Type', video.photo.contentType);
            return res.send(video.photo.data);
        });
};

exports.remove = (req, res) => {
    const slug = req.params.slug.toLowerCase();
 Video.findOneAndRemove({ slug }).exec((err, data) => {
        if (err) {
            return res.json({
                error: errorHandler(err)
            });
        }
        res.json({
            message: 'video deleted successfully'
        });
    });
};

exports.listVideo= (req, res) => {
    let limit = req.body.limit ? parseInt(req.body.limit) : 10000;
    let skip = req.body.skip ? parseInt(req.body.skip) : 0;

    let videos;



  Video.find({})

        .populate('postedBy', '_id name username profile')
        .skip(skip)
        .limit(limit)
        .select('_id title  titleEn bodyLat titleSp bodyEn bodySp slug excerpt linkRef  excerptEn excerptSp  mdesc  tags tags postedBy createdAt updatedAt')
   
        .sort({ createdAt: -1 })

        .exec((err, data) => {
            if (err) {
                return res.json({
                    error: errorHandler(err)
                });
            }
            videos = data; // videos
            // get all tags
            // tags
                // get all tags
              
                    // return all videos tags tags
                    res.json({ videos, size: videos.length });
                });
           
       
};

exports.read = (req, res) => {
    const slug = req.params.slug.toLowerCase();
  Video.findOne({ slug })
        // .select("-photo")

        .populate('postedBy', '_id name username')
        .select('_id title  titleEn  titleSp  slug mtitle   postedBy createdAt updatedAt  linkRef')
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
