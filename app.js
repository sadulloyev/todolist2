const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const _ = require('lodash');

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.connect('mongodb+srv://sadullaevsh:Test_2023@firstdb.mnz0get.mongodb.net/?retryWrites=true&w=majority/todolistDB', {
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

const listschema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List", listschema);

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
  app.listen(3000, function () {
    console.log("Server started on port 3000");
  });
})();



app.get("/", async function (req, res) {
  try {
    const foundItems = await Item.find({});
    res.render("list", { listTitle: 'Today', newListItems: foundItems });
  } catch (err) {
    console.error(err);
    // Handle the error and respond accordingly
  }
});

app.get("/:customListName", async function (req, res) {
  const customListName = _.upperFirst(req.params.customListName);

  async function findList() {
    try {
      const foundList = await List.findOne({ name: customListName });
      if (!foundList) {
        // Creating a new list
        const newList = new List({
          name: customListName,
          items: defaultItems,
        });
        await newList.save(); // Save the new list to the database
        res.redirect("/" + customListName);
      } else {
        // Showing the list
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
      }
    } catch (err) {
      console.error(err);
    }
  }

  await findList(); // Call the async function
});



app.post("/", async function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName,
  });

  try {
    if (listName === "Today") {
      await item.save();
      console.log("Item saved successfully.");
      res.redirect('/');
    } else {
      const foundList = await List.findOne({ name: listName }).exec();
      if (foundList) {
        foundList.items.push(item);
        await foundList.save();
        res.redirect('/' + listName);
      } else {
        console.log("List not found.");
        // Handle the case where the list is not found.
      }
    }
  } catch (error) {
    console.error("Error saving item:", error);
    res.status(500).json({ message: "Error saving item." });
  }
});


app.post("/delete", async function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  try {
    if (listName === "Today") {
      await Item.findByIdAndRemove(checkedItemId);
      console.log("Item deleted successfully");
      res.redirect('/');
    }
    else {
      const updatedList = await List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }, { new: true });
      if (updatedList) {
        res.redirect('/' + listName);
      }
      else {
        console.error("Error deleting item:", err);
        res.status(500).json({ message: "Error deleting item." });
      }

    }
  }
  catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ message: "Error deleting item." });
  }
});




app.get("/about", function (req, res) {
  res.render("about");
});



