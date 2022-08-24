const Categorypreparati = require('../models/categorypreparati');
const Preparati = require('../models/preparati');
const slugify = require('slugify');
const { errorHandler } = require('../helpers/dbErrorHandler');

exports.create = (req, res) => {
    const { name,nameEn,nameSp } = req.body;
    let slug = slugify(name).toLowerCase();

    let categorypreparati = new Categorypreparati({ name, slug,nameEn,nameSp });

    categorypreparati.save((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json(data);
    });
};

exports.list = (req, res) => {
    Categorypreparati.find({})
   // .sort({ createdAt: -1 })
    
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
    Categorypreparati.find({})
    .sort({ createdAt: -1 })
    .exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
 Preparati.find({ categoriespreparati: categorypreparati })
            .populate('categoriespreparati', '_id name slug')
            .populate('tagpreparatis', '_id name slug')
            .populate('postedBy', '_id name imgLink')
            .select('_id title  slug categoriespreparati postedBy tagpreparatis createdAt updatedAt')
            .sort({ createdAt: -1 })
            .exec((err, data) => {
                if (err) {
                    return res.status(400).json({
                        error: errorHandler(err)
                    });
                }
                res.json({ categorypreparati: categorypreparati, preparatis: data });
            });
    });
};



exports.read = (req, res) => {
    const slug = req.params.slug.toLowerCase();

    Categorypreparati.findOne({ slug })
    .sort({ createdAt: -1 })
    .exec((err, categorypreparati) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        // res.json(categorypreparati);
    Preparati.find({ categoriespreparati: categorypreparati })
            .populate('categoriespreparati', '_id name slug')
            .populate('tagpreparatis', '_id name slug')
            .populate('postedBy', '_id name imgLink username')
            .select('_id title  slug  categoriespreparati postedBy tagpreparatis createdAt updatedAt')
            .sort({ createdAt: -1 })
            .exec((err, data) => {
                if (err) {
                    return res.status(400).json({
                        error: errorHandler(err)
                    });
                }
                res.json({ categorypreparati: categorypreparati, preparatis: data });
            });
    });
};

exports.remove = (req, res) => {
    const slug = req.params.slug.toLowerCase();

    Categorypreparati.findOneAndRemove({ slug }).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json({
            message: 'Categorypreparati deleted successfully'
        });
    });
};