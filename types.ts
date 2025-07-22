export enum AppMode {
  Converter = 'Converter',
  Translator = 'Translator'
}

export interface CurrencyConversion {
  originalJPY: string;
  amountEUR: number;
}

export interface TranslationResult {
  fullTranslationSpanish: string;
  currencyConversions: CurrencyConversion[];
}

// Represents the possible states of the camera feature
export enum CameraStatus {
  Idle,
  Requesting,
  Active,
  Scanning,
  Success,
  Error
}