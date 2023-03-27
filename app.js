const express = require("express");
const app = express();

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");

app.use(express.json());

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertDbObjectToResponseMovieObject = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

const convertDbObjectToResponseObjectDirector = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

//API 1

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT * 
    FROM movie
    `;

  const MoviesArray = await db.all(getMoviesQuery);
  response.send(
    MoviesArray.map((eachItem) =>
      convertDbObjectToResponseMovieObject(eachItem)
    )
  );
});

//API 2

app.post("/movies/", async (request, response) => {
  try {
    const { directorId, movieName, leadActor } = request.body;
    const addMovieQuery = `
    INSERT INTO movie (director_id, movie_name, lead_actor )
     VALUES
    ('${directorId}', '${movieName}', '${leadActor}');`;
    const movies = await db.run(addMovieQuery);
    response.send("Movie Added Successfully");
  } catch (e) {
    console.log(`DB Error ${e.message}`);
  }
});

//API 3

app.get("/movies/:movieId/", async (request, response) => {
  try {
    const { movieId } = request.params;
    const movieQuery = `
    SELECT * 
    FROM movie
    WHERE movie_id = ${movieId};`;
    const movieArray1 = await db.get(movieQuery);
    response.send(convertDbObjectToResponseObject(movieArray1));
  } catch (e) {
    console.log(`DB Error ${e.message}`);
  }
});

//API 4

app.put("/movies/:movieId", async (request, response) => {
  try {
    const { movieId } = request.params;
    const { directorId, movieName, leadActor } = request.body;
    const putMovieQuery = `
    UPDATE
    movie
  SET
    director_id = '${directorId}',
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
  WHERE
   movie_id = ${movieId};`;
    await db.run(putMovieQuery);
    response.send("Movie Details Updated");
  } catch (e) {
    console.log(`DB Error ${e.message}`);
  }
});

//API 5

app.delete("/movies/:movieId", async (request, response) => {
  try {
    const { movieId } = request.params;
    const deleteMovieQuery = `
    DELETE
    FROM movie
    WHERE movie_id = ${movieId};`;
    await db.run(deleteMovieQuery);
    response.send("Movie Removed");
  } catch (e) {
    console.log(`DB Error ${e.message}`);
  }
});

//API 6

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT *
    FROM director;`;
  const directorsArray = await db.all(getDirectorsQuery);
  response.send(
    directorsArray.map((eachItem) => {
      return convertDbObjectToResponseDirectorObject(eachItem);
    })
  );
});

//API 7

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorsQuery = `
    SELECT movie_name
    FROM movie
    WHERE director_id = ${directorId};`;
  const directorsArray = await db.all(getDirectorsQuery);
  response.send(
    directorsArray.map((eachItem) => {
      return convertDbObjectToResponseObject(eachItem);
    })
  );
});
module.exports = app;
