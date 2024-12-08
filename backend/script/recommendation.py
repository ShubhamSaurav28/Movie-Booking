import sys
import json
import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

# Read input data from stdin (coming from the Express route)
input_data = sys.stdin.read()

# Parse the incoming JSON input (which contains both user and movie data)
data = json.loads(input_data)

# Extract user data and movie data from the input
user_data = data['userData']  # User data containing 'preferredGenres' and 'bookedTickets'
movie_data = data['movieData']  # Movie data containing 'genre', 'cast', 'ratings', 'language'

# Prepare user booking history (list of movie names the user has already watched)
watched_movies = [ticket["movieName"] for ticket in user_data["bookedTickets"]]

# Generate movie features for content-based filtering
movie_features = []
all_genres = set([genre for movie in movie_data for genre in movie['genre'].split(', ')])

# Create a dictionary for encoding genres into one-hot vectors
genre_dict = {genre: idx for idx, genre in enumerate(all_genres)}

def genre_vector(movie_genres):
    """Convert a movie's genres into a one-hot vector."""
    vector = [0] * len(all_genres)
    for genre in movie_genres.split(', '):
        if genre in genre_dict:
            vector[genre_dict[genre]] = 1
    return vector

# Process movie data to create feature vectors
for movie in movie_data:
    features = {
        'name': movie['name'],
        'genre': movie['genre'],
        'ratings': movie['ratings'],
        'language': movie['language'],
        'genre_vector': genre_vector(movie['genre']),
    }
    movie_features.append(features)

# Create a DataFrame for movie features
df_movies = pd.DataFrame(movie_features)

# Combine genre and rating into a single feature vector
df_movies['genre_rating_vector'] = df_movies.apply(
    lambda row: row['genre_vector'] + [row['ratings']], axis=1
)

# Movie vectors (genre + rating)
movie_vectors = np.array(df_movies['genre_rating_vector'].tolist())

# Replace NaN values if any
if pd.isna(movie_vectors).any():
    movie_vectors = np.nan_to_num(movie_vectors, nan=0)

# Calculate cosine similarity between movies
similarity_matrix = cosine_similarity(movie_vectors)

# User's preferred genres
preferred_genres = user_data.get('preferredGenres', [])

def calculate_genre_match_score(movie_genres, preferred_genres):
    """Calculate how many of the movie's genres match the user's preferred genres."""
    movie_genre_list = movie_genres.split(', ')
    return sum(1 for genre in movie_genre_list if genre in preferred_genres)

# Rank unseen movies by similarity and genre match score
movie_scores = []
for movie in movie_data:
    if movie['name'] not in watched_movies:
        similarity_score = 0
        for watched_movie in watched_movies:
            watched_index = df_movies[df_movies['name'] == watched_movie].index[0]
            unseen_index = df_movies[df_movies['name'] == movie['name']].index[0]
            similarity_score += similarity_matrix[unseen_index][watched_index]

        # Calculate genre match score
        genre_match_score = calculate_genre_match_score(movie['genre'], preferred_genres)

        # Final score: combine similarity and genre match score
        final_score = similarity_score + (genre_match_score)  # Adjust weight as needed

        movie_scores.append((movie['name'], final_score))

# Sort movies by the final score in descending order
movie_scores.sort(key=lambda x: x[1], reverse=True)

# Return the top 5 recommendations
top_recommendations = [{"movie_name": movie, "similarity_score": score} for movie, score in movie_scores[:10]]

# Output the recommendations as JSON
print(json.dumps(top_recommendations))
