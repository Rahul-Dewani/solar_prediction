import React from 'react';

const Navbar = () => {
  return (
    <div className='Navbar flex justify-between text-white backdrop-blur-sm items-center p-3 fixed w-full z-10 shadow-md'>
      <div className="logo font-bold text-2xl">Intelligent</div>
      <div className="content">
        <ul className='flex gap-8'>
          <li><a href="" className='hover:text-gray-300'>Home</a></li>
          <li><a href="" className='hover:text-gray-300'>About</a></li>
          <li><a href="" className='hover:text-gray-300'>Contact Us</a></li>
        </ul>
      </div>
      <div className="india">
        <img width="60px" src="flag.jpg" alt="India Flag" />
      </div>
    </div>
  );
}

export default Navbar;
