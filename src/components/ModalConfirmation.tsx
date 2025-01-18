import { Inputs } from '@/app/page';
import { Box, Button, Modal, Typography } from '@mui/material';
interface ModalConfirmationProps {
  open: boolean;
  handleClose: () => void;
  inputs: Inputs;
  handleConfirmation: (inputs: Inputs) => void;
  loading: boolean;
}

export const ModalConfirmation = ({
  open,
  handleClose,
  inputs,
  handleConfirmation,
  loading,
}: ModalConfirmationProps) => {
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      className="flex justify-center items-center h-screen"
    >
      <Box>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Recap dati inseriti
        </Typography>
        {inputs &&
          Object.entries(inputs).map(([key, value]) => (
            <Typography key={key} id="modal-modal-description" sx={{ mt: 2 }}>
              {key}: {value}
            </Typography>
          ))}
        <Button
          disabled={loading}
          loading={loading}
          onClick={() => handleConfirmation(inputs)}
          variant="contained"
        >
          Conferma Invio
        </Button>
      </Box>
    </Modal>
  );
};
