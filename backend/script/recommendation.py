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

# Prepare user booking history (creating a list of movie names they've already watched)
watched_movies = [ticket["movieName"] for ticket in user_data["bookedTickets"]]

# Generate movie features for content-based filtering
movie_features = []
all_genres = set([genre for movie in movie_data for genre in movie['genre'].split(', ')])  # Collect all genres

# Create a dictionary for encoding genres into one-hot vectors
genre_dict = {genre: idx for idx, genre in enumerate(all_genres)}

def genre_vector(movie_genres):
    vector = [0] * len(all_genres)
    for genre in movie_genres.split(', '):
        if genre in genre_dict:
            vector[genre_dict[genre]] = 1
    return vector

# Process movie data and create features
for movie in movie_data:
    features = {
        'name': movie['name'],  # Movie name
        'genre': movie['genre'],  # Genre as string
        'ratings': movie['ratings'],
        'language': movie['language'],
        'genre_vector': genre_vector(movie['genre'])  # Convert genres to one-hot vector
    }
    movie_features.append(features)

# Create a DataFrame for movie features
df_movies = pd.DataFrame(movie_features)

# Combine genre and rating into a single feature vector
df_movies['genre_rating_vector'] = df_movies.apply(lambda row: row['genre_vector'] + [row['ratings']], axis=1)

# Movie vectors (genre + rating)
movie_vectors = np.array(df_movies['genre_rating_vector'].tolist())

# Check for NaN values and handle them if necessary
if pd.isna(movie_vectors).any():
    # Replace NaNs with zeros
    movie_vectors = np.nan_to_num(movie_vectors, nan=0)

# Calculate cosine similarity between movies
similarity_matrix = cosine_similarity(movie_vectors)

# Get the list of unseen movies (movies that the user hasn't watched yet)
unseen_movies = [movie for movie in movie_data if movie['name'] not in watched_movies]

# Rank unseen movies by similarity to the user's watched movies
movie_scores = []
for movie in unseen_movies:
    similarity_score = 0
    for watched_movie in watched_movies:
        # Get the index of the watched movie in the dataframe
        watched_index = df_movies[df_movies['name'] == watched_movie].index[0]
        # Get the index of the unseen movie in the dataframe
        unseen_index = df_movies[df_movies['name'] == movie['name']].index[0]
        # Add the similarity score for this movie pair
        similarity_score += similarity_matrix[unseen_index][watched_index]

    # Add the movie and its calculated score
    movie_scores.append((movie['name'], similarity_score))

# Sort the movies based on the similarity score (higher is better)
movie_scores.sort(key=lambda x: x[1], reverse=True)

# Return the top 5 recommendations
top_recommendations = [{"movie_name": movie, "similarity_score": score} for movie, score in movie_scores[:10]]

# Output the recommendations as JSON
print(json.dumps(top_recommendations))
