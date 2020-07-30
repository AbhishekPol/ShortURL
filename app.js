//jshint esversion:6
const express = require("express");
const Swal = require('sweetalert2')
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const encrypt = require('mongoose-encryption');
const app = express();

console.log(process.env.API_KEY);
var em="";
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
mongoose.connect("mongodb+srv://Abhi123:testing123@cluster0.fz4mp.mongodb.net/usernameDB", {useNewUrlParser: true, useUnifiedTopology: true});

 const userSchema=new mongoose.Schema({
   email:String,
   password:String,
   url:[{lonurl: String, shorurl: String}]
 });
const secret="Thisiskey";
 userSchema.plugin(encrypt,{secret:secret,encryptedFields:["password"]});
 const User=new mongoose.model("User",userSchema);

app.get("/",function(req,res){
  res.render("home");
})

app.get("/secrets",function(req,res){
  User.findOne({email:em},function(err,user){
    if(err)
      console.log(err);
    else
    {
       res.render("secrets",{urls:user.url});
    }
  });
});

app.post("/secrets",async function(req,res){
  try {
    var inputurl=req.body.longurl;
    const { BitlyClient } = require('bitly');
    const bitly = new BitlyClient('c3f3a6dcea07dd45511974e531ef2fb5de97cc5a', {});
    var result;
    result = await bitly.shorten(inputurl);
  }
  catch(e) {
    throw e;
  }
  //console.log(result.link);
  var currenturl = { lonurl: inputurl, shorurl: result.link };
  User.findOneAndUpdate(
   { email: em },
   { $push: { url: currenturl  } },
  function (error, success) {
        if (error) {
            console.log(error);
        } else {
            console.log(success);

        }
    });
    User.findOne({email:em},function(err,user){
      if(err)
        console.log(err);
      else
      {
         res.render("secrets",{urls:user.url});
      }
    });
})


app.get("/home",function(req,res){
  res.render("home");
})

app.get("/login",function(req,res){
  res.render("login");
})

app.get("/register",function(req,res){
  res.render("register");
})

app.post("/register",function(req,res){
    const newUser=new User({
      email:req.body.username,
      password:req.body.password,
      url:[{ lonurl: "", shorurl:"" }]
    });
    newUser.save(function(err){
      if(err){
        console.log(err);
      }
      else{
        res.render("login");
      }
    })
})
app.post("/login",function(req,res){
  const username=req.body.username;
  const password=req.body.password;

  User.findOne({email:username},function(err,found){
    if(err){
      console.log(err);
    }
    else
    {
      if(found)
      {
        if(found.password===password)
        {
          em=username;
          User.findOne({email:em},function(err,user){
            if(err)
              console.log(err);
            else
            {
               res.render("secrets",{urls:user.url});
            }
          });

        }
        else
        {
          Swal.fire('Oops...', 'Invalid username or password!', 'error')
        }
      }
      else
      {
        Swal.fire('Oops...', 'Invalid username or password!', 'error')
      }
    }
  })
})
app.listen(process.env.PORT || 3000, function() {
  console.log("App is initialized ");
})
