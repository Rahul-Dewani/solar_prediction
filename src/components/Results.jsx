import React from 'react';
import { useLocation } from 'react-router-dom';

const Result = () => {
  const location = useLocation();
  const data = location.state || {};

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <img
        className="object-cover w-full h-full"
        src="https://www.vikramsolar.com/wp-content/uploads/2022/02/bgg-3.jpg"
        alt=""
      />
      <div className="absolute inset-0 bg-[#f6f6f6] flex flex-col justify-center items-center h-[90%] w-[70%] m-auto p-10 rounded-lg shadow-lg">
        <span className="font-semibold text-[40px] text-black mb-10">Your Results</span>
        <div className="text-black text-xl w-full p-5">
          <table className="w-full border-collapse border border-[#f6a723] bg-white">
            <thead>
              <tr>
                <th className="border border-[#f6a723] p-2">Property</th>
                <th className="border border-[#f6a723] p-2">Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(data).map((key) => (
                <tr key={key}>
                  <td className="border border-[#f6a723] p-2">{key.replace(/_/g, ' ')}</td>
                  <td className="border border-[#f6a723] p-2">{data[key]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Result;
