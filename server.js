/**
 * dotenv module
 */
require("dotenv").config();

/**
 * cors module
 * @const cors
 * @type {object}
 */
const cors = require("cors");

/**
 * morgan module
 * @const morgan
 * @type {object}
 */
const morgan = require("morgan");

/**
 * mongoose module
 * @const mongoose
 * @type {object}
 */
const mongoose = require("mongoose");

/**
 * Servers port number
 * @const PORT
 * @type {number}
 */
const PORT = process.env.port || 1337;

/**
 * express module
 * @const express
 * @type {object}
 */
const express = require("express");

/**
 * Create a new express app
 * @const app
 * @type {object}
 */
const app = express();

/**
 * Express Middelware
 */
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.static("docs"));

/**
 * Connect to database
 */
mongoose.connect(process.env.MONGODB_URL, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

/**
 * Listen for database connection
 */
mongoose.connection
  .on("open", () => console.log("Connected to database"))
  .on("close", () => console.log("Connection to database closed"))
  .on("error", (error) => console.log(error));

/**
 * Person Schema
 * @const PeopleSchema
 * @type {mongoose.Schema}
 */
const PeopleSchema = new mongoose.Schema({
  name: String,
  image: String,
  title: String,
});

/**
 * People Data Model
 * @const People
 * @type {mongoose.model}
 */
const People = mongoose.model("People", PeopleSchema);

app.get(
  "/people",
  /**
   * Controller which grabs all people from database and returns them to the client in JSON format
   * @function GET_ALL_PEOPLE
   * @param {express.Request} req
   * @param {express.Response} res
   * @returns {void}
   */
  async (req, res) => {
    try {
      res.json(await People.find());
    } catch (error) {
      res.status(418).json(error);
    }
  }
);

app.post(
  "/people",
  /**
   * Controller which creates a new person adds it to the database and returns the person to the client in JSON format
   * @function CREATE_PERSON
   * @param {express.Request} req
   * @param {express.Response} res
   * @returns {void}
   */
  async (req, res) => {
    try {
      res.json(await People.create(req.body));
    } catch (error) {
      res.status(418).json(error);
    }
  }
);

/**
 * Controller which updates a person and returns the person to the client in JSON format
 * @function UPDATE_PERSON
 * @param {express.Request} req
 * @param {express.Response} res
 * @returns {void}
 */
app.put("/people/:id", async (req, res) => {
  try {
    // send all people
    res.json(
      await People.findByIdAndUpdate(req.params.id, req.body, { new: true })
    );
  } catch (error) {
    //send error
    res.status(400).json(error);
  }
});

app.delete(
  "/people/:id",
  /**
   * Controller which deletes a person from the database
   * @function DELETE_PERSON
   * @param {express.Request} req
   * @param {express.Response} res
   * @returns {void}
   */
  async (req, res) => {
    try {
      // send all people
      res.json(await People.findByIdAndRemove(req.params.id));
    } catch (error) {
      //send error
      res.status(400).json(error);
    }
  }
);

/**
 * Start our server
 */
app.listen(PORT, () => console.log(`listening on PORT ${PORT}`));
