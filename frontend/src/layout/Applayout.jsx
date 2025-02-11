import Navbar from './Navbar';
import { Outlet } from "react-router-dom";
import RightSidebar from './RightSidebar';

function Applayout() {
  return (
    <div className='flex min-h-screen'>
      <Navbar />
      <Outlet />
      <RightSidebar />
    </div>
  );
}

export default Applayout;