const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;
const recommendedSchema = new mongoose.Schema(
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
        body: {
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
        addLink:{
            type: String,   
        },
        addimg:{
            type:String,  
            required: true
        },
        expdate:{
            type:String,
        }
    },
    { timestamps: true }
);


module.exports = mongoose.model('Recommended', recommendedSchema);
