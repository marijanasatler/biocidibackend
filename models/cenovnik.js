
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const cenovnikSchema = new mongoose.Schema(
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
        bodyLat: {
            type: {},
    
        },

        bodyEn: {
            type: {},
      
        },


        bodySp: {
            type: {},
           
        },

        photo: {
            data: Buffer,
            contentType: String
        },


        postedBy: {
            type: ObjectId,
            ref: 'User'
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Cenovnik', cenovnikSchema);

