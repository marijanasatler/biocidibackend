const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const standardiSchema = new mongoose.Schema(
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

module.exports = mongoose.model('Standardi', standardiSchema);

