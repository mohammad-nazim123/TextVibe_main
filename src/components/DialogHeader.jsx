import Box from '@mui/material/Box';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

import { responsiveDialogTitleSx } from './responsiveDialog.js';

export default function DialogHeader({ title, onClose, disabled = false }) {
  return (
    <DialogTitle
      sx={{
        ...responsiveDialogTitleSx,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1,
        pr: { xs: 1.25, sm: 1.5 },
      }}
    >
      {/* Drag-handle affordance for the mobile bottom sheet */}
      <Box
        sx={{
          display: { xs: 'block', sm: 'none' },
          position: 'absolute',
          top: 7,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 36,
          height: 4,
          borderRadius: 999,
          bgcolor: 'rgba(26,26,46,.16)',
        }}
      />
      <Box component="span" sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
        {title}
      </Box>
      <IconButton
        aria-label="Close"
        onClick={onClose}
        disabled={disabled}
        sx={{ flex: '0 0 auto', color: 'text.secondary' }}
      >
        <CloseRoundedIcon />
      </IconButton>
    </DialogTitle>
  );
}
