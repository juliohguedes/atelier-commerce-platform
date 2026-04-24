const CPF_LENGTH = 11;
const CEP_LENGTH = 8;
const repeatedDigitsPattern = /^(\d)\1+$/;

export function onlyDigits(value: string): string {
 return value.replace(/\D/g, "");
}

export function normalizeStateCode(value: string): string {
 return value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 2);
}

export function formatCpf(value: string): string {
 const digits = onlyDigits(value).slice(0, CPF_LENGTH);

 if (digits.length <= 3) {
 return digits;
 }

 if (digits.length <= 6) {
 return `${digits.slice(0, 3)}.${digits.slice(3)}`;
 }

 if (digits.length <= 9) {
 return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
 }

 return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function formatPhoneBR(value: string): string {
 const digits = onlyDigits(value).slice(0, 11);

 if (digits.length <= 2) {
 return digits;
 }

 if (digits.length <= 6) {
 return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
 }

 if (digits.length <= 10) {
 return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
 }

 return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function formatCep(value: string): string {
 const digits = onlyDigits(value).slice(0, CEP_LENGTH);

 if (digits.length <= 5) {
 return digits;
 }

 return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function isValidCpf(value: string): boolean {
 const digits = onlyDigits(value);

 if (digits.length !== CPF_LENGTH || repeatedDigitsPattern.test(digits)) {
 return false;
 }

 const numbers = digits.split("").map(Number);

 const calculateDigit = (baseLength: number) => {
 const sum = numbers
 .slice(0, baseLength)
 .reduce((accumulator, currentValue, index) => {
 const factor = baseLength + 1 - index;
 return accumulator + currentValue * factor;
 }, 0);

 const remainder = (sum * 10) % 11;
 return remainder === 10 ? 0 : remainder;
 };

 const firstDigit = calculateDigit(9);
 const secondDigit = calculateDigit(10);

 return firstDigit === numbers[9] && secondDigit === numbers[10];
}

export function isValidBrazilPhone(value: string): boolean {
 const digits = onlyDigits(value);

 if (!/^\d{10,11}$/.test(digits)) {
 return false;
 }

 const ddd = Number(digits.slice(0, 2));
 if (ddd < 11 || ddd > 99) {
 return false;
 }

 if (digits.length === 11) {
 return digits[2] === "9";
 }

 return true;
}

export function isValidCep(value: string): boolean {
 return /^\d{8}$/.test(onlyDigits(value));
}
