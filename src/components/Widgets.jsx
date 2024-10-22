import React from 'react';
import { FaPhoneAlt, FaWhatsapp, FaInstagram } from "react-icons/fa";
import { MdOutlineMail } from "react-icons/md";

const Widgets = () => {
    return (
        <div className='fixed right-0 top-1/2 z-10 flex flex-col gap-4 transform -translate-y-1/2'>
            <div className='flex relative hover:translate-x-[-230px] transition-transform duration-1000 right-[-250px]'>
                <div className='bg-black bg-opacity-70 p-4 rounded-md rounded-r-none shadow-lg hover:scale-105 transition-transform duration-300 ease-out'>
                    <FaPhoneAlt className='text-white w-6 h-6' />
                </div>
                <div className='bg-gradient-to-r from-red-600 to-red-400 text-white px-4 py-2 w-[250px] rounded-l-md shadow-lg'>
                    <h2 className='text-lg font-semibold'>Rahul</h2>
                    <h1 className='text-sm'>9511769289</h1>
                </div>
            </div>

            <div className='flex relative hover:translate-x-[-230px] transition-transform duration-1000 right-[-250px]'>
                <div className='bg-black bg-opacity-70 p-4 rounded-md rounded-r-none shadow-lg hover:scale-105 transition-transform duration-300 ease-out'>
                    <FaWhatsapp className='text-white w-6 h-6' />
                </div>
                <div className='bg-gradient-to-r from-green-600 to-green-400 text-white px-4 py-2 w-[250px] rounded-l-md shadow-lg'>
                    <h2 className='text-lg font-semibold'>Piyush</h2>
                    <h1 className='text-sm'>8208536261</h1>
                </div>
            </div>

            <div className='flex relative hover:translate-x-[-230px] transition-transform duration-1000 right-[-250px]'>
                <div className='bg-black bg-opacity-70 p-4 rounded-md rounded-r-none shadow-lg hover:scale-105 transition-transform duration-300 ease-out'>
                    <FaInstagram className='text-white w-6 h-6' />
                </div>
                <div className='bg-gradient-to-r from-purple-600 to-purple-400 text-white px-4 py-2 w-[250px] rounded-l-md shadow-lg'>
                    <h2 className='text-lg font-semibold'>Neeraj</h2>
                    <h1 className='text-sm'>@neerajkoulgi.07</h1>
                </div>
            </div>

            <div className='flex relative hover:translate-x-[-230px] transition-transform duration-1000 right-[-250px]'>
                <div className='bg-black bg-opacity-70 p-4 rounded-md rounded-r-none shadow-lg hover:scale-105 transition-transform duration-300 ease-out'>
                    <MdOutlineMail className='text-white w-6 h-6' />
                </div>
                <div className='bg-gradient-to-r from-blue-600 to-blue-400 text-white px-4 py-2 w-[250px] rounded-l-md shadow-lg'>
                    <h2 className='text-lg font-semibold'>Spandan</h2>
                    <h1 className='text-sm'>spandan.k.435@gmail.com</h1>
                </div>
            </div>
        </div>
    );
}

export default Widgets;
