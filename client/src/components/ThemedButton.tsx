/**
 * Themed button component, used for creating buttons with dark mode support
 */
'use client'
import { useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';

interface ThemedButtonProps {
  children: React.ReactNode;
  onClicked: () => void;
  disabled?: boolean;
}

export default function ThemedButton({ children, onClicked, disabled = false }: ThemedButtonProps) {
  const theme = useTheme();
  const [hovered, setHovered] = useState(false);

  const buttonColor = useMemo(
    () => {
      if (theme.palette.mode === 'dark') {
        return hovered ? 'secondary' : 'primary';
      }

      return hovered ? 'primary' : 'secondary';
    },
    [theme.palette.mode, hovered]
  );

  return (
    <Button
      variant="contained"
      color={buttonColor}
      onClick={() => {
        onClicked();
      }}
      sx={(theme) => ({
        fontSize: {
          xs: '12px',
          sm: '12px',
          md: '12px',
          lg: '16px',
          xl: '16px',
        },
        transition: 'background-color 0.35s ease, box-shadow 0.35s ease',
      })}
      onMouseEnter={() => {
        setHovered(true);
      }}
      onMouseLeave={() => {
        setHovered(false);
      }}
    >
      {children}
    </Button>
  )
}
