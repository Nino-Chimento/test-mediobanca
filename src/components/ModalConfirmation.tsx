import { Inputs } from '@/app/page';
import { Box, Button, Modal, Typography } from '@mui/material';
import { useEffect, useRef } from 'react';

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
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [open, handleClose]);

  useEffect(() => {
    if (open && confirmButtonRef.current) {
      confirmButtonRef.current.focus();
    }
  }, [open]);

  const keyTranslations: Record<string, string> = {
    currentAccount: 'Tipo di Account',
    name: 'Nome',
    lastName: 'Cognome',
    age: 'Età',
    email: 'Email',
    phone: 'Telefono',
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      className="flex justify-center items-center h-screen"
      role="dialog"
      aria-modal="true"
    >
      <Box
        className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4"
        role="document"
        aria-label="Finestra di conferma dati"
        tabIndex={-1}
      >
        <Typography
          id="modal-title"
          variant="h6"
          component="h2"
          className="mb-4 text-black font-semibold"
        >
          Conferma i dati inseriti
        </Typography>

        <div
          id="modal-description"
          className="space-y-2 mb-6"
          role="region"
          aria-label="Riepilogo dati inseriti"
        >
          {inputs &&
            Object.entries(inputs).map(([key, value]) => (
              <div key={key} className="flex flex-col">
                <Typography component="dt" className="font-medium text-black">
                  {keyTranslations[key] || key}:
                </Typography>
                <Typography component="dd" className="ml-2 text-black">
                  {value || 'Non specificato'}
                </Typography>
              </div>
            ))}
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            onClick={handleClose}
            variant="outlined"
            className="mr-2 text-black"
            aria-label="Annulla e chiudi il modale"
          >
            Annulla
          </Button>
          <Button
            ref={confirmButtonRef}
            disabled={loading}
            onClick={() => handleConfirmation(inputs)}
            variant="contained"
            className="text-black"
            aria-busy={loading}
            aria-disabled={loading}
          >
            {loading ? 'Invio in corso...' : 'Conferma dati'}
          </Button>
        </div>
      </Box>
    </Modal>
  );
};
