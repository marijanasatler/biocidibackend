const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;
const pinmaliSchema = new mongoose.Schema(
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
linkRef:{
type:String 
},

linkRefSp:{ 
    type:String 
    },

    linkRefEn:{
        type:String 
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
       
        },
       titleEn:{
            type:String,  
    
        },
        titleLat:{
            type: String,   
    
        },
    },
    { timestamps: true }
);


module.exports = mongoose.model('Pinmali', pinmaliSchema);
