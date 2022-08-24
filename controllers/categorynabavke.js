const Categorynabavke = require('../models/categorynabavke');
const Nabavke = require('../models/nabavke');
const slugify = require('slugify');
const { errorHandler } = require('../helpers/dbErrorHandler');

exports.create = (req, res) => {
    const { name,nameEn,nameSp } = req.body;
    let slug = slugify(name).toLowerCase();

    let categorynabavke = new Categorynabavke({ name, slug,nameEn,nameSp });

    categorynabavke.save((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json(data);
    });
};

exports.list = (req, res) => {
    Categorynabavke.find({})
    //.sort({ createdAt: -1 })
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
    Categorynabavke.find({})
    .sort({ createdAt: -1 })
    .exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
    Nabavke.find({ categoriesnabavke: categorynabavke })
            .populate('categoriesnabavke', '_id name slug')
            .populate('tagnabavkes', '_id name slug')
            .populate('postedBy', '_id name imgLink email')
            .select('_id title titleSp titleEn sifra slug categoriesnabavke postedBy tagnabavkes createdAt updatedAt')
            .sort({ createdAt: -1 })
            .exec((err, data) => {
                if (err) {
                    return res.status(400).json({
                        error: errorHandler(err)
                    });
                }
                res.json({ categorynabavke: categorynabavke, nabavkes: data });
            });
    });
};



exports.read = (req, res) => {
    const slug = req.params.slug.toLowerCase();

    Categorynabavke.findOne({ slug })
    .sort({ createdAt: -1 })
    .exec((err, categorynabavke) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        // res.json(categorynabavke);
    Nabavke.find({ categoriesnabavke: categorynabavke })
            .populate('categoriesnabavke', '_id name slug')
            .populate('tagnabavkes', '_id name slug')
            .populate('postedBy', '_id name imgLink username email')
            .select('_id title  slug titleSp titleEn sifra categoriesnabavke postedBy tagnabavkes createdAt updatedAt')
            .sort({ createdAt: -1 })
            .exec((err, data) => {
                if (err) {
                    return res.status(400).json({
                        error: errorHandler(err)
                    });
                }
                res.json({ categorynabavke: categorynabavke, nabavkes: data });
            });
    });
};

exports.remove = (req, res) => {
    const slug = req.params.slug.toLowerCase();

    Categorynabavke.findOneAndRemove({ slug }).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json({
            message: 'Categorynabavke deleted successfully'
        });
    });
};