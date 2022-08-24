
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const nabavkeSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
            min: 3,
            max: 160,
            required: true
        }, 
       

        titleSp:{
            type: String,   
            trim: true,
            min: 3,
            max: 160,
            required: true
        },
       titleEn:{
            type:String,  
            trim: true,
            min: 3,
            max: 160,
            required: true
        },
    
        slug: {
            type: String,
            unique: true,
            index: true
        },
      
        mtitle: {
            type: String
        },
        pocetak: {
            type: String
        },
        kraj: {
            type: String
        },
        sifra:{
            type:String
        },
        photo: {
            data: Buffer,
            contentType: String
        },
        categoriesnabavke: [{ type: ObjectId, ref: 'Categorynabavke', required: true }],
        tagnabavkes: [{ type: ObjectId, ref: 'Tagnabavke', required: true }],
  
        postedBy: {
            type: ObjectId,
            ref: 'User'
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Nabavke', nabavkeSchema);

