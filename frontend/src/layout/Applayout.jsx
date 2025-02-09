import Navbar from '../components/organisms/Navbar';
import { Outlet } from "react-router-dom";

function Applayout() {
  return (
    <div className='flex flex-col md:flex-row'>
      <Navbar/>
      <Outlet/>
      
    </div>
  )
}

export default Applayout;