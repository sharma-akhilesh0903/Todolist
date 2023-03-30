
const express = require("express");
const bodyParser = require("body-parser");
const Lodash=require("lodash");
const mongoose=require("mongoose");
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://sharma_akhilesh0903:09032003@cluster0.rgp01pf.mongodb.net/todolistDB");

const itemsSchema=mongoose.Schema({
  name:String,
  index:Number,
});
const Item=mongoose.model("Item",itemsSchema);

const Item1=new Item({
  name:"Welcome to the todolist",
  index:1,
})
const Item2=new Item({
  name:"Hit the + button for adding",
  index:2,
})
const Item3=new Item({
  name:"<-- Hit for deleting",
  index:3,
})
const defaultItems=[Item1,Item2,Item3];

const listSchema=mongoose.Schema({
  name:String,
  list:[itemsSchema],
})
const List=mongoose.model("List",listSchema);
app.get("/", function(req, res) {

  Item.find({}).then(function(foundItems){
    if(foundItems.length===0){
      Item.insertMany(defaultItems);
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle:"Today", newListItems:foundItems});
    }
  });

});

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName=req.body.list;
  const item=new Item({
    name:itemName,
  });
  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName}).then(function(foundList){
      foundList.list.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })
  }
});
app.post("/delete",(req,res)=>{
  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;
  
  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId).then(()=>{
      res.redirect("/");
    });
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{list:{_id:checkedItemId}}}).then(function(){
      res.redirect("/"+listName);
    })
    .catch(()=>{
      console.log("error");
    })
  }
})
app.get("/:customListName",function(req,res){
  const customListName = Lodash.capitalize(req.params.customListName);
  List.findOne({name:customListName})
    .then(function(foundList){
        
          if(!foundList){
            const list = new List({
              name:customListName,
              items:defaultItems
            });
          
            list.save();
            console.log("saved");
            res.redirect("/"+customListName);
          }
          else{
            res.render("list",{listTitle:foundList.name, newListItems:foundList.list});
          }
    })
})

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
// mongodb+srv://sharma_akhilesh0903:<password>@cluster0.rgp01pf.mongodb.net/test
