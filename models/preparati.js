
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const preparatiSchema = new mongoose.Schema(
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
      
           
        },
       titleEn:{
            type:String,  
        
           
        },
    
        slug: {
            type: String,
            unique: true,
            index: true
        },
  

     
        mtitle: {
            type: String
        },
       
        photo: {
            data: Buffer,
            contentType: String
        },
        categoriespreparati: [{ type: ObjectId, ref: 'Categorypreparati', required: true }],


        postedBy: {
            type: ObjectId,
            ref: 'User'
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Preparati', preparatiSchema);

