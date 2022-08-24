const User = require('../models/user');
const { sendEmailWithNodemailer } = require("../helpers/email");
const Add=require('../models/recommended');
const Blog = require('../models/blog');
const Nabavke=require('../models/nabavke');
const Logo = require('../models/logo');
const Video = require('../models/video');
const Galeri =require('../models/galeri')
const Standardi= require('../models/standardi');
const Laboratori = require('../models/laboratori');
const Zavod=require('../models/zavod');
const Delatnosti =require('../models/delatnosti');
const shortId = require('shortid');
const jwt = require('jsonwebtoken');
//const {expressJwt} = require('express-jwt');
const { errorHandler } = require('../helpers/dbErrorHandler');
const _ = require('lodash');
const { OAuth2Client } = require('google-auth-library');
const Pin= require('../models/pin');
// sendgrid
const sgMail = require('@sendgrid/mail'); // SENDGRID_API_KEY

const Preparati = require('../models/preparati');
const Zaposlenje = require('../models/zaposlenje');
const Cenovnik = require('../models/cenovnik');
const Ostalo = require('../models/ostalo');
const Dokument = require('../models/dokument');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.preSignup = (req, res) => {
    const { name, email, password } = req.body;
    User.findOne({ email: email.toLowerCase() }, (err, user) => {
        if (user) {
            return res.status(400).json({
                error: 'Email is taken'
            });
        }
        if (err) {
            return res.status(400).json({
                error: ' '
            });
        }
        const token = jwt.sign({ name, email, password }, process.env.JWT_ACCOUNT_ACTIVATION, { expiresIn: '15m' });

        const emailData = {
            from:'ZAVOD ZA BIOCIDE I MEDICINSKU EKOLOGIJU',
            to: 'zavod.zbme@gmail.com',
            subject: `Link za aktivaciju naloga`,
            html: `
            <p>Klikom na link aktivirajte vaš nalog:</p>
            <p>Ime i prezime: ${email}</p>
            <p>Email: ${name}</p>
            <p>${process.env.CLIENT_URL}/auth/account/activate/${token}</p>
            <hr />
            <p>Ovaj email možda sadrži osetljive informacije</p>
            <p>Ako vi niste poslali zahtev za registraciju molimo vas ignorišite ovaj email </p>
            <p>https://biocidi.org.rs</p>
        `
        };

        sendEmailWithNodemailer(req, res, emailData);
   
   
    });
};

// exports.signup = (req, res) => {
//     // console.log(req.body);
//     User.findOne({ email: req.body.email }).exec((err, user) => {
//         if (user) {
//             return res.status(400).json({
//                 error: 'Email is taken'
//             });
//         }

//         const { name, email, password } = req.body;
//         let username = shortId.generate();
//         let profile = `${process.env.CLIENT_URL}/profile/${username}`;

//         let newUser = new User({ name, email, password, profile, username });
//         newUser.save((err, success) => {
//             if (err) {
//                 return res.status(400).json({
//                     error: err
//                 });
//             }
//             // res.json({
//             //     user: success
//             // });
//             res.json({
//                 message: 'Signup success! Please signin.'
//             });
//         });
//     });
// };

exports.signup = (req, res) => {
    const token = req.body.token;
    if (token) {
        jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, function(error, decoded) {
            if (error) {
                return res.status(401).json({
                    error: 'Link je istekao, molimo vas prijavite se ponovo.'
                });
            }

            const { name, email, password } = jwt.decode(token);

            let username = shortId.generate();
            let profile = `${process.env.CLIENT_URL}/profile/${username}`;

            const user = new User({ name, email, password, profile, username });
            user.save((err, user) => {
                if (error) {
                    return res.status(401).json({
                        error: errorHandler(err)
                    });
                }
                return res.json({
                    message: 'Uspešno ste se registrovali! Molimo vas prijavite se.'
                });
            });
        });
    } else {
        return res.json({
            message: 'Došlo je do greške, molimo pokušajte ponovo.'
        });
    }
};
exports.signin = (req, res) => {
    const { email, password } = req.body;
    // check if user exist
    User.findOne({ email }).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'Korisnik sa tim emailom ne postoji. Molimo registrujte se.'
            });
        }
        // authenticate
        if (!user.authenticate(password)) {
            return res.status(400).json({
                error: 'Email i lozinka se ne poklapaju.'
            });
        }
        // generate a token and send to client
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '3d' });

        res.cookie('token', token, { expiresIn: '1d' });
        const { _id, username, name, email, role } = user;
        return res.json({
            token,
            user: { _id, username, name, email, role } 
        });
    });
};

