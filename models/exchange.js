const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const exchangeSchema = new Schema({
	owner: {type: Schema.Types.ObjectId, ref:'User'},
    equipment1: {type: Schema.Types.ObjectId, ref: 'Equipments'},
    equipment2: {type: Schema.Types.ObjectId, ref: 'Equipments'},
},
{timestamps: true}
);

module.exports = mongoose.model('Exchange', exchangeSchema);