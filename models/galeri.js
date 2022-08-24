
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const galeriSchema = new mongoose.Schema(
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
  
        photo: {
            data: Buffer,
            contentType: String
        },
        tags: [{ type: ObjectId, ref: 'Tag', required: true }],
        postedBy: {
            type: ObjectId,
            ref: 'User'
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Galeri', galeriSchema);

