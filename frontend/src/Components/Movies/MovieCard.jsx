/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
function MovieCard({ image, ratings, title, language, id, certificate }) {


    return (
        <div className="">
            <div className="relative h-[380px] w-[220px] flex justify-center rounded-md">
            <Link to={`/movies/${title}/${id}`}>
                <img
                    src={image}
                    alt={title}
                    className="h-full rounded-md"
                />
            </Link>
            </div>
            <div className=" my-4 w-[220px]">
            <Link to={`/movies/${title}/${id}`}>
                <h1 className=" my-2 text-xl font-bold text-gray-900">{title}</h1>
                <h1 className=" my-1 text-sm font-thin text-gray-700">{certificate}</h1>
                <h1 className=" my-1 text-sm font-thin text-gray-700">{language}</h1>
            </Link>
            </div>
            

        </div>
    )
}
export default MovieCard
