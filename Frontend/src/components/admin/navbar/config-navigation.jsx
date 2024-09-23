// import SvgColor from 'src/components/svg-color';

import { Box } from "@mui/material";

// ----------------------------------------------------------------------

{/* <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} /> */}
const icon = (name) => (
  <Box
    component="span"
    className="svg-color"
    // ref={ref}
    sx={{
      width: 24,
      height: 24,
      display: 'inline-block',
      bgcolor: 'currentColor',
      mask: `url(/assets/icons/navbar/${name}.svg) no-repeat center / contain`,
      WebkitMask: `url(/assets/icons/navbar/${name}.svg) no-repeat center / contain`,
      // width: 1,
      // height: 1,
    }}
  />
);

const navConfig = [
  {
    title: 'dashboard',
    path: '/admincontrol/',
    icon: icon('ic_analytics'),
  },
  {
    title: 'Brand',
    path: '/admincontrol/Brands',
    icon: icon('ic_blog'),
  },
  {
    title: 'Category',
    path: '/admincontrol/Categories',
    icon: icon('ic_lock'),
  },
  {
    title: 'Branch',
    path: '/admincontrol/Branches',
    icon: icon('ic_blog'),
  },
  {
    title: 'Customer',
    path: '/admincontrol/Suppliers',
    icon: icon('ic_lock'),
  },
  {
    title: 'Products',
    path: '/admincontrol/Products',
    icon: icon('ic_blog'),
  },

  {
    title: 'Inventory',
    path: '/admincontrol/Inventory',
    icon: icon('ic_blog'),
  },

  {
    title: 'Inward Stock',
    path: '/admincontrol/Supplier-Orders',
    icon: icon('ic_lock'),
  },
  {
    title: 'Outward Stock',
    path: '/admincontrol/Branch-Orders',
    icon: icon('ic_blog'),
  },

  {
    title: 'Defective Products',
    path: '/admincontrol/Defectives',
    icon: icon('ic_disabled'),
  },
];

export default navConfig;
