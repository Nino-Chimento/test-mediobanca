'use client';

import { ModalConfirmation } from '@/components/ModalConfirmation';
import {
  fetchAccountTypesDelay,
  submitFormWithDelay,
  validateFormWithDelay,
} from '@/utils/api';
import {
  Box,
  CircularProgress,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
} from '@mui/material';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import toast, { Toaster } from 'react-hot-toast';

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
export type Inputs = {
  currentAccount: string;
  name: string;
  lastName: string;
  age: string;
  email: string;
  phone: string;
};
export default function Home() {
  const {
    data: currentAccount,
    error,
    isLoading,
  } = useSWR('/api/accounts', fetchAccountTypesDelay);

  const { trigger, isMutating: isLoadingSubmit } = useSWRMutation(
    '/api/submit', // chiave dell'endpoint
    (key: string, { arg }: { arg: Inputs }) => submitFormWithDelay(arg)
  );

  const [dataForm, setDataForm] = useState<Inputs>();
  const [openModal, setOpenModal] = useState(false);
  const [selectedCurrentAccount, setSelectedCurrentAccount] =
    useState<string>('');
  const [isLoadingValidation, setIsLoadingValidation] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Inputs>();

  // Watching phone and email fields for conditional validation
  const phone = watch('phone');
  const email = watch('email');

  const handleChange = (event: SelectChangeEvent) => {
    setSelectedCurrentAccount(event.target.value as string);
    setValue('currentAccount', event.target.value as string);
  };

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      setIsLoadingValidation(true);
      const response = await validateFormWithDelay(data);
      if (!response.isValid) {
        response?.errors?.forEach((error) => {
          toast.error(error.message);
        });
        return;
      }
      if (response.isValid && response.data) {
        setOpenModal(true);
        setDataForm(response.data);
      }
    } catch (error) {
      toast.error(error);
    } finally {
      setIsLoadingValidation(false);
    }
  };

  const handleConfirmation = async (inputs: Inputs) => {
    try {
      await trigger(inputs);
      setOpenModal(false);
      toast.success('Dati inviati con successo');
    } catch (error) {
      toast.error("Errore nell'invio dei dati");
      console.error(error);
    }
  };

  if (isLoading)
    return (
      <Box className="flex justify-center items-center h-screen">
        <CircularProgress />
      </Box>
    );
  if (error) return <div>Errore: {error.message}</div>;

  return (
    <Stack width={400} spacing={2} sx={{ margin: 'auto', marginTop: 10 }}>
      <Toaster />
      <form onSubmit={handleSubmit(onSubmit)}>
        <InputLabel id="demo-simple-select-label">Current Account</InputLabel>
        <Select
          fullWidth
          className="mb-4"
          {...register('currentAccount')}
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={selectedCurrentAccount}
          label="Current Account"
          onChange={handleChange}
        >
          {currentAccount?.map((account) => (
            <MenuItem key={account} value={account}>
              {account}
            </MenuItem>
          ))}
        </Select>
        <div className="flex flex-col space-y-4">
          <TextField
            type="text"
            id="outlined-name"
            label="Name"
            variant="outlined"
            {...register('name')}
          />
          <TextField
            type="text"
            id="outlined-lastName"
            label="Last Name"
            variant="outlined"
            {...register('lastName')}
          />
          <TextField
            type="email"
            id="outlined-email"
            label="Email"
            variant="outlined"
            {...register('email', {
              validate: (value) =>
                !value && !phone ? 'Email o telefono è obbligatorio.' : true,
            })}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
          <TextField
            type="text"
            id="outlined-phone"
            label="Phone"
            variant="outlined"
            {...register('phone', {
              validate: (value) =>
                !value && !email ? 'Telefono o email è obbligatorio.' : true,
              pattern: {
                value: /^[0-9]+$/,
                message: 'Il numero di telefono deve contenere solo numeri.',
              },
            })}
            error={!!errors.phone}
            helperText={errors.phone?.message}
          />
          <TextField
            type="number"
            id="outlined-age"
            label="Age"
            variant="outlined"
            {...register('age')}
          />
        </div>

        <button
          disabled={isLoadingValidation}
          type="submit"
          className="mt-4 bg-blue-500 text-white font-bold py-2 px-4 rounded w-full cursor-pointer hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Invia
        </button>
      </form>
      <ModalConfirmation
        open={openModal}
        handleClose={() => setOpenModal(false)}
        inputs={dataForm as Inputs}
        handleConfirmation={(inputs) => handleConfirmation(inputs)}
        loading={isLoadingSubmit}
      />
    </Stack>
  );
}
