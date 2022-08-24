
const Nabavke = require('../models/nabavke');
const Categorynabavke = require('../models/categorynabavke');
const Tagnabavke = require('../models/tagnabavke');
const Ostalonabavke = require('../models/ostalonabavke');
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

        const { title,  categoriesnabavke,ostalonabavkes, tagnabavkes,titleEn,titleSp,pocetak,sifra,kraj } = fields;

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


        if (!categoriesnabavke || categoriesnabavke.length === 0) {
            return res.status(400).json({
                error: 'At least one categorynabavke is required'
            });
        }

        if (!tagnabavkes || tagnabavkes.length === 0) {
            return res.status(400).json({
                error: 'At least one tagnabavke is required'
            });
        }
     
          
        let nabavke = new Nabavke();
      
         nabavke.title = title;
        nabavke.titleEn=titleEn;
        nabavke.titleSp=titleSp;
        nabavke.pocetak=pocetak;
        nabavke.kraj=kraj;
        nabavke.sifra=sifra;
        nabavke.slug = slugify(title).toLowerCase();
        nabavke.mtitle = `${title} | ${process.env.APP_NAME}`;
        nabavke.postedBy = req.auth._id;
        // categoriesnabavke and tagnabavkes
        let arrayOfCategoriesnabavke = categoriesnabavke && categoriesnabavke.split(',');
        let arrayOfTagnabavkes = tagnabavkes && tagnabavkes.split(',');
    
 
        if (files.photo) {
            if (files.photo.size > 10000000) {
                return res.status(400).json({
                    error: 'Image should be less then 1mb in size'
                });
            }
            nabavke.photo.data = fs.readFileSync(files.photo.path);
            nabavke.photo.contentType = files.photo.type;
        }

        nabavke.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            // res.json(result);
            Nabavke.findByIdAndUpdate(result._id, { $push: { categoriesnabavke: arrayOfCategoriesnabavke } }, { new: true }).exec(
                (err, result) => {
                    if (err) {
                        return res.status(400).json({
                            error: errorHandler(err)
                        });
                    } else {
                        Nabavke.findByIdAndUpdate(result._id, { $push: { tagnabavkes: arrayOfTagnabavkes } }, { new: true }).exec(
                            (err, result) => {
                                if (err) {
                                    return res.status(400).json({
                                        error: errorHandler(err)
                                    });
                                } 
                                
                        
                                else {
                                    res.json(result //,files,fields
                                        );
                        
                    }  
                }
                    );
                }
                }
            );
        });
    });
    };

// list, listAllnabavkesCategoriesnabavkeTagnabavkes, read, remove, update

