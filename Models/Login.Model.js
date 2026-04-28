const mongoose = require("mongoose");
 
const Login = new mongoose.Schema({
    email:{type:String, required:true},
    password:{type:String, required:true}
},
  { timestamps: true })
  const Loginis =mongoose.model("Login",Login);
  module.exports = Loginis;