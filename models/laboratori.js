const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;
const laboratoriSchema = new mongoose.Schema(
    {
        title: {
            type: String,
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
        
    },
    { timestamps: true }
);


module.exports = mongoose.model('Laboratori', laboratoriSchema);
