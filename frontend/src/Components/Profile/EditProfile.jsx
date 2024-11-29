import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import baseURL from '../../DB';

function EditProfile() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [preferredGenres, setPreferredGenres] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${baseURL}/profile/${id}`);
      const userData = response.data;
      setName(userData.name);
      setEmail(userData.email);
      setPhoneNumber(userData.phoneNumber);
      setPreferredGenres(userData.preferredGenres || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setErrorMessage('Failed to fetch user data');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`${baseURL}/editProfile/${id}`, {
        name,
        email,
        phoneNumber,
        preferredGenres,
      });
      navigate('/profile');
    } catch (error) {
      console.error('Error updating user details:', error);
      setErrorMessage('Failed to update user details');
    }
  };

  const handlePreferredGenresChange = (e) => {
    const genres = e.target.value.split(',').map((genre) => genre.trim());
    setPreferredGenres(genres);
  };

  return (
    <div className="bg-cover bg-center min-h-screen flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md animate-fadeIn">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-700">
          Edit Profile
        </h1>
        {errorMessage && (
          <p className="text-red-500 text-center mb-4">{errorMessage}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              className="w-full bg-gray-50 text-gray-800 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
              placeholder="Enter name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full bg-gray-50 text-gray-800 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              className="w-full bg-gray-50 text-gray-800 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
              placeholder="Enter phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Genres
            </label>
            <input
              type="text"
              className="w-full bg-gray-50 text-gray-800 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
              placeholder="Enter preferred genres (comma-separated)"
              value={preferredGenres.join(', ')}
              onChange={handlePreferredGenresChange}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-gray-400 hover:bg-blue-gray-700 transition duration-300 text-white font-semibold py-3 rounded-lg"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditProfile;