exports.signout = (req, res) => {
    res.clearCookie('token');
    res.json({
        message: 'Signout success'
    });
};

exports.requireSignin = 
//expressJwt({
  //  secret: process.env.JWT_SECRET,
   // algorithms: ["HS256"], // added later
   // userProperty: "auth",
  //});
function(req, res, next) {
    if (req.user) {
      next();
    } else {
  
      return res.status(401).json({ message: 'Unauthorized user!!' });
    }
  };
exports.authMiddleware = (req, res, next) => {
    const authUserId = req.auth._id;  // auth
    User.findById({ _id: authUserId }).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User not found'
            });
        }
        req.profile = user;
        next();
    });
};

exports.adminMiddleware = (req, res, next) => {
    const adminUserId = req.auth._id; // auth
    User.findById({ _id: adminUserId }).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User not found'
            });
        }

        if (user.role !== 1) {
            return res.status(400).json({
                error: 'Admin resource. Access denied'
            });
        }

        req.profile = user;
        next();
    });
};

exports.canUpdateDeleteBlog = (req, res, next) => {
    const slug = req.params.slug.toLowerCase();
    Blog.findOne({ slug }).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        let authorizedUser = data.postedBy._id.toString() === req.profile._id.toString();
        if (!authorizedUser) {
            return res.status(400).json({
                error: 'Niste ovlašćeni da menjate ovaj sadržaj!'
            });
        }
        next();
    });
};
exports.canUpdateDeleteGalery= (req, res, next) => {
    const slug = req.params.slug.toLowerCase();
   Galeri.findOne({ slug }).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        let authorizedUser = data.postedBy._id.toString() === req.profile._id.toString();
        if (!authorizedUser) {
            return res.status(400).json({
                error: 'Niste ovlašćeni da menjate ovaj sadržaj!'
            });
        }
        next();
    });
};
exports.canUpdateDeleteVideo= (req, res, next) => {
    const slug = req.params.slug.toLowerCase();
  Video.findOne({ slug }).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        let authorizedUser = data.postedBy._id.toString() === req.profile._id.toString();
        if (!authorizedUser) {
            return res.status(400).json({
                error: 'Niste ovlašćeni da menjate ovaj sadržaj!'
            });
        }
        next();
    });
};


exports.canUpdateDeleteCenovnik = (req, res, next) => {
    const slug = req.params.slug.toLowerCase();
    Cenovnik.findOne({ slug }).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        let authorizedUser = data.postedBy._id.toString() === req.profile._id.toString();
        if (!authorizedUser) {
            return res.status(400).json({
                error: 'Niste ovlašćeni da menjate ovaj sadržaj!'
            });
        }
        next();
    });
};



exports.canUpdateDeletePreparati = (req, res, next) => {
    const slug = req.params.slug.toLowerCase();
    Preparati.findOne({ slug }).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        let authorizedUser = data.postedBy._id.toString() === req.profile._id.toString();
        if (!authorizedUser) {
            return res.status(400).json({
                error: 'Niste ovlašćeni da menjate ovaj sadržaj!'
            });
        }
        next();
    });
};
exports.canUpdateDeleteDokument = (req, res, next) => {
    const slug = req.params.slug.toLowerCase();
 Dokument.findOne({ slug }).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        let authorizedUser = data.postedBy._id.toString() === req.profile._id.toString();
        if (!authorizedUser) {
            return res.status(400).json({
                error: 'Niste ovlašćeni da menjate ovaj sadržaj!'
            });
        }
        next();
    });
};


exports.canUpdateDeleteOatalo = (req, res, next) => {
    const slug = req.params.slug.toLowerCase();
  Ostalo.findOne({ slug }).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        let authorizedUser = data.postedBy._id.toString() === req.profile._id.toString();
        if (!authorizedUser) {
            return res.status(400).json({
                error: 'Niste ovlašćeni da menjate ovaj sadržaj!'
            });
        }
        next();
    });
};

