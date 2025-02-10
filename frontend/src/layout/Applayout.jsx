import Navbar from '../components/organisms/Navbar';
import { Outlet } from "react-router-dom";
import RightSidebar from '../components/organisms/RightSidebar';

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