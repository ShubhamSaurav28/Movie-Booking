import React, { useState } from 'react';
import MovieCard from '../Movies/MovieCard';
import { Swiper, SwiperSlide, useSwiper } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/bundle';
import { register } from 'swiper/element/bundle';
import { Keyboard, Navigation } from 'swiper/modules';
// import 'swiper/swiper-bundle.min.css';
register();

export default function CardSlider({ items }) {
  const swiper = useSwiper();
  return (
    <>
      <div className='relative w-[100%] border pl-[20px]'>
        <Swiper
          slidesPerView={4}
          Swiper navigation={true}
          modules={[Navigation]} className="mySwiper"
        >
          {items.map((item, index) => (
            <SwiperSlide key={index} className='pl-[60px]'>
                <MovieCard
                  id={item._id}
                  image={item.poster}
                  title={item.name}
                  language={item.language}
                  certificate={item.certificate}
                />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </>
  )
}