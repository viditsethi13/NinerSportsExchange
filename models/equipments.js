const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const equipmentSchema = new Schema({
    name: {type:String, required:[true,'Name is required']},
    category: {type:String, required:[true,'Category is required']},
    owner: {type: Schema.Types.ObjectId, ref: 'User'},
    content: {type:String, required:[true,'Content is required'],
                minLength: [10, 'Content must contain atleast 10 Characters']},
    status: { type: String, enum: ['Available', 'Pending', 'Traded']},
    exchanges: {type: Schema.Types.ObjectId, ref: 'Exchange'},
},
{timestamps: true}
);

module.exports = mongoose.model('Equipments', equipmentSchema);