exports.canUpdateDeleteNabavke = (req, res, next) => {
    const slug = req.params.slug.toLowerCase();
 Nabavke.findOne({ slug }).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        let authorizedUser = data.postedBy._id.toString() === req.profile._id.toString();
        if (!authorizedUser) {
            return res.status(400).json({
                error: 'Niste ovlašćeni da menjate ovaj sadržaj!'
            });
        }
        next();
    });
};


exports.canUpdateDeleteAdd = (req, res, next) => {
    const slug = req.params.slug.toLowerCase();
    Add.findOne({ slug }).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        let authorizedUser = data.postedBy._id.toString() === req.profile._id.toString();
        if (!authorizedUser) {
            return res.status(400).json({
                error: 'Niste ovlašćeni da menjate ovaj sadržaj!'
            });
        }
        next();
    });
};

exports.canUpdateDeleteLaboratori = (req, res, next) => {
    const slug = req.params.slug.toLowerCase();
    Laboratori.findOne({ slug }).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        let authorizedUser = data.postedBy._id.toString() === req.profile._id.toString();
        if (!authorizedUser) {
            return res.status(400).json({
                error: 'Niste ovlašćeni da menjate ovaj sadržaj!'
            });
        }
        next();
    });
};

exports.canUpdateDeleteZaposlenje = (req, res, next) => {
    const slug = req.params.slug.toLowerCase();
  Zaposlenje.findOne({ slug }).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        let authorizedUser = data.postedBy._id.toString() === req.profile._id.toString();
        if (!authorizedUser) {
            return res.status(400).json({
                error: 'Niste ovlašćeni da menjate ovaj sadržaj!'
            });
        }
        next();
    });
};


exports.canUpdateDeleteLogo = (req, res, next) => {
    const slug = req.params.slug.toLowerCase();
    Logo.findOne({ slug }).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        let authorizedUser = data.postedBy._id.toString() === req.profile._id.toString();
        if (!authorizedUser) {
            return res.status(400).json({
                error: 'Niste ovlašćeni da menjate ovaj sadržaj!'
            });
        }
        next();
    });
};
exports.canUpdateDeleteStandard = (req, res, next) => {
    const slug = req.params.slug.toLowerCase();
    Standardi.findOne({ slug }).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        let authorizedUser = data.postedBy._id.toString() === req.profile._id.toString();
        if (!authorizedUser) {
            return res.status(400).json({
                error: 'Niste ovlašćeni da menjate ovaj sadržaj!'
            });
        }
        next();
    });
};




exports.canUpdateDeleteZavod = (req, res, next) => {
    const slug = req.params.slug.toLowerCase();
   Zavod.findOne({ slug }).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        let authorizedUser = data.postedBy._id.toString() === req.profile._id.toString();
        if (!authorizedUser) {
            return res.status(400).json({
                error: 'Niste ovlašćeni da menjate ovaj sadržaj!'
            });
        }
        next();
    });
};


exports.canUpdateDeleteDelatnost = (req, res, next) => {
    const slug = req.params.slug.toLowerCase();
   Delatnosti.findOne({ slug }).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        let authorizedUser = data.postedBy._id.toString() === req.profile._id.toString();
        if (!authorizedUser) {
            return res.status(400).json({
                error: 'Niste ovlašćeni da menjate ovaj sadržaj!'
            });
        }
        next();
    });
};

exports.canUpdateDeletePin = (req, res, next) => {
    const slug = req.params.slug.toLowerCase();
   Pin.findOne({ slug }).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        let authorizedUser = data.postedBy._id.toString() === req.profile._id.toString();
        if (!authorizedUser) {
            return res.status(400).json({
                error: 'Niste ovlašćeni da menjate ovaj sadržaj!'
            });
        }
        next();
    });
};





