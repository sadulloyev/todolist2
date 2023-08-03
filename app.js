//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.connect('mongodb://localhost:27017/todolistDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true, // Add this option for Mongoose 6.0 and later
});

const itemsSchema = new mongoose.Schema({
  name: String,
});
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: 'Welocome to your todo list!'
})

const item2 = new Item({
  name: 'Hit the + button to add a new item.'
})

const item3 = new Item({
  name: '<-- Hit this to delete an item.'
})
const defaultItems = [item1, item2, item3];

(async () => {
  try {
    await Item.insertMany(defaultItems);
    console.log('Items inserted successfully!');
  } catch (err) {
    console.error('Error inserting items:', err);
  }
})();


app.get("/", function (req, res) {



  res.render("list", { listTitle: 'Today', newListItems: items });

});

app.post("/", function (req, res) {

  const item = req.body.newItem;

  if (req.body.list === "Work") {
    workItems.push(item);
    res.redirect("/work");
  } else {
    items.push(item);
    res.redirect("/");
  }
});

app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});