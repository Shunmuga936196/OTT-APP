// src/lib/api.js
import { APIList } from "../common/constant.js";
import { TMDB_API_KEY, TMDB_BASE_URL } from "../config.js";

export async function fetchTrendingMovies(containerType, searchQuery) {
  const res = await fetch(
    `${TMDB_BASE_URL}${APIList[containerType]}?api_key=${TMDB_API_KEY}${searchQuery || ''}`
  );
  const json = await res.json();
  return json.results.map((movie) => ({
    title: movie.title,
    poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
  }));
}
