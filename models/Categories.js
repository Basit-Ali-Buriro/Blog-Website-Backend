import mongoose from "mongoose";

const categorySchema =  mongoose.Schema({
    name : {type : String, required : true, unique : true, trim : true, maxlength : 50 },
    description : {type : String, maxlength : 200, default : ''},
    slug : {type :String, required : true, unique : true, lowercase : true}
}, {
    timestamps : true
})


const Categories =  mongoose.model("Category", categorySchema)

export default Categories;
