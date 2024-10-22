import React, { useEffect, useState } from 'react';

const Para = () => {
  const [style, setStyle] = useState({
    transform: 'translateY(-100px)',
    opacity: 0,
  });

  useEffect(() => {
    // Trigger the style change when the component is rendered
    const timeout = setTimeout(() => {
      setStyle({
        transform: 'translateY(0)',
        opacity: 1,
        transition: 'transform 2s ease-out, opacity 2s ease-out',
      });
    }, 1000);

    return () => clearTimeout(timeout); // Cleanup the timeout on component unmount
  }, []);

  return (
    <div className="h-auto m-auto bg-[#454545] p-10">
      <div className="flex flex-col justify-center w-[90%] text-center m-auto gap-4 p-8 font-medium text-white" style={style}>
        <span>Use our solar panel calculator to rapidly calculate your savings and solar potential by address...</span>
        <h1 className="text-xl font-bold text-red-500 mt-4">CALCULATION INFORMATION</h1>
        <span>In some states there is a minimum installation required to avail net metering...</span>
        <h1 className="text-xl font-bold text-red-500 mt-4">DISCLAIMER</h1>
        <span>The information you calculate from this Calculator is intended for use by you as a guide only...</span>
      </div>
    </div>
  );
}

export default Para;