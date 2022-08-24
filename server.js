const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
// bring routes
const blogRoutes = require('./routes/blog');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const categoryRoutes = require('./routes/category');
const categorynabavkeRoutes = require('./routes/categorynabavke');
const tagRoutes = require('./routes/tag');
const tagnabavkeRoutes = require('./routes/tagnabavke');
const ostalonabavkeRoutes = require('./routes/ostalonabavke');
const nabavkeRoutes=require('./routes/nabavke');
const formRoutes = require('./routes/form');
const laboratoriRoutes =require('./routes/laboratori');
const logoRoutes =require('./routes/logo');
const zavodRoutes =require ('./routes/zavod');
const delatnostiRoutes =require ('./routes/delatnosti');
const standardiRoutes =require ('./routes/standardi');
const categorypreparatiRoutes = require('./routes/categorypreparati');
const preparatiRoutes = require('./routes/preparati');
const zaposlenjeRoutes =require('./routes/zaposlenje');
const videoRoutes=require('./routes/video');
const galeriRoutes=require('./routes/galeri');
const cenovnikRoutes=require('./routes/cenovnik');
const pinRoutes=require('./routes/pin');
const pincategoryRoutes=require('./routes/pincategory');
const ostaloRoutes=require('./routes/ostalo');
const pocetnaRoutes=require('./routes/pocetna');
const pinmaliRoutes=require('./routes/pinmali');

const dokumentRoutes=require('./routes/dokument');
// app
const app = express();

// db
mongoose
    .connect(process.env.DATABASE_CLOUD, { useNewUrlParser: true,  useUnifiedTopology: true })
    .then(() => console.log('DB connected'))
    .catch(err => {
        console.log(err);
    });

// middlewares
app.use(morgan('dev'));
app.use(bodyParser.json({limit:"10mb"}));
app.use(cookieParser());
// cors
if (process.env.NODE_ENV === 'development') {
    app.use(cors({ origin: `${process.env.CLIENT_URL}` }));
}
// routes middleware
app.use('/api', blogRoutes); 
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', categoryRoutes);
app.use('/api', categorynabavkeRoutes);
app.use('/api', tagRoutes);
app.use('/api', tagnabavkeRoutes);
app.use('/api', ostalonabavkeRoutes);
app.use('/api', formRoutes);

app.use('/api' ,laboratoriRoutes);
app.use('/api',logoRoutes);
app.use('/api',standardiRoutes);
app.use('/api',zavodRoutes);
app.use('/api',delatnostiRoutes);
app.use ('/api',nabavkeRoutes);
app.use('/api', categorypreparatiRoutes);
app.use('/api', preparatiRoutes);
app.use('/api', zaposlenjeRoutes);
app.use('/api',videoRoutes);
app.use('/api',galeriRoutes);
app.use('/api',cenovnikRoutes);
app.use('/api', pinRoutes);
app.use('/api', pincategoryRoutes);
app.use('/api', ostaloRoutes);
app.use('/api', pocetnaRoutes);
app.use('/api', pinmaliRoutes);
app.use('/api', dokumentRoutes);

const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
