/**
 * Top navigation bar component for the storefront
 * 
 * @since  material-UI-sass--JP
 */
import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Badge from '@mui/material/Badge';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import AccountCircleOutlined from '@mui/icons-material/AccountCircleOutlined';
import { STYLE_CONSTS } from '../styles/consts';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import LogoutIcon from '@mui/icons-material/Logout';
import { useRouter, usePathname } from 'next/navigation';
import { useCurrentUser } from '../app/CurrentUserContext';
import Drawer from '@mui/material/Drawer';
import AppLink from './AppLink';
import TopNavSearchBar from './TopNavSearchBar';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import SearchIcon from '@mui/icons-material/Search';

/** Paths where the nav search bar is hidden */
const SEARCH_BAR_HIDDEN_PATHS = ['/', '/tickets/create', '/tickets/search', '/selltickets'];

export default function PrimarySearchAppBar() {
  const { currentUser, signOut } = useCurrentUser();
  const router = useRouter();
  const pathname = usePathname();
  const [searchBarIsOpen, setSearchBarIsOpen] = React.useState(false);

  const handleMobileSearchMenuToggle = () => {
    setSearchBarIsOpen(!searchBarIsOpen);
  };

  const showSearchBar = !SEARCH_BAR_HIDDEN_PATHS.some(
    (path) => path === '/' ? pathname === '/' : pathname === path || pathname.startsWith(path + '/')
  );

  /**
   * RENDERED DESKTOP PROFILE MENU
   */
  const [profileAnchorEl, setProfileAnchorEl] = React.useState<null | HTMLElement>(null);
  const isProfileMenuOpen = Boolean(profileAnchorEl);
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchorEl(event.currentTarget);
  };
  const handleProfileMenuClose = async (action?: string) => {
    setProfileAnchorEl(null);

    await handleProfileMenuAction(action);
  };
  const menuId = 'primary-search-account-menu';
  const renderedProfileMenu = <Menu
    anchorEl={profileAnchorEl}
    anchorOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    id={menuId}
    keepMounted
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    open={isProfileMenuOpen}
    onClose={() => handleProfileMenuClose()}
  >
    {currentUser ? (
      <div>
        <MenuItem onClick={() => handleProfileMenuClose('myaccount')}>My account</MenuItem>
        <MenuItem onClick={() => handleProfileMenuClose('signout')}>Sign out</MenuItem>
      </div>
    ) : (
      <div>
        <MenuItem onClick={() => handleProfileMenuClose('signin')}>Sign in</MenuItem>
        <MenuItem onClick={() => handleProfileMenuClose('signup')}>Sign up</MenuItem>
      </div>
    )}
  </Menu>;

  const [mobileProfileAnchorEl, setMobileProfileAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const isMobileProfileMenuOpen = Boolean(mobileProfileAnchorEl);
  const handleMobileProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileProfileAnchorEl(event.currentTarget);
  };
  const handleMobileProfileMenuClose = async (action?: string) => {
    setMobileProfileAnchorEl(null);

    await handleProfileMenuAction(action);
  };

  /**
   * RENDERED MOBILE PROFILE MENU
   */
  const mobileProfileMenuId = 'primary-search-account-menu-mobile-profile';
  const renderedMobileProfileMenu = (
    <Menu
      anchorEl={mobileProfileAnchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={mobileProfileMenuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMobileProfileMenuOpen}
      onClose={() => handleMobileProfileMenuClose()}
    >
      {currentUser ? (
        <div>
          <MenuItem onClick={() => handleMobileProfileMenuClose('myaccount')}>
            <IconButton
              size="large"
              aria-label="sign in"
              aria-controls="primary-search-account-menu"
              aria-haspopup="true"
              color="inherit"
            >
              <Badge>
                <ManageAccountsIcon />
              </Badge>
            </IconButton>
            <p>My account</p>
          </MenuItem>

          <MenuItem onClick={() => handleMobileProfileMenuClose('signout')}>
            <IconButton
              size="large"
              aria-label="sign out"
              aria-controls="primary-search-account-menu"
              aria-haspopup="true"
              color="inherit"
            >
              <Badge>
                <LogoutIcon />
              </Badge>
            </IconButton>
            <p>Sign out</p>
          </MenuItem>
        </div>
      ) : (
        <div>
          <MenuItem onClick={() => handleMobileProfileMenuClose('signin')}>
            <IconButton
              size="large"
              aria-label="sign in"
              aria-controls="primary-search-account-menu"
              aria-haspopup="true"
              color="inherit"
            >
              <Badge>
                <AccountCircleOutlined />
              </Badge>
            </IconButton>
            <p>Sign in</p>
          </MenuItem>

          <MenuItem onClick={() => handleMobileProfileMenuClose('signup')}>
            <IconButton
              size="large"
              aria-label="sign up"
              aria-controls="primary-search-account-menu"
              aria-haspopup="true"
              color="inherit"
            >
              <Badge>
                <AccountCircleOutlined />
              </Badge>
            </IconButton>
            <p>Sign up</p>
          </MenuItem>
        </div>
      )}
    </Menu>
  );

  /**
   * Handles the action for the profile menu (mobile and desktop)
   *
   * @param action - The action to handle
   *
   * @returns {Promise<void>}
   */
  const handleProfileMenuAction = async (action?: string) => {
    switch (action) {
      case 'signout':
        await signOut();
        router.push('/');
        break;
      case 'signin':
        router.push('/auth/signin');
        break;
      case 'signup':
        router.push('/auth/signup');
        break;
      case 'myaccount':
        // router.push('auth/myaccount');
        break;
      default:
        break;
    }
  };

  /**
   * RENDERED MOBILE DRAWER MENU
   */
  const [mobileDrawerOpen, setMobileDrawerOpen] = React.useState(false);
  const isMobileDrawerOpen = Boolean(mobileDrawerOpen);
  const handleMobileDrawerOpen = () => {
    setMobileDrawerOpen(true);
  };
  const handleMobileDrawerClose = () => {
    setMobileDrawerOpen(false);
  };
  const renderedMobileDrawer = (
    <Drawer
      anchor="left"
      open={isMobileDrawerOpen}
      onClose={handleMobileDrawerClose}
      variant="temporary"
      sx={{
        '& .MuiDrawer-paper': {
          width: '250px',
        },
      }}
    >
      <Box
        sx={{
          minHeight: '50px',
          padding: 2,
          backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'none' : theme.palette.primary.light,
          color: (theme) => theme.palette.mode === 'dark' ? 'inherit' : 'white',
          mb: 2,
        }}>
        <AppLink href="/" sx={{ textDecoration: 'none', color: 'inherit' }}>
          <Typography
            variant="body2"
            noWrap
            component="p"
            sx={{ display: { xs: 'block', sm: 'block' }, fontWeight: 400, fontSize: '25px' }}
          >
            <span style={{ fontSize: '26.5px' }}>B</span>ig<span style={{ marginLeft: '-1px', fontSize: '26.5px' }}>T</span>ix
          </Typography>
        </AppLink>
      </Box>
      {currentUser ? (
        <div>
          <MenuItem onClick={() => handleDrawerMenuSelect('myaccount')}>My account</MenuItem>
          <MenuItem onClick={() => handleDrawerMenuSelect('sell')}>Sell</MenuItem>
          <MenuItem onClick={() => handleDrawerMenuSelect('mytickets')}>My tickets</MenuItem>
          <MenuItem onClick={() => handleDrawerMenuSelect('signout')}>Sign out</MenuItem>
        </div>
      ) : (
        <div>
          <MenuItem onClick={() => handleDrawerMenuSelect('signin')}>Sign in</MenuItem>
          <MenuItem onClick={() => handleDrawerMenuSelect('signup')}>Sign up</MenuItem>
          <MenuItem onClick={() => handleDrawerMenuSelect('sell')}>Sell</MenuItem>
          <MenuItem onClick={() => handleDrawerMenuSelect('mytickets')}>My tickets</MenuItem>
        </div>
      )}
    </Drawer>
  );

  /**
   * Handles the action for the drawer menu
   *
   * @param action - The action to handle
   *
   * @returns {Promise<void>}
   */
  const handleDrawerMenuSelect = async (action?: string) => {
    handleMobileDrawerClose();

    switch (action) {
      case 'signout':
        handleProfileMenuAction(action);
        break;
      case 'signin':
        handleProfileMenuAction(action);
        break;
      case 'signup':
        handleProfileMenuAction(action);
        break;
      case 'myaccount':
        handleProfileMenuAction(action);
        break;
      case 'sell':
        router.push('/selltickets');
        break;
      case 'mytickets':
        router.push('/tickets/mytickets');
        break;
      default:
        break;
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="static"
        sx={{
          minHeight: {
            xs: 'auto',
            sm: `${STYLE_CONSTS.HEADER_HEIGHT}px`,
            md: `${STYLE_CONSTS.HEADER_HEIGHT}px`,
            lg: `${STYLE_CONSTS.HEADER_HEIGHT}px`,
            xl: `${STYLE_CONSTS.HEADER_HEIGHT}px`,
          },
          padding: {
            xs: '0px',
            sm: '0px',
            md: '0 6px 0 6px',
            lg: '0 6px 0 6px',
            xl: '0 6px 0 6px',
          }
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'space-between'
          }}
        >
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="open drawer"
            sx={{
              mr: 2,
              display: { xs: 'flex', sm: 'flex', md: 'none', lg: 'none', xl: 'none' }
            }}
            onClick={handleMobileDrawerOpen}
          >
            {/* <MenuIcon /> */}
            <Typography variant="body1" fontWeight={500} sx={{ fontSize: '1rem', pr: 1 }}>Menu</Typography>
            <KeyboardArrowRightIcon fontSize="small" />
          </IconButton>

          <Box sx={{ marginRight: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
            <AppLink href="/" sx={{ textDecoration: 'none', color: 'inherit' }}>
              <Typography
                variant="body2"
                noWrap
                component="p"
                sx={{ display: { xs: 'block', sm: 'block' }, fontWeight: 400, fontSize: '25px' }}
              >
                <span style={{ fontSize: '26.5px' }}>B</span>ig<span style={{ marginLeft: '-1px', fontSize: '26.5px' }}>T</span>ix
              </Typography>
            </AppLink>

            {showSearchBar && (
              <Box sx={{ display: { xs: 'none', sm: 'none', md: 'flex', lg: 'flex', xl: 'flex' } }}>
                <TopNavSearchBar />
              </Box>
            )}
          </Box>

          <Box sx={{
            display: { xs: 'none', sm: 'none', md: 'flex', lg: 'flex', xl: 'flex' },
            alignSelf: 'center',
            alignItems: 'center',
            gap: 1,
          }}>
            <AppLink href="/selltickets" sx={{ textDecoration: 'none', color: 'inherit', mr: 4 }}>
              <Typography
                variant="caption"
                noWrap
                component="span"
                sx={{ fontFamily: 'oswald', fontWeight: 400, fontSize: '20px', '&:hover': { textDecoration: 'underline' } }}
              >
                Sell Tickets
              </Typography>
            </AppLink>

            <AppLink href="/tickets/mytickets" sx={{ textDecoration: 'none', color: 'inherit', mr: 4 }}>
              <Typography
                variant="caption"
                noWrap
                component="span"
                sx={{ fontFamily: 'oswald', fontWeight: 400, fontSize: '20px', '&:hover': { textDecoration: 'underline' } }}
              >
                My Tickets
              </Typography>
            </AppLink>

            <IconButton
              size="large"
              edge="end"
              aria-label={currentUser ? 'account of current user' : 'sign in'}
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              {currentUser ? <AccountCircle /> : <AccountCircleOutlined />}
            </IconButton>
          </Box>
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
            {showSearchBar && (
              <IconButton
                size="large"
                aria-label="Search"
                aria-controls={mobileProfileMenuId}
                aria-haspopup="true"
                onClick={handleMobileSearchMenuToggle}
                color="inherit"
              >
                <SearchIcon fontSize="medium" />
              </IconButton>
            )}

            <IconButton
              size="large"
              aria-label="Profile menu"
              aria-controls={mobileProfileMenuId}
              aria-haspopup="true"
              onClick={handleMobileProfileMenuOpen}
              color="inherit"
            >
              {currentUser ? <AccountCircle /> : <AccountCircleOutlined />}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      {renderedMobileProfileMenu}
      {renderedProfileMenu}
      {renderedMobileDrawer}
      {showSearchBar && searchBarIsOpen && (
        <AppBar
          position="static"
          sx={{ backgroundColor: 'transparent',
            display: { xs: 'flex', sm: 'flex', md: 'none', lg: 'none', xl: 'none' }
          }}
        >
          <Toolbar>
            <TopNavSearchBar style={{ display: 'flex', alignItems: 'center', flexGrow: 1, padding: '4px 0px' }} />
          </Toolbar>
        </AppBar>
      )}
    </Box>
  );
}
