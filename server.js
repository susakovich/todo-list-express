const express = require("express"); // require express
const app = express(); // initialize express app
const MongoClient = require("mongodb").MongoClient; // require mongo db
const PORT = 2121; // declare our PORT
require("dotenv").config(); // require env

let db,
  dbConnectionStr = process.env.DB_STRING,
  dbName = "todo";

//Connect to the Mongodb client with the connection string in the config file then console log that it connected, then assign db to client.db
MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true }).then(
  (client) => {
    console.log(`Connected to ${dbName} Database`);
    db = client.db(dbName);
  }
);

app.set("view engine", "ejs"); //Set view engine to ejs
app.use(express.static("public")); //have express look in the public folder for the static files, css, js
app.use(express.urlencoded({ extended: true })); //Allows express to parse the url
app.use(express.json()); //Allows express to receive and read json

//Allows express to receive and read json
app.get("/", async (request, response) => {
  //todoItems is assigned to the result of async function that finds the 'todos' collection, finds every document obj, and adds them to an array, returning the array.
  const todoItems = await db.collection("todos").find().toArray();
  //itemsLeft is assigned to result of async function that goes to the 'todos' collection and counts how many documents have the completed property set to false, returns that number.
  const itemsLeft = await db
    .collection("todos")
    .countDocuments({ completed: false });
  response.render("index.ejs", { items: todoItems, left: itemsLeft }); //render index.ejs template and pass in todoItems as an items variable, and itemsLeft as a left variable

  //! Same thing as above but using promises instead of async await
  // db.collection('todos').find().toArray()
  // .then(data => {
  //     db.collection('todos').countDocuments({completed: false})
  //     .then(itemsLeft => {
  //         response.render('index.ejs', { items: data, left: itemsLeft })
  //     })
  // })
  // .catch(error => console.error(error))
});

//handles POST request made to the /addtodo route
app.post("/addTodo", (request, response) => {
  //go to db collection of 'todos' and insert one with the property of thing set to the input named todoItem, and completed to false
  db.collection("todos")
    .insertOne({ thing: request.body.todoItem, completed: false })
    .then((result) => {
      console.log("Todo Added"); //console 'todo Added'
      response.redirect("/"); //redirect to '/'
    })
    .catch((error) => console.error(error)); //catch error, console log it
});

//Handles PUT requests to /markComplete route
app.put("/markComplete", (request, response) => {
  //go to todos collection and update one document that has the thing property equal to the request.body.itemFromJS value
  db.collection("todos")
    .updateOne(
      { thing: request.body.itemFromJS },
      {
        //Changes the completed property to true
        $set: {
          completed: true,
        },
      },
      {
        //sorts the document and does not create a new one if it doesn't exists
        sort: { _id: -1 },
        upsert: false,
      }
    )
    .then((result) => {
      //console log and respond with json
      console.log("Marked Complete");
      response.json("Marked Complete");
    })
    .catch((error) => console.error(error)); //if error console error
});

//Handles PUT requests to /markUnComplete route
app.put("/markUnComplete", (request, response) => {
  //go to todos collection and update one document that has the thing property equal to the request.body.itemFromJS value
  db.collection("todos")
    .updateOne(
      { thing: request.body.itemFromJS },
      {
        //Change completed property to false
        $set: {
          completed: false,
        },
      },
      {
        //sorts the document and doesn't create a new one if it doesn't exists
        sort: { _id: -1 },
        upsert: false,
      }
    )
    .then((result) => {
      //console log and respond with json
      console.log("Marked Complete");
      response.json("Marked Complete");
    })
    .catch((error) => console.error(error)); //if error console error
});

//Handles DELETE requests to the /deleteItem route
app.delete("/deleteItem", (request, response) => {
  //Go to the db todos collection and deletes one document that has the thing property equal to the request.body.itemFromJS value
  db.collection("todos")
    .deleteOne({ thing: request.body.itemFromJS })
    .then((result) => {
      //console and respond with json
      console.log("Todo Deleted");
      response.json("Todo Deleted");
    })
    .catch((error) => console.error(error)); //if error console error
});

//Listen on the PORT variable in the .env file OR the PORT variable
app.listen(process.env.PORT || PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
