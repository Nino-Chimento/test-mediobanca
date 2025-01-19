'use client';

import { ModalConfirmation } from '@/components/ModalConfirmation';
import {
  fetchAccountTypesDelay,
  submitFormWithDelay,
  validateFormWithDelay,
} from '@/utils/api';
import {
  Alert,
  Box,
  Button,
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
    error: errorFetchAccounts,
    isLoading: isLoadingAccounts,
  } = useSWR('/api/accounts', fetchAccountTypesDelay);

  const { trigger: triggerSubmit, isMutating: isLoadingSubmit } =
    useSWRMutation('/api/submit', (key: string, { arg }: { arg: Inputs }) =>
      submitFormWithDelay(arg)
    );

  const { trigger: triggerValidation, isMutating: isLoadingValidation } =
    useSWRMutation('/api/validation', (key: string, { arg }: { arg: Inputs }) =>
      validateFormWithDelay(arg)
    );

  const [dataForm, setDataForm] = useState<Inputs>();
  const [openModal, setOpenModal] = useState(false);
  const [selectedCurrentAccount, setSelectedCurrentAccount] =
    useState<string>('');

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
      const response = await triggerValidation(data);

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
    }
  };

  const handleConfirmation = async (inputs: Inputs) => {
    try {
      await triggerSubmit(inputs);
      setOpenModal(false);
      toast.success('Dati inviati con successo');
    } catch (error) {
      toast.error("Errore nell'invio dei dati");
      console.error(error);
    }
  };

  if (isLoadingAccounts)
    return (
      <Box
        className="flex justify-center items-center h-screen"
        role="status"
        aria-label="Caricamento dati in corso"
      >
        <CircularProgress aria-hidden="true" />
      </Box>
    );

  if (errorFetchAccounts)
    return (
      <Alert severity="error" role="alert">
        Errore: {errorFetchAccounts?.message}
      </Alert>
    );

  return (
    <Stack
      width={400}
      spacing={2}
      sx={{ margin: 'auto', marginTop: 10 }}
      component="main"
      role="main"
      aria-label="Form di registrazione"
    >
      <Toaster />
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        aria-label="Form di registrazione utente"
      >
        <InputLabel id="current-account-label">Current Account</InputLabel>
        <Select
          fullWidth
          className="mb-4"
          {...register('currentAccount')}
          labelId="current-account-label"
          id="current-account"
          value={selectedCurrentAccount}
          label="Current Account"
          onChange={handleChange}
          aria-describedby={
            errors.currentAccount ? 'current-account-error' : undefined
          }
        >
          {currentAccount?.map((account) => (
            <MenuItem key={account} value={account}>
              {account}
            </MenuItem>
          ))}
        </Select>
        <div
          className="flex flex-col space-y-4"
          role="group"
          aria-labelledby="personal-info-section"
        >
          <TextField
            type="text"
            id="name"
            label="Nome"
            variant="outlined"
            error={!!errors.name}
            helperText={errors.name?.message}
            {...register('name')}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          <TextField
            type="text"
            id="lastName"
            label="Last Name"
            variant="outlined"
            aria-describedby={errors.lastName ? 'lastname-error' : undefined}
            error={!!errors.lastName}
            helperText={errors.lastName?.message}
            {...register('lastName')}
          />
          <TextField
            type="email"
            id="email"
            label="Email"
            variant="outlined"
            {...register('email', {
              validate: (value) =>
                !value && !phone ? 'Email o telefono è obbligatorio.' : true,
            })}
            error={!!errors.email}
            helperText={errors.email?.message}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          <TextField
            type="tel"
            id="phone"
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
            aria-describedby={errors.phone ? 'phone-error' : undefined}
          />
          <TextField
            type="number"
            id="age"
            label="Age"
            variant="outlined"
            {...register('age')}
            error={!!errors.age}
            helperText={errors.age?.message}
            aria-describedby={errors.age ? 'age-error' : undefined}
          />
        </div>

        <Button
          variant="contained"
          disabled={isLoadingValidation}
          loading={isLoadingValidation}
          type="submit"
          className="mt-4 bg-blue-500 text-white font-bold py-2 px-4 rounded w-full cursor-pointer hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          aria-busy={isLoadingValidation}
          aria-disabled={isLoadingValidation}
        >
          Invia
        </Button>
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
