import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "https://www.omdbapi.com/";
const API_KEY = "thewdb";

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("title-asc");
  const [movies, setMovies] = useState([]);
  const [lastSearch, setLastSearch] = useState("");
  const [message, setMessage] = useState("Search for a movie");
  const [messageType, setMessageType] = useState("empty-state");
  const [loading, setLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") {
        setSelectedMovie(null);
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedSearch = searchTerm.trim();
    if (!trimmedSearch) return;

    setLoading(true);
    setLastSearch(trimmedSearch);
    setMovies([]);
    setSelectedMovie(null);
    setMessage("Searching OMDb...");
    setMessageType("empty-state");

    try {
      const url = `${API_URL}?apikey=${API_KEY}&s=${encodeURIComponent(
        trimmedSearch
      )}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.Response === "False") {
        setMovies([]);
        setMessage(data.Error || "No movies found.");
        setMessageType("error-state");
        return;
      }

      setMovies(data.Search || []);
      setMessage("");
    } catch (error) {
      setMovies([]);
      setMessage("Something went wrong while searching OMDb.");
      setMessageType("error-state");
    } finally {
      setLoading(false);
    }
  }

  async function handleMovieClick(imdbID) {
    setDetailsLoading(true);
    setSelectedMovie(null);

    try {
      const url = `${API_URL}?apikey=${API_KEY}&i=${imdbID}&plot=full`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.Response === "False") {
        alert(data.Error || "Could not load movie details.");
        return;
      }

      setSelectedMovie(data);
    } catch (error) {
      alert("Something went wrong while loading movie details.");
    } finally {
      setDetailsLoading(false);
    }
  }

  function closeMovieDetails() {
    setSelectedMovie(null);
  }

  function getSortableYear(year) {
    const match = year.match(/\d{4}/);
    return match ? Number(match[0]) : 0;
  }

  function handleImageError(event) {
    event.currentTarget.style.display = "none";
    event.currentTarget.parentElement.classList.add("poster-missing");
  }

  const sortedMovies = [...movies].sort((firstMovie, secondMovie) => {
    const firstTitle = firstMovie.Title.toLowerCase();
    const secondTitle = secondMovie.Title.toLowerCase();
    const firstYear = getSortableYear(firstMovie.Year);
    const secondYear = getSortableYear(secondMovie.Year);

    switch (sortBy) {
      case "title-desc":
        return secondTitle.localeCompare(firstTitle);
      case "year-desc":
        return secondYear - firstYear;
      case "year-asc":
        return firstYear - secondYear;
      case "type-asc":
        return firstMovie.Type.localeCompare(secondMovie.Type);
      case "title-asc":
      default:
        return firstTitle.localeCompare(secondTitle);
    }
  });

  return (
    <>
      <button
        className="theme-toggle"
        onClick={() => setDarkMode(!darkMode)}
        aria-label="Toggle dark mode"
        title="Toggle dark mode"
      >
        <span>{darkMode ? "☀️" : "🌙"}</span>
      </button>

      <main className="app">
        <section className="search-panel" aria-label="Movie search">
          <div className="brand">
            <div className="brand-art" aria-hidden="true">
              <div className="brand-art__screen"></div>
              <div className="brand-art__columns">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div className="brand-art__seats"></div>
            </div>

            <div className="brand-content">
              <h1>The Golden Age of Cinema</h1>

              <p className="brand__text">
                Explore hundreds of thousands of movies, television shows,
                actors, directors and timeless classics from every generation.
              </p>

              <div className="brand-badge">
                🎬 Click any movie to view full details
              </div>
            </div>
          </div>

          <form className="search-form" onSubmit={handleSubmit}>
            <label>
              Search movies
              <input
                className="search-input"
                type="search"
                placeholder="Try Batman, Avatar, Spider-Man..."
                required
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </label>

            <label>
              Sort by
              <select
                className="sort-select"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
              >
                <option value="title-asc">Title A-Z</option>
                <option value="title-desc">Title Z-A</option>
                <option value="year-desc">Newest first</option>
                <option value="year-asc">Oldest first</option>
                <option value="type-asc">Type A-Z</option>
              </select>
            </label>

            <button type="submit" disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </button>
          </form>
        </section>

        <section className="results-section" aria-live="polite">
          <div className="results-header">
            <h2 className="results-title">
              {lastSearch
                ? `Results for "${lastSearch}"`
                : "Search for a movie"}
            </h2>

            <p className="results-count">
              {sortedMovies.length > 0
                ? `${sortedMovies.length} result${
                    sortedMovies.length === 1 ? "" : "s"
                  }`
                : ""}
            </p>
          </div>

          <div className="movie-grid">
            {message && <p className={messageType}>{message}</p>}

            {!message &&
              sortedMovies.map((movie) => (
                <article
                  className="movie-card"
                  key={movie.imdbID}
                  onClick={() => handleMovieClick(movie.imdbID)}
                  tabIndex="0"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleMovieClick(movie.imdbID);
                    }
                  }}
                >
                  <div className="movie-card__poster">
                    {movie.Poster && movie.Poster !== "N/A" ? (
                      <>
                        <img
                          src={movie.Poster}
                          alt={`${movie.Title} poster`}
                          onError={handleImageError}
                        />
                        <span className="poster-fallback">
                          No poster available
                        </span>
                      </>
                    ) : (
                      <span>No poster available</span>
                    )}
                  </div>

                  <div className="movie-card__content">
                    <h3 className="movie-card__title">{movie.Title}</h3>

                    <div className="movie-card__meta">
                      <span>{movie.Year}</span>
                      <span>{movie.Type}</span>
                    </div>
                  </div>
                </article>
              ))}
          </div>
        </section>
      </main>

      {detailsLoading && (
        <div className="modal-overlay">
          <div className="movie-modal loading-modal">
            <p>Loading movie details...</p>
          </div>
        </div>
      )}

      {selectedMovie && (
        <div className="modal-overlay" onClick={closeMovieDetails}>
          <div
            className="movie-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button className="modal-close" onClick={closeMovieDetails}>
              ✕
            </button>

            <div className="modal-poster">
              {selectedMovie.Poster && selectedMovie.Poster !== "N/A" ? (
                <img
                  src={selectedMovie.Poster}
                  alt={`${selectedMovie.Title} poster`}
                />
              ) : (
                <span>No poster available</span>
              )}
            </div>

            <div className="modal-content">
              <p className="modal-kicker">{selectedMovie.Type}</p>
              <h2>{selectedMovie.Title}</h2>

              <div className="modal-meta">
                <span>{selectedMovie.Year}</span>
                <span>{selectedMovie.Rated}</span>
                <span>{selectedMovie.Runtime}</span>
              </div>

              <p className="modal-plot">{selectedMovie.Plot}</p>

              <div className="details-list">
                <p>
                  <strong>Genre:</strong> {selectedMovie.Genre}
                </p>
                <p>
                  <strong>Director:</strong> {selectedMovie.Director}
                </p>
                <p>
                  <strong>Actors:</strong> {selectedMovie.Actors}
                </p>
                <p>
                  <strong>Released:</strong> {selectedMovie.Released}
                </p>
                <p>
                  <strong>IMDb Rating:</strong> {selectedMovie.imdbRating}
                </p>
                <p>
                  <strong>Box Office:</strong> {selectedMovie.BoxOffice}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;