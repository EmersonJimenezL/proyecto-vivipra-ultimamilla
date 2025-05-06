import { AbstractControl, ValidationErrors } from '@angular/forms';

export function rutValidator(
  control: AbstractControl
): ValidationErrors | null {
  const rut = control.value;

  if (!rut) return null;

  // Validar formato: 12.345.678-K o similar
  const rutRegex = /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/;
  if (!rutRegex.test(rut)) {
    return { rutInvalido: true };
  }

  // Limpiar puntos y separar dígito verificador
  const [num, dv] = rut.split('-');
  const cleanRut = num.replace(/\./g, '');

  let suma = 0;
  let multiplo = 2;

  for (let i = cleanRut.length - 1; i >= 0; i--) {
    suma += parseInt(cleanRut[i], 10) * multiplo;
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }

  const resto = suma % 11;
  const expectedDv =
    resto === 1 ? 'K' : resto === 0 ? '0' : (11 - resto).toString();

  if (dv.toUpperCase() !== expectedDv) {
    return { rutInvalido: true };
  }

  return null;
}
