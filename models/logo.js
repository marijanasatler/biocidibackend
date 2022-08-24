
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const logoSchema = new mongoose.Schema(
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

module.exports = mongoose.model('Logo', logoSchema);

