const Tag = require('../models/tag');
const Galeri = require('../models/galeri');
const slugify = require('slugify');
const { errorHandler } = require('../helpers/dbErrorHandler');

exports.create = (req, res) => {
    const { name ,nameEn,nameSp} = req.body;
    let slug = slugify(name).toLowerCase();

    let tag = new Tag({ name, slug ,nameEn,nameSp});

    tag.save((err, data) => {
        if (err) {
            console.log(err);
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json(data); // dont do this res.json({ tag: data });
    });
};

exports.list = (req, res) => {
    Tag.find({})
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

exports.read = (req, res) => {
    const slug = req.params.slug.toLowerCase();

    Tag.findOne({ slug })
    .sort({ createdAt: -1 })
    .exec((err, tag) => {
        if (err) {
            return res.status(400).json({
                error: 'Tag not found'
            });
        }
        // res.json(tag);
        Galeri.find({ tags: tag })

            .populate('tags', '_id name slug')
            .populate('postedBy', '_id name username email')
            .select('_id title slug excerpt categories titleLat titleEn  tags postedBy createdAt updatedAt')
            .sort({ createdAt: -1 })
            .exec((err, data) => {
                if (err) {
                    return res.status(400).json({
                        error: errorHandler(err)
                    });
                }
                res.json({ tag: tag, galeris: data });
            });
    });
};

exports.remove = (req, res) => {
    const slug = req.params.slug.toLowerCase();

    Tag.findOneAndRemove({ slug }).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json({
            message: 'Tag deleted successfully'
        });
    });
};