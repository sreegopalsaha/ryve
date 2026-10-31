import Navbar from './Navbar';
import { Outlet, useLocation } from "react-router-dom";
import RightSidebar from './RightSidebar';

function Applayout() {
  const location = useLocation();
  const hideRightSidebar =
    location.pathname.startsWith('/messages') ||
    location.pathname.startsWith('/settings') ||
    location.pathname.startsWith('/edit-profile');

  return (
    <div className='flex min-h-screen theme-background'>
      <Navbar />
      <Outlet />
      {!hideRightSidebar && <RightSidebar />}
    </div>
  );
}

export default Applayout;
