import { Carousel, IconButton } from "@material-tailwind/react";
import { useEffect, useState } from "react";
import axios from "axios";
import baseURL from "../../DB";
import CardSlider from "../CardSlider/CardSlider";
import { tokenCheck } from "../../../helperToken";

export default function Home() {
  const [data, setData] = useState([]);
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  let user = tokenCheck();

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Change image every 3 seconds

    return () => clearTimeout(timer);
  }, [currentIndex, images]);

  useEffect(() => {
    const imageUrls = [
      "https://giffiles.alphacoders.com/222/222045.gif",
      "https://images8.alphacoders.com/100/1003220.png",
      "https://images7.alphacoders.com/104/1045911.jpg",
      "https://wallpapercave.com/wp/wp8807385.jpg"
    ];
    setImages(imageUrls);
  }, []);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await axios.get(`${baseURL}/movie/recommend/${user.id}`);
        setRecommendations(response.data);
      } catch (err) {
        console.error("Error fetching recommendations", err);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };
    fetchRecommendations();
  }, [user.id]);

  return (
    <>
      <Carousel
        autoplay
        autoplayInterval={4000}
        infiniteLoop
        prevArrow={({ handlePrev }) => (
          <IconButton
            variant="text"
            color="white"
            size="lg"
            onClick={handlePrev}
            className="!absolute top-2/4 left-4 -translate-y-2/4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
          </IconButton>
        )}
        nextArrow={({ handleNext }) => (
          <IconButton
            variant="text"
            color="white"
            size="lg"
            onClick={handleNext}
            className="!absolute top-2/4 !right-4 -translate-y-2/4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </IconButton>
        )}
      >
        {images.map((imageUrl, index) => (
          <img
            key={index}
            src={images[(currentIndex + index) % images.length]}
            alt={`image ${index + 1}`}
            className="h-80 w-full object-cover"
          />
        ))}
      </Carousel>

      <br />
      <h1 className="p-2 text-4xl ml-[8.5rem] font-bold">Recommended Movies</h1>
      <br />
      <div className="w-[90vw] mx-auto">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
          </div>
        ) : (
          <CardSlider items={recommendations} />
        )}
      </div>
    </>
  );
}
