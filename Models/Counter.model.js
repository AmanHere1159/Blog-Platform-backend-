const mongoose = require("mongoose");

const counter= new mongoose.Schema({
    _id:String,
    increment:Number
});

const Counteris =mongoose.model("Counter",counter);
module.exports= Counteris;