const PinCategory = require('../models/pincategory');
const Blog = require('../models/blog');
const slugify = require('slugify');
const { errorHandler } = require('../helpers/dbErrorHandler');

exports.create = (req, res) => {
    const { name,nameEn,nameSp } = req.body;
    let slug = slugify(name).toLowerCase();

    let pincategory = new PinCategory({ name, slug,nameEn,nameSp });

    pincategory.save((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json(data);
    });
};

exports.list = (req, res) => {
    PinCategory.find({})
    .sort({ createdAt: -1 })
    .exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json(data);
    });
};



exports.listSpecific = (req, res) => {
    PinCategory.find({})
    .sort({ createdAt: -1 })
    .exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
      Pin.find({ pincategories: pincategory })
            .populate('categories', '_id name slug')
            .populate('tags', '_id name slug')
            .populate('postedBy', '_id name imgLink')
            .select('_id title imgLink slug excerpt pincategories postedBy tags createdAt updatedAt')
            .sort({ createdAt: -1 })
            .exec((err, data) => {
                if (err) {
                    return res.status(400).json({
                        error: errorHandler(err)
                    });
                }
                res.json({ pincategory: pincategory, blogs: data });
            });
    });
};



exports.read = (req, res) => {
    const slug = req.params.slug.toLowerCase();

    PinCategory.findOne({ slug })
    .sort({ createdAt: -1 })
    .exec((err, pincategory) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        // res.json(pincategory);
      Pin.find({ pincategories: pincategory })
            .populate('categories', '_id name slug')
            .populate('tags', '_id name slug')
            .populate('postedBy', '_id name imgLink username')
            .select('_id title imgLink slug excerpt pincategories postedBy tags createdAt updatedAt')
            .sort({ createdAt: -1 })
            .exec((err, data) => {
                if (err) {
                    return res.status(400).json({
                        error: errorHandler(err)
                    });
                }
                res.json({ pincategory: pincategory, blogs: data });
            });
    });
};

exports.remove = (req, res) => {
    const slug = req.params.slug.toLowerCase();

    PinCategory.findOneAndRemove({ slug }).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json({
            message: 'pinCategory deleted successfully'
        });
    });
};