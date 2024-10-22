import React from 'react';

const Bg = () => {
  // Function to handle scroll to the calculator section
  const handleScroll = () => {
    const element = document.getElementById('calculator-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className='overflow-x-hidden'>
      <div className="relative w-screen h-screen overflow-hidden">
        <img className="object-cover w-full h-full" src="https://www.vikramsolar.com/wp-content/uploads/2022/02/bgg-3.jpg" alt="Solar Background" />
        <div className="absolute inset-0 bg-black/40"></div> {/* Gradient overlay */}
      </div>
      <div className='text absolute bottom-[100px] text-white left-[120px]'>
        <p className='text-[40px] font-bold text-shadow'>SAVE MONEY. SAVE THE PLANET.</p>
        <p className='text-[28px] mt-4'>WITH INDIA’S MOST INTELLIGENT SOLAR PREDICTOR.</p>
        <p className='text-[28px] mt-2'>SOLAR CALCULATOR</p>
        <button
          onClick={handleScroll}
          className="mt-6 px-8 py-2 bg-red-700 text-white rounded-md hover:bg-red-600"
        >
          Learn More
        </button>
      </div>
    </div>
  );
};

export default Bg;
