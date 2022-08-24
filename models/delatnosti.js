
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const delatnostiSchema = new mongoose.Schema(
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
            required: true,
            min: 200,
            max: 2000000
        },

        bodyEn: {
            type: {},
      
        },


        bodySp: {
            type: {},
           
        },

        excerpt: {
            type: String,
            max: 1000
        },
        excerptEn: {
            type: String,
            max: 1000
        },
        excerptSp: {
            type: String,
            max: 1000
        },
        mtitle: {
            type: String
        },
        mdesc: {
            type: String
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

module.exports = mongoose.model('Delatnosti', delatnostiSchema);