exports.list = (req, res) => {
    Nabavke.find({})
        .populate('categoriesnabavke', '_id name nameEn nameSp slug')
        .populate('tagnabavkes', '_id name nameSp nameEn  slug')
      

        .populate('postedBy', '_id name username email')
        .select('_id title  slug excerpt sifra  titleEn titleSp titleSp    kraj pocetak   categoriesnabavke ostalonabavkes tagnabavkes postedBy createdAt updatedAt')
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

exports.listAllNabavke = (req, res) => {
    let limit = req.body.limit ? parseInt(req.body.limit) : 10000;
    let skip = req.body.skip ? parseInt(req.body.skip) : 0;

    let nabavkes;
    let categoriesnabavke;
    let tagnabavkes;


    Nabavke.find({})
        .populate('categoriesnabavke', '_id name nameSp nameEn slug')
        .populate('tagnabavkes', '_id name nameSp nameEn slug')
      //  .populate('ostalonabavkes', '_id name slug')
        .populate('postedBy', '_id name username profile email')
        .skip(skip)
        .limit(limit)
        .select('_id title  titleEn titleSp titleSp slug  sifra kraj pocetak mdesc   categoriesnabavke tagnabavkes postedBy createdAt updatedAt')
   
        .sort({ createdAt: -1 })

        .exec((err, data) => {
            if (err) {
                return res.json({
                    error: errorHandler(err)
                });
            }
            nabavkes = data; // nabavkes
            // get all categoriesnabavke
            Categorynabavke.find({})
            .sort({ createdAt: -1 })
            .exec((err, c) => {
                if (err) {
                    return res.json({
                        error: errorHandler(err)
                    });
                }
                categoriesnabavke = c; // categoriesnabavke
                // get all tagnabavkes
                Tagnabavke.find({})
                .sort({ createdAt: -1 })
                .exec((err, t) => {
                    if (err) {
                        return res.json({
                            error: errorHandler(err)
                        });
                    }
                    tagnabavkes = t;

                  
                    // return all nabavkes categoriesnabavke tagnabavkes
                    res.json({ nabavkes, categoriesnabavke, tagnabavkes, size: nabavkes.length });
                });
          
        });
        });
};

exports.read = (req, res) => {
    const slug = req.params.slug.toLowerCase();
    Nabavke.findOne({ slug })
        // .select("-photo")
        .populate('categoriesnabavke', '_id name nameSp nameEn  slug')
        .populate('tagnabavkes', '_id name  nameSp nameEn  slug')
  
        .populate('postedBy', '_id name username email')
        .select('_id title  titleEn titleSp titleSp titleSpslug mtitle sifra kraj pocetak  categoriesnabavke  tagnabavkes postedBy createdAt updatedAt')
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
    Nabavke.findOneAndRemove({ slug }).exec((err, data) => {
        if (err) {
            return res.json({
                error: errorHandler(err)
            });
        }
        res.json({
            message: 'nabavke deleted successfully'
        });
    });
};

exports.update = (req, res) => {
    const slug = req.params.slug.toLowerCase();

    Nabavke.findOne({ slug }).exec((err, oldnabavke) => {
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

            let slugBeforeMerge = oldnabavke.slug;
            oldnabavke = _.merge(oldnabavke, fields);
            oldnabavke.slug = slugBeforeMerge;

            const { titleSp,title, titleEn,titleSptitleSp, categoriesnabavke,  tagnabavkes } = fields;


            if (categoriesnabavke) {
                oldnabavke.categoriesnabavke = categoriesnabavke.split(',');
            }

            if (tagnabavkes) {
                oldnabavke.tagnabavkes = tagnabavkes.split(',');
            }

          
            if (files.photo) {
                if (files.photo.size > 10000000) {
                    return res.status(400).json({
                        error: 'Image should be less then 1mb in size'
                    });
                }
                oldnabavke.photo.data = fs.readFileSync(files.photo.path);
                oldnabavke.photo.contentType = files.photo.type;
            }

            oldnabavke.save((err, result) => {
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
    Nabavke.findOne({ slug })
        .select('photo')
        .exec((err, nabavke) => {
            if (err || !nabavke) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.set('Content-Type', nabavke.photo.contentType);
            return res.send(nabavke.photo.data);
        });
};

exports.listRelated = (req, res) => {
    // console.log(req.titleSp.nabavke);
    let limit = req.titleSpmit ? parseInt(req.titleSpmit) : 3;
    const { _id, categoriesnabavke } = req.titleSpbavke;

    Nabavke.find({ _id: { $ne: _id }, categoriesnabavke: { $in: categoriesnabavke } })
        .limit(limit)
       // .populate('categoriesnabavke', '_id name slug')
        .populate('postedBy', '_id name username email profile categorynabavke categoriesnabavke')
        .select('title slug  postedBy sifra kraj pocetak  createdAt updatedAt categorynabavke categoriesnabavke')
        .sort({ createdAt: -1 })
        .exec((err, nabavkes) => {
            if (err) {
                return res.status(400).json({
                    error: 'nabavkes not found'
                });
            }
            res.json(nabavkes);
        });
};

//
exports.listSearch = (req, res) => {
    console.log(req.query);
    const { search } = req.query;
    if (search) {
        Nabavke.find(
            {
                $or: [{ title: { $regex: search, $options: 'i' } }, { titleSp: { $regex: search, $options: 'i' } }
            ]
            },
            (err, nabavkes) => {
                if (err) {
                    return res.status(400).json({
                        error: errorHandler(err)
                    });
                }
                res.json(nabavkes);
            }
        ).sort({ createdAt: -1 })
        .select('-photo  ');
        
    }
};

exports.listSearchEn = (req, res) => {
    console.log(req.query);
    const { search } = req.query;
    if (search) {
        Nabavke.find(
            {
                $or: [{ title: { $regex: search, $options: 'i' } } // , { titleSp: { $regex: search, $options: 'i' } }
            ]
            },
            (err, nabavkes) => {
                if (err) {
                    return res.status(400).json({
                        error: errorHandler(err)
                    });
                }
                res.json(nabavkes);
            }
        ).sort({ createdAt: -1 })
        .select('-photo ');
        
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
        Nabavke.find({ postedBy: userId })
            .populate('categoriesnabavke', '_id name slug')
            .populate('tagnabavkes', '_id name slug')
            .populate('postedBy', '_id name username email ')
            .select('_id title   slug sifra kraj pocetak  postedBy createdAt updatedAt')
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
