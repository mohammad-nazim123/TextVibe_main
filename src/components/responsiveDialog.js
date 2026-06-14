import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

export function useResponsiveDialogProps({ maxWidth = 'sm', paperSx = {} } = {}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return {
    isMobile,
    dialogProps: {
      fullWidth: true,
      maxWidth,
      scroll: 'paper',
      sx: isMobile
        ? {
            '& .MuiDialog-container': {
              alignItems: 'flex-end',
            },
          }
        : undefined,
      PaperProps: {
        sx: {
          m: { xs: 0, sm: 4 },
          width: { xs: '100%', sm: undefined },
          maxWidth: { xs: '100%', sm: undefined },
          borderRadius: { xs: '18px 18px 0 0', sm: 3 },
          maxHeight: { xs: 'calc(100dvh - 16px)', sm: 'calc(100% - 64px)' },
          overflow: 'hidden',
          ...paperSx,
        },
      },
    },
  };
}

export const responsiveDialogTitleSx = {
  px: { xs: 2, sm: 3 },
  pt: { xs: 2, sm: 2.5 },
  pb: { xs: 1, sm: 1.5 },
  fontWeight: 900,
};

export const responsiveDialogContentSx = {
  px: { xs: 2, sm: 3 },
  pb: { xs: 2.5, sm: 3 },
  overflowX: 'hidden',
};
