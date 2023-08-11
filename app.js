const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.connect('mongodb://127.0.0.1:27017/todolistDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true, // Add this option for Mongoose 6.0 and later
});
const itemsSchema = new mongoose.Schema({
  name: String,
});
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: 'Welcome to your to do list!'
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
    // Check if default items exist in the database
    const existingItems = await Item.find({});

    // If there are no items, insert the defaultItems
    if (existingItems.length === 0) {
      await Item.insertMany(defaultItems);
      console.log('Default items inserted successfully!');
    } else {
      console.log('Default items already exist in the database. Skipping insertion.');
    }
  } catch (err) {
    console.error('Error inserting default items:', err);
  }
  // Now start the server
  app.listen(3001, function () {
    console.log("Server started on port 3001");
  });
})();

// const itemNames = defaultItems.map(item => item.name);

app.get("/", async function (req, res) {
  try {
    const foundItems = await Item.find({});
    res.render("list", { listTitle: 'Today', newListItems: foundItems });
  } catch (err) {
    console.error(err);
    // Handle the error and respond accordingly
  }
});


app.post("/", async function (req, res) {
  const itemName = req.body.newItem;
  const item = new Item({
    name: itemName,
  });

  try {
    await item.save();
    console.log("Item saved successfully.");
    res.redirect('/');

  } catch (error) {
    console.error("Error saving item:", error);
    res.status(500).json({ message: "Error saving item." });
  }
});



app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});



