/**
 * Search bar component for the top navigation bar
 * 
 * @since create-tickets--JP
 */
'use client';
import { useState } from 'react';
import { alpha, styled } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import { useRouter } from 'next/navigation';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.grey[200],
  color: '#121212',
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: '5px',
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
  },
}));

export default function SearchBar({ style }: { style?: React.CSSProperties }) {
  const router = useRouter();
  const [value, setSearch] = useState('');

  const onSearch = (value: string) => {
    const encodedValue = encodeURIComponent(value);

    router.push(`/tickets/search?keywords=${encodedValue}`);
  }

  return (
    <Search style={style}>
      <SearchIconWrapper>
        <SearchIcon />
      </SearchIconWrapper>
      <StyledInputBase
        placeholder={`Search for an event...`}
        inputProps={{ 'aria-label': 'search' }}
        value={value}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onSearch(value);
          }
        }}
      />
    </Search>
  );
}
