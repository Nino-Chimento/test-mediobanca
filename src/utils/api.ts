import { Inputs } from '@/app/page';

interface ValidationError {
  field: keyof Inputs;
  message: string;
}

interface ValidationResult {
  isValid: boolean;
  data?: Inputs;
  errors?: ValidationError[];
}

async function validateForm(
  inputs: Partial<Inputs>
): Promise<ValidationResult> {
  const errors: ValidationError[] = [];

  // Check that all fields are present
  const requiredFields: (keyof Inputs)[] = [
    'currentAccount',
    'name',
    'lastName',
    'age',
    'email',
    'phone',
  ];

  for (const field of requiredFields) {
    if (!inputs[field]) {
      errors.push({
        field,
        message: `Il campo ${field} è obbligatorio`,
      });
    }
  }

  // If required fields are missing, return errors immediately
  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
    };
  }

  // Validation email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(inputs.email!)) {
    errors.push({
      field: 'email',
      message: 'Indirizzo email non valido',
    });
  }

  // Phone validation (accepts Italian format)
  const phoneRegex = /^(\+39)?[ ]?[0-9]{10}$/;
  if (!phoneRegex.test(inputs.phone!)) {
    errors.push({
      field: 'phone',
      message:
        'Numero di telefono non valido (deve essere un numero italiano di 10 cifre)',
    });
  }

  // Age validation (must be a number between 18 and 120)
  const ageNum = parseInt(inputs.age!);
  if (isNaN(ageNum) || ageNum < 18 || ageNum > 120) {
    errors.push({
      field: 'age',
      message: "L'età deve essere un numero compreso tra 18 e 120",
    });
  }

  // Validate name and surname (at least 2 characters, letters only)
  const nameRegex = /^[A-Za-zÀ-ÿ]+(?:\s+[A-Za-zÀ-ÿ]+)*$/;
  if (!nameRegex.test(inputs.name!)) {
    errors.push({
      field: 'name',
      message: 'Il nome deve contenere almeno 2 caratteri e solo lettere',
    });
  }

  if (!nameRegex.test(inputs.lastName!)) {
    errors.push({
      field: 'lastName',
      message: 'Il cognome deve contenere almeno 2 caratteri e solo lettere',
    });
  }

  // CurrentAccount validation (must be a non-empty string)
  if (
    typeof inputs.currentAccount !== 'string' ||
    inputs.currentAccount.trim() === ''
  ) {
    errors.push({
      field: 'currentAccount',
      message: "L'account deve essere una stringa non vuota",
    });
  }

  // If there are validation errors, return the errors
  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
    };
  }

  // If everything is valid, return the validated data
  return {
    isValid: true,
    data: inputs as Inputs,
  };
}

// Simulate a delay in the validation process
export async function validateFormWithDelay(
  inputs: Partial<Inputs>
): Promise<ValidationResult> {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        if (!inputs) {
          throw new Error('Nessun dato fornito per la validazione');
        }
        const result = await validateForm(inputs);
        resolve(result);
      } catch (error) {
        reject(
          error instanceof Error
            ? error
            : new Error(
                'Si è verificato un errore durante la validazione del form'
              )
        );
      }
    }, 1000);
  });
}

// Simulate a delay in the submit process
export async function submitFormWithDelay(inputs: Inputs): Promise<Inputs> {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        if (!inputs) {
          throw new Error('Dati del form non validi');
        }
        resolve(inputs);
      } catch (error) {
        reject(
          error instanceof Error
            ? error
            : new Error("Si è verificato un errore durante l'invio del form")
        );
      }
    }, 1000);
  });
}

export function fetchAccountTypesDelay(): Promise<string[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(['Conto A', 'Conto B', 'Conto C']);
    }, 1000);
  });
}
