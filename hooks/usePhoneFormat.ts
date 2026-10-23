import { useState } from 'react';

/**
 * Custom hook for automatic phone number formatting
 * Formats any input to +996 XXX XXX XXX (Kyrgyzstan format)
 * 
 * Usage:
 * const [phone, handlePhoneChange] = usePhoneFormat();
 * <input value={phone} onChange={handlePhoneChange} />
 */
export function usePhoneFormat(initialValue: string = ''): [string, (e: React.ChangeEvent<HTMLInputElement>) => void] {
  const [phone, setPhone] = useState(initialValue);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  return [phone, handlePhoneChange];
}

/**
 * Format phone number to +996 XXX XXX XXX
 * 
 * Examples:
 * - "123456789" -> "+996 123 456 789"
 * - "996123456789" -> "+996 123 456 789"
 * - "+996 123 456 789" -> "+996 123 456 789"
 * - "0555123456" -> "+996 555 123 456"
 */
export function formatPhoneNumber(value: string): string {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '');
  
  // If starts with 996, remove it (we'll add it back)
  const cleanDigits = digits.startsWith('996') ? digits.slice(3) : digits;
  
  // If starts with 0, remove it (local format)
  const finalDigits = cleanDigits.startsWith('0') ? cleanDigits.slice(1) : cleanDigits;
  
  // Limit to 9 digits (Kyrgyzstan mobile number)
  const limitedDigits = finalDigits.slice(0, 9);
  
  // Format: +996 XXX XXX XXX
  if (limitedDigits.length === 0) {
    return '';
  } else if (limitedDigits.length <= 3) {
    return `+996 ${limitedDigits}`;
  } else if (limitedDigits.length <= 6) {
    return `+996 ${limitedDigits.slice(0, 3)} ${limitedDigits.slice(3)}`;
  } else {
    return `+996 ${limitedDigits.slice(0, 3)} ${limitedDigits.slice(3, 6)} ${limitedDigits.slice(6)}`;
  }
}
