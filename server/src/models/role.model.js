import mongoose from "mongoose";

//Anh Tuan
const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        enum: ['ADMIN', 'TOUR_GUIDE', 'TRAVELER'],
        unique: true,
        required: true
    }
});

const RoleModel = mongoose.model('Role', roleSchema);
export default RoleModel;