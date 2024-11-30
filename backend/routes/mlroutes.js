const express = require('express');
const User = require('../models/User');
const Movie = require('../models/Movie');
const { spawn } = require('child_process');
const router = express.Router();
const path = require('path');

router.get('/movie/recommend/:userId', async (req, res) => {
  const userId = req.params.userId;
  console.log(`User ID received: ${userId}`);

  try {
    // Fetch user data
    const user = await User.findById(userId).select('preferredGenres bookedTickets');
    const movies = await Movie.find().select('name cast genre ratings language');

    if (!user || movies.length === 0) {
      return res.status(404).json({ message: 'User or movies not found' });
    }

    // Prepare the data for the Python script
    const data = {
      userData: {
        _id: user._id,
        preferredGenres: user.preferredGenres,
        bookedTickets: user.bookedTickets,
      },
      movieData: movies.map(movie => ({
        name: movie.name,
        genre: movie.genre,
        cast: movie.cast,
        ratings: movie.ratings,
        language: movie.language,
      })),
    };

    const pythonScript = path.join(__dirname, '../script/recommendation.py');
    const python = spawn('python', [pythonScript]);

    // Send the data to the Python script
    python.stdin.write(JSON.stringify(data));
    python.stdin.end();

    let result = '';
    let errorData = '';

    // Capture stdout from Python
    python.stdout.on('data', (chunk) => {
      result += chunk.toString();
    });

    // Capture stderr from Python
    python.stderr.on('data', (chunk) => {
      errorData += chunk.toString();
    });

    python.on('close', async (code) => {
      if (code !== 0) {
        console.error(`Python script exited with code ${code}`);
        return res.status(500).json({ message: 'Error in generating recommendations', error: errorData });
      }

      try {
        // Parse the result from Python
        const recommendations = JSON.parse(result); // [{ movie_name: 'Movie1', similarity_score: 0.98 }, ...]
        
        // Extract unique movie names
        const movieNames = [...new Set(recommendations.map(rec => rec.movie_name))];

        // Fetch the recommended movies from the database
        const recommendedMovies = await Movie.find({ name: { $in: movieNames } });

        res.json(recommendedMovies);
      } catch (parseErr) {
        console.error('Error parsing recommendations:', parseErr);
        res.status(500).json({ message: 'Error parsing recommendations', error: parseErr.message });
      }
    });

  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