exports.forgotPassword = (req, res) => {
    const { email } = req.body;

    User.findOne({ email }, (err, user) => {
        if (err || !user) {
            return res.status(401).json({
                error: 'Korisnik sa tim emailom ne postoji'
            });
        }

        const token = jwt.sign({ _id: user._id }, process.env.JWT_RESET_PASSWORD, { expiresIn: '10m' }
        );

        // email
        const emailData = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: `Link za resetovanje lozinke`,
            html: `
            <p>Koristite sledeći link da biste resetovali lozinku:</p>
            <p>${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
            <hr />
            <p>Ovaj email može da sadrži osetljive informacije</p>
            <p>https://biocidi.org.rs</p>
        `
        };
        
        // populating the db > user > resetPasswordLink
        return user.updateOne({ resetPasswordLink: token }, (err, success) => {
            if (err) {
                return res.json({ error: errorHandler(err) });
            } else {
                sendEmailWithNodemailer(req, res, emailData).then(sent => {
                    return ({
                        message: `Imejl je poslat na ${email}. Pratite uputstva da biste resetovali lozinku. Link ističe za 10 min.`
                    });
                });
            }
        });
    });
};

exports.resetPassword = (req, res) => {
    const { resetPasswordLink, newPassword } = req.body;

    if (resetPasswordLink) {
        jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD, function(err, decoded) {
            if (err) {
                return res.status(401).json({
                    error: 'Link je isteko. Pokušajte ponovo!'
                });
            }
            User.findOne({ resetPasswordLink }, (err, user) => {
                if (err || !user) {
                    return res.status(401).json({
                        error: 'Nešto je krenulo naopako. Pokušajte kasnije!'
                    });
                }
                const updatedFields = {
                    password: newPassword,
                    resetPasswordLink: ''
                };

                user = _.extend(user, updatedFields);

                user.save((err, result) => {
                    if (err) {
                        return res.status(400).json({
                            error: errorHandler(err)
                        });
                    }
                    res.json({
                        message: `Sjajno! Sada možete da se prijavite sa svojom novom lozinkom.`
                    });
                });
            });
        });
    }
};
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
exports.googleLogin = (req, res) => {
    const idToken = req.body.tokenId;
    client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID }).then(response => {
        // console.log(response)
        const { email_verified, name, email,jti,username } = response.payload;
        if (email_verified) {
            User.findOne({ email }).exec((err, user) => {
                if (user) {
                    // console.log(user)
                    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
                    res.cookie('token', token, { expiresIn: '1d' });
                    const { _id, email, name, role } = user;
                    return res.json({ token, user: { _id, email, name, role, username } });
                } else {
                    let username = shortId.generate();
                    let profile = `${process.env.CLIENT_URL}/profile/${username}`;
                    let password = email + process.env.JWT_SECRET;;
                    user = new User({ name, email, profile, username, password });
                    user.save((err, data) => {
                        if (err) {
                            return res.status(400).json({
                                error: 'User signup failed with google'
                            });
                        }
                        const token = jwt.sign({ _id: data._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
                        res.cookie('token', token, { expiresIn: '1d' });
                        const { _id, email, name, role, username } = data;
                        return res.json({ token, user: { _id, email, name, role, username } });
                    });
                }
            });
        } else {
            return res.status(400).json({
                error: 'Google login failed. Try again.'
            });
        }
    });
};

exports.facebookLogin = (req, res) => {
    console.log('FACEBOOK LOGIN REQ BODY', req.body);
    const { userID, accessToken } = req.body;

    const url = `https://graph.facebook.com/v2.11/${userID}/?fields=id,name,email&access_token=${accessToken}`;

    return (
        fetch(url, {
            method: 'GET'
        })
            .then(response => response.json())
            // .then(response => console.log(response))
            .then(response => {
                const { email, name } = response;
                User.findOne({ email }).exec((err, user) => {
                    if (user) {
                        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
                        const { _id, email, name, role } = user;
                        return res.json({
                            token,
                            user: { _id, email, name, role }
                        });
                    } else {
                        let password = email + process.env.JWT_SECRET;
                        user = new User({ name, email, password });
                        user.save((err, data) => {
                            if (err) {
                                console.log('ERROR FACEBOOK LOGIN ON USER SAVE', err);
                                return res.status(400).json({
                                    error: 'User signup failed with facebook'
                                });
                            }
                            const token = jwt.sign({ _id: data._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
                            const { _id, email, name, role } = data;
                            return res.json({
                                token,
                                user: { _id, email, name, role }
                            });
                        });
                    }
                });
            })
            .catch(error => {
                res.json({
                    error: 'Facebook login failed. Try later'
                });
            })
    );
};