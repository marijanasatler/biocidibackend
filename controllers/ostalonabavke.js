const Ostalonabavke = require('../models/ostalonabavke');
const Nabavke = require('../models/nabavke');
const slugify = require('slugify');
const { errorHandler } = require('../helpers/dbErrorHandler');

exports.create = (req, res) => {
    const { name,nameEn,nameSp } = req.body;
    let slug = slugify(name).toLowerCase();

    let ostalonabavke = new Ostalonabavke({ name, slug,nameEn,nameSp });

    ostalonabavke.save((err, data) => {
        if (err) {
            console.log(err);
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json(data); // dont do this res.json({ ostalonabavke: data });
    });
};

exports.list = (req, res) => {
    Ostalonabavke.find({})
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

    Ostalonabavke.findOne({ slug })
    .sort({ createdAt: -1 })
    .exec((err, ostalonabavke) => {
        if (err) {
            return res.status(400).json({
                error: 'ostalonabavke not found'
            });
        }
        // res.json(ostalonabavke);
      Nabavke.find({ ostalonabavkes: ostalonabavke })
            .populate('categoriesnabavke', '_id name slug')
            .populate('ostalonabavkes', '_id name slug')
            .populate('tagnabavkes', '_id name slug')
            .populate('postedBy', '_id name username')
            .select('_id title slug  excerpt categoriesnabavke tagnabavkes ostalonabavkes postedBy createdAt updatedAt')
            .sort({ createdAt: -1 })
            .exec((err, data) => {
                if (err) {
                    return res.status(400).json({
                        error: errorHandler(err)
                    });
                }
                res.json({ ostalonabavke: ostalonabavke, nabavkes: data });
            });
    });
};

exports.remove = (req, res) => {
    const slug = req.params.slug.toLowerCase();

    Ostalonabavke.findOneAndRemove({ slug }).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json({
            message: 'ostalonabavke deleted successfully'
        });
    });
};