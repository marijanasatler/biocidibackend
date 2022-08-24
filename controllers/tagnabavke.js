const Tagnabavke = require('../models/tagnabavke');
const Nabavke = require('../models/nabavke');
const slugify = require('slugify');
const { errorHandler } = require('../helpers/dbErrorHandler');

exports.create = (req, res) => {
    const { name,nameEn,nameSp } = req.body;
    let slug = slugify(name).toLowerCase();

    let tagnabavke = new Tagnabavke({ name, slug,nameEn,nameSp });

    tagnabavke.save((err, data) => {
        if (err) {
            console.log(err);
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json(data); // dont do this res.json({ tagnabavke: data });
    });
};

exports.list = (req, res) => {
    Tagnabavke.find({})
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

exports.read = (req, res) => {
    const slug = req.params.slug.toLowerCase();

    Tagnabavke.findOne({ slug })
    .sort({ createdAt: -1 })
    .exec((err, tagnabavke) => {
        if (err) {
            return res.status(400).json({
                error: 'Tagnabavke not found'
            });
        }
        // res.json(tagnabavke);
      Nabavke.find({ tagnabavkes: tagnabavke })
            .populate('categoriesnabavke', '_id name nameSp nameEn slug')
            .populate('tagnabavkes', '_id name  nameSp nameEn  slug')
            .populate('postedBy', '_id name username email')
            .select('_id title slug  titleEn titleSp sifra excerpt categoriesnabavke tagnabavkes postedBy createdAt updatedAt')
            .sort({ createdAt: -1 })
            .exec((err, data) => {
                if (err) {
                    return res.status(400).json({
                        error: errorHandler(err)
                    });
                }
                res.json({ tagnabavke: tagnabavke, nabavkes: data });
            });
    });
};

exports.remove = (req, res) => {
    const slug = req.params.slug.toLowerCase();

    Tagnabavke.findOneAndRemove({ slug }).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json({
            message: 'Tagnabavke deleted successfully'
        });
    });
};