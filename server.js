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
 * swagger/OpenAPI JSDoc module
 * @const swaggerJsdoc
 * @link https://github.com/Surnet/swagger-jsdoc
 */
const swaggerJsdoc = require("swagger-jsdoc");

/**
 * swaggerUI module
 * @const swaggerUI
 * @link https://github.com/scottie1984/swagger-ui-express
 */
const swaggerUI = require("swagger-ui-express");

/**
 * @const swaggerSpecs
 * swagger/OpenAPI specs/options
 */
const swaggerSpecs = swaggerJsdoc({
  swaggerDefinition: {
    openapi: "3.0.1",
    info: {
      title: "Swyft API Docs",
      version: "1.0.0",
    },
    servers: [
      {
        url: "https://ga-express-people-api.herokuapp.com/",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./*.js"],
});

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
const PORT = process.env.PORT || 1337;

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

/**
 * swaggerUI route for which serves out OpenAPI Docs
 */
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpecs));

/**
 * @openapi
 * /people:
 *   get:
 *     description: Gets an array of all people from the database
 *     responses:
 *       200:
 *         description: Returns an array of people.
 */
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

/**
 * @openapi
 * /people:
 *   post:
 *     description: Creates a new person adds it to the database
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *              image:
 *                type: string
 *              title:
 *                type: string
 *     responses:
 *       200:
 *         description: Returns the new person.
 */
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
 * @openapi
 * /people/:id:
 *   put:
 *     description: Updates person and returns the updated person
 *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: integer
 *
 *     responses:
 *       200:
 *         description: Returns the new person.
 */
app.put(
  "/people/:id",
  /**
   * Controller which updates a person and returns the person to the client in JSON format
   * @function UPDATE_PERSON
   * @param {express.Request} req
   * @param {express.Response} res
   * @returns {void}
   */
  async (req, res) => {
    try {
      // send all people
      res.json(
        await People.findByIdAndUpdate(req.params.id, req.body, { new: true })
      );
    } catch (error) {
      //send error
      res.status(400).json(error);
    }
  }
);

/**
 * @openapi
 * /people/:id:
 *   delete:
 *     description: Delets a person
 *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *     responses:
 *       200:
 *         description: Returns the new person.
 */
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
