const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;
const pocetnaSchema = new mongoose.Schema(
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
        titleLat:{
            type: String,   
      
     
        },
        videoLink:{
type:String,
        },

       titleEn:{
            type:String,  
   
    
          
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
    },
    { timestamps: true }
);


module.exports = mongoose.model('Pocetna', pocetnaSchema);
