const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const password = "";
mongoose.connect('mongodb+srv://admin-vanak:'+ password +'@cluster0-gah1v.mongodb.net/todolistDB', {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})
    .then(() => console.log('MongoDB Connected...'))
    .catch((err) => console.log(err))


const itemsSchema = new mongoose.Schema({
  name: String
});
const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({
  name: "Add a new objectif"
});
const defaultItem = [item1];

const ListSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});
const List = mongoose.model("List", ListSchema);




app.get("/", function(req, res) {
  
  Item.find((err, items) => {
    if (items.length === 0){ 
      Item.insertMany(defaultItem, err => { 
        if(err) {
          console.log(err);
        } else {
          console.log("Items insert is successfully !");
        }
      });
      res.redirect("/"); 
    }
    else {
      res.render("list", {listTitle: "Today", newListItems: items});
      console.log("Items founded...")
    }
  });
});

app.post("/", function(req, res){
  const nameItem = req.body.newItem;
  const nameList = req.body.list;
  const item = new Item({
    name: nameItem
  });
  if (nameList === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: nameList}, (err, foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + nameList);
    });
  }
  
});
app.post("/delete", (req, res) => {
  const itemId = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "Today") {
    Item.findByIdAndRemove(itemId, err => {
      if (!err) {
        console.log("Delete successfully.");
      }
    });
    res.redirect("/");
  } else { 
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: itemId}}}, (err, result) => {
      if(!err) { 
        res.redirect("/" + listName);
      }
    });
  }
});

app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name:customListName}, (err, result) => {
    if (!err) {
      if(!result) { 
        const list = new List({
          name: customListName,
          items: defaultItem
        });
        list.save();
        res.redirect("/" + customListName);
      } else { 
        res.render("list", {listTitle: result.name, newListItems: result.items})
      }
    }
  });
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started");
});
