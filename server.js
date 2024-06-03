const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");

app.use(express.json());
require("./userDetails.js");

const bodyParser = require("body-parser");
const mongoUrl =
  "mongodb+srv://sushantonit:onit3652@cluster0.pdql0w2.mongodb.net/your_database_name"; // Replace 'your_database_name' with your actual database name

mongoose
  .connect(mongoUrl)
  .then(() => {
    console.log("Database Connected");
  })
  .catch((e) => {
    console.log(e);
  });
app.use(bodyParser.json());
const User = mongoose.model("UserInfo");
const Admin = mongoose.model("AdminInfo");

const db = mongoose.connection; // Define db object after connecting to MongoDB

db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
  // Define your schemas and routes here, after the database connection is established
});

app.get("/", (req, res) => {
  res.send("welcome");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // console.log("Received login request with email:", email);

    let admin_present = await Admin.findOne({ email });
    // console.log("admin_present query result:", admin_present);

    if (admin_present) {
      if (admin_present.password === password) {
        return res
          .status(200)
          .send({ status: "adminloginok", data: "Admin Login successful" });
      } else {
        return res.status(400).send({ error: "Invalidpassword" });
      }
    }

    let user_present = await User.findOne({ email });
    // console.log("User query result:", user);

    if (!user_present) {
      user_present = await User.create({ email, password });
      return res
        .status(200)
        .send({ status: "ok", data: "User created and logged in" });
    } else if (user_present.password === password) {
      return res
        .status(200)
        .send({ status: "loginok", data: "Login successful" });
    } else {
      return res.status(400).send({ error: "Invalid password" });
    }
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).send({ error: "Internal server error" });
  }
});

//movie Api
const movieSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    name: { type: String, required: true },
    duration: { type: String, required: true },
    genre: { type: String, required: true },
    language: { type: String, required: true },
    poster: { type: String, required: true },
    description: { type: String, required: true },
    video: { type: String, required: true },
  },
  {
    collection: "movies",
  }
);

///user data email password show
const DetailsSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  // Add other fields if necessary
});

//genre
const genreSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Name of the genre
  description: { type: String }, // Optional description of the genre
  // You can add more fields as needed
});

// Create a model based on the schema
const Genre = mongoose.model('Genre', genreSchema);

module.exports = Genre; 

const Details = mongoose.model("Details", DetailsSchema);

// Create a model based on the schema save movie
const Movie = mongoose.model("Movie", movieSchema);
app.use(express.urlencoded({ extended: true }));

app.post("/movies", async (req, res) => {
  try {
    const movieData = req.body;
    const movie = new Movie(movieData);
    await movie.save();
    res.status(201).json({ message: "Movie data saved successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//movies view admin
app.get("/api/movies", async (req, res) => {
  try {
    const movies = await Movie.find().sort({ _id: -1}).select(
      "type name language duration genre poster description video"
    ); // Select only id, name, and createdAt
    res.json(movies);
  } catch (error) {
    console.error("Error fetching movies:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ?fetch movies

app.post("/api/movies/recent", async (req, res) => {
  try {
    const recentMovies = await Movie.find().sort({ _id: -1}); // Fetch recent movies, adjust the limit as needed
    const movieList = recentMovies.map((movie) => ({
      _id: movie._id,
      posterUrl: movie.poster,
      title: movie.name,
      genre:movie.genre,
      type:movie.type,
    }));

    res.json(movieList);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
// user email or password show
app.get("/api/UserInfo", async (req, res) => {
  try {
    const userdetails = await User.find();
    const userList = userdetails.map((user) => ({
      _id: user._id,
      email: user.email,
      password: user.password,
    }));
    res.json(userList);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

//fetch movie details
app.post("/api/movies/details", async (req, res) => {
  const movieId = req.headers["movie-id"] || req.body.movieId;
  console.log(movieId);

  if (!movieId) {
    return res.status(400).json({ error: "Movie ID is required" });
  }

  try {
    const movie = await Movie.findById(movieId); // Assuming you're using Mongoose
    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }
    res.json(movie);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});
////
app.put("/api/movies/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const updatedMovie = await Movie.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedMovie) {
      return res.status(404).send("Movie not found");
    }
    res.status(200).json(updatedMovie);
  } catch (error) {
    console.error("Error updating movie:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Delete Movie
app.delete("/api/movies/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedMovie = await Movie.findByIdAndDelete(id);
    if (!deletedMovie) {
      return res.status(404).send("Movie not found");
    }
    res.status(200).send("Movie deleted successfully");
  } catch (error) {
    console.error("Error deleting movie:", error);
    res.status(500).send("Internal Server Error");
  }
});
// genre
app.get("/api/genres", async (req, res) => {
  try {
    const genres = await Genre.find();
    res.json(genres);
  } catch (error) {
    console.error("Error fetching genres:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
