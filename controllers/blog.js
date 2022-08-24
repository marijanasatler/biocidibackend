
const Blog = require('../models/blog');
const Category = require('../models/category');

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

        const { title, bodyLat, categories, tags,titleEn,bodyEn,bodySp,titleSp,excerpt,excerptEn,excerptSp } = fields;

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

        if (!categories || categories.length === 0) {
            return res.status(400).json({
                error: 'At least one category is required'
            });
        }

        
          
        let blog = new Blog();
      
         blog.title = title;
        blog.titleEn=titleEn;
        blog.titleSp=titleSp;
        blog.bodySp = bodySp;
        blog.bodyEn = bodyEn;
        blog.bodyLat = bodyLat;
        blog.excerpt = smartTrim(bodyLat, 260, ' ', ' ...');
        blog.excerptEn = smartTrim(bodyEn, 260, ' ', ' ...');
        blog.excerptSp = smartTrim(bodySp, 260, ' ', ' ...');
        blog.slug = slugify(title).toLowerCase();
        blog.mtitle = `${title} | ${process.env.APP_NAME}`;
        blog.mdesc = smartTrim(bodyLat, 120, ' ', ' ...');
        blog.postedBy = req.auth._id;
        // categories and tags
        let arrayOfCategories = categories && categories.split(',');
  
 
        if (files.photo) {
            if (files.photo.size > 30000000) {
                return res.status(400).json({
                    error: 'Image should be less then 1mb in size'
                });
            }
            blog.photo.data = fs.readFileSync(files.photo.path);
            blog.photo.contentType = files.photo.type;
        }

        blog.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            // res.json(result);
            Blog.findByIdAndUpdate(result._id, { $push: { categories: arrayOfCategories } }, { new: true }).exec(
                (err, result) => {
                    if (err) {
                        return res.status(400).json({
                            error: errorHandler(err)
                        });
                    }  else {
                                    res.json(result //,files,fields
                                        );
                                }
                            }
                        );
                  
        });
    });
    };

// list, listAllBlogsCategoriesTags, read, remove, update

exports.list = (req, res) => {
    Blog.find({})
        .populate('categories', '_id name slug')
  
        .populate('postedBy', '_id name username')
        .select('_id title  slug excerpt  titleEn bodyLat titleSp bodyEn bodySp   excerptEn excerptSp   mdesc categories tags postedBy createdAt updatedAt')
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

exports.listAllBlogsCategoriesTags = (req, res) => {
    let limit = req.body.limit ? parseInt(req.body.limit) : 10000;
    let skip = req.body.skip ? parseInt(req.body.skip) : 0;

    let blogs;
    let categories;
    let tags;

    Blog.find({})
        .populate('categories', '_id name slug')
        .populate('tags', '_id name slug')
        .populate('postedBy', '_id name username profile')
        .skip(skip)
        .limit(limit)
        .select('_id title  titleEn bodyLat titleSp bodyEn bodySp slug excerpt  excerptEn excerptSp  mdesc  categories tags postedBy createdAt updatedAt')
   
        .sort({ createdAt: -1 })

        .exec((err, data) => {
            if (err) {
                return res.json({
                    error: errorHandler(err)
                });
            }
            blogs = data; // blogs
            // get all categories
            Category.find({})
            .sort({ createdAt: -1 })
            .exec((err, c) => {
                if (err) {
                    return res.json({
                        error: errorHandler(err)
                    });
                }
                categories = c; // categories
                // get all tags
              
                    // return all blogs categories tags
                    res.json({ blogs, categories, tags, size: blogs.length });
                });
           
        });
};

exports.read = (req, res) => {
    const slug = req.params.slug.toLowerCase();
    Blog.findOne({ slug })
        // .select("-photo")
        .populate('categories', '_id name slug')

        .populate('postedBy', '_id name username')
        .select('_id title  titleEn bodyLat titleSp bodyEn bodySp exerpt excerptSp excerptEn slug mtitle mdesc categories  postedBy createdAt updatedAt')
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
    Blog.findOneAndRemove({ slug }).exec((err, data) => {
        if (err) {
            return res.json({
                error: errorHandler(err)
            });
        }
        res.json({
            message: 'Blog deleted successfully'
        });
    });
};

exports.update = (req, res) => {
    const slug = req.params.slug.toLowerCase();

    Blog.findOne({ slug }).exec((err, oldBlog) => {
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

            let slugBeforeMerge = oldBlog.slug;
            oldBlog = _.merge(oldBlog, fields);
            oldBlog.slug = slugBeforeMerge;

            const { bodyLat,title, titleEn,bodyEn,bodySp,titleSp, categories, tags } = fields;

            if (bodyLat) {
                oldBlog.excerpt = smartTrim(bodyLat, 260, ' ', ' ...');
                oldBlog.desc =smartTrim(bodyLat, 120, ' ', ' ...') ;
            }

            if (bodySp) {
                oldBlog.excerptSp = smartTrim(bodySp, 260, ' ', ' ...');
               
            }


            if (bodyEn) {
                oldBlog.excerptEn = smartTrim(bodyEn, 260, ' ', ' ...');
            
            }


            if (categories) {
                oldBlog.categories = categories.split(',');
            }

         

            if (files.photo) {
                if (files.photo.size > 30000000) {
                    return res.status(400).json({
                        error: 'Image should be less then 3mb in size'
                    });
                }
                oldBlog.photo.data = fs.readFileSync(files.photo.path);
                oldBlog.photo.contentType = files.photo.type;
            }

            oldBlog.save((err, result) => {
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
    Blog.findOne({ slug })
        .select('photo')
        .exec((err, blog) => {
            if (err || !blog) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.set('Content-Type', blog.photo.contentType);
            return res.send(blog.photo.data);
        });
};

exports.listRelated = (req, res) => {
    // console.log(req.bodyLat.blog);
    let limit = req.body.limit ? parseInt(req.body.limit) : 3;
    const { _id, categories } = req.body.blog;

    Blog.find({ _id: { $ne: _id }, categories: { $in: categories } })
        .limit(limit)
       // .populate('categories', '_id name slug')
        .populate('postedBy', '_id name username profile category categories')
        .select('title slug excerpt excerptEn excerptSp postedBy titleSp titleEn mdesc createdAt updatedAt category categories')
        .sort({ createdAt: -1 })
        .exec((err, blogs) => {
            if (err) {
                return res.status(400).json({
                    error: 'Blogs not found'
                });

            }
            res.json(blogs);
        });
};

//
exports.listSearch = (req, res) => {
    console.log(req.query);
    const { search } = req.query;
    if (search) {
        Blog.find(
            {
                $or: [{ title: { $regex: search, $options: 'i' } }//, { bodyLat: { $regex: search, $options: 'i' } }
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
        .select('-photo -bodyLat ');
        
    }
};

exports.listSearchAll = (req, res) => {
    console.log(req.query);
    const { search } = req.query;
    if (search) {
        Blog.find(
            {
                $or: [{ title: { $regex: search, $options: 'i' } }, { bodyLat: { $regex: search, $options: 'i' } }
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
        Blog.find({ postedBy: userId })
            .populate('categories', '_id name slug')
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
