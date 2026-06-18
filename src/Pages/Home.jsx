import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import matonLogo from "../Assets/maton-logo.png";

const API_URL = "https://www.omdbapi.com/";
const API_KEY = "thewdb";

function Home() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("title-asc");
  const [movies, setMovies] = useState([]);
  const [lastSearch, setLastSearch] = useState("");
  const [message, setMessage] = useState("Search for a movie");
  const [messageType, setMessageType] = useState("empty-state");
  const [loading, setLoading] = useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedSearch = searchTerm.trim();
    if (!trimmedSearch) return;

    setLoading(true);
    setLastSearch(trimmedSearch);
    setMovies([]);
    setMessage("Searching OMDb...");
    setMessageType("empty-state");

    try {
      const url = `${API_URL}?apikey=${API_KEY}&s=${encodeURIComponent(trimmedSearch)}`;
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
    } catch {
      setMovies([]);
      setMessage("Something went wrong while searching OMDb.");
      setMessageType("error-state");
    } finally {
      setLoading(false);
    }
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
            <div className="brand-glow"></div>

            <img
              src={matonLogo}
              alt="Maton Movie Search logo"
              className="brand-logo"
            />

            <div className="brand-content">
              <h1>Maton Movie Search</h1>

              <p className="brand__text">
                Search movies, shows, actors, directors, plots, ratings, and
                timeless classics from one cinematic interface.
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
              {lastSearch ? `Results for "${lastSearch}"` : "Search for a movie"}
            </h2>

            <p className="results-count">
              {sortedMovies.length > 0
                ? `${sortedMovies.length} result${sortedMovies.length === 1 ? "" : "s"}`
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
                  onClick={() => navigate(`/movie/${movie.imdbID}`)}
                  tabIndex="0"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      navigate(`/movie/${movie.imdbID}`);
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
                        <span className="poster-fallback">No poster available</span>
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
    </>
  );
}

export default Home;
