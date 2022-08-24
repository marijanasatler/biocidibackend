const mongoose = require('mongoose');

const categorynabavkeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true,
            max: 32
        },
        slug: {
            type: String,
            unique: true,
            index: true
        },
        nameSp:{
            type:String,
        },
        nameEn:{
            type:String,
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Categorynabavke', categorynabavkeSchema);
