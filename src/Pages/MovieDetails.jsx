import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../App.css";

const API_URL = "https://www.omdbapi.com/";
const API_KEY = "thewdb";

function MovieDetails() {
  const { imdbID } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMovie() {
      try {
        const response = await fetch(
          `${API_URL}?apikey=${API_KEY}&i=${imdbID}&plot=full`
        );

        const data = await response.json();

        if (data.Response === "False") {
          alert(data.Error);
          navigate("/");
          return;
        }

        setMovie(data);
      } catch {
        alert("Unable to load movie details.");
        navigate("/");
      } finally {
        setLoading(false);
      }
    }

    fetchMovie();
  }, [imdbID, navigate]);

  if (loading) {
    return (
      <main className="details-page">
        <h1>Loading movie details...</h1>
      </main>
    );
  }

  if (!movie) {
    return null;
  }

  return (
    <main className="details-page">
      <button
        className="back-button"
        onClick={() => navigate("/")}
      >
        ← Back To Search
      </button>

      <div className="details-container">
        <div className="details-poster">
          {movie.Poster && movie.Poster !== "N/A" ? (
            <img
              src={movie.Poster}
              alt={`${movie.Title} poster`}
            />
          ) : (
            <span>No poster available</span>
          )}
        </div>

        <div className="details-content">
          <p className="details-type">{movie.Type}</p>

          <h1>{movie.Title}</h1>

          <div className="details-meta">
            <span>{movie.Year}</span>
            <span>{movie.Rated}</span>
            <span>{movie.Runtime}</span>
          </div>

          <p className="details-plot">
            {movie.Plot}
          </p>

          <div className="details-list">
            <p>
              <strong>Genre:</strong> {movie.Genre}
            </p>

            <p>
              <strong>Director:</strong> {movie.Director}
            </p>

            <p>
              <strong>Actors:</strong> {movie.Actors}
            </p>

            <p>
              <strong>Released:</strong> {movie.Released}
            </p>

            <p>
              <strong>IMDb Rating:</strong>{" "}
              {movie.imdbRating}
            </p>

            <p>
              <strong>Box Office:</strong>{" "}
              {movie.BoxOffice}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default MovieDetails;
