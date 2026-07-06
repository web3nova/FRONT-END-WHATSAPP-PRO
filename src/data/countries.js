// Country list for the phone country-code picker and location modal.
// Nigeria gets a full state list since this product is Nigeria-first.
// Every other country has an empty `states` array — the LocationModal
// falls back to a free-text "State / Province" input for those.

export const NIGERIA_STATES = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
    'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti',
    'Enugu', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina',
    'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun',
    'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba',
    'Yobe', 'Zamfara', 'FCT (Abuja)',
  ]
  
  export const COUNTRIES = [
    { iso2: 'NG', name: 'Nigeria',        dialCode: '+234', flag: '🇳🇬', states: NIGERIA_STATES },
    { iso2: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪', states: [] },
    { iso2: 'AU', name: 'Australia',      dialCode: '+61',  flag: '🇦🇺', states: [] },
    { iso2: 'BR', name: 'Brazil',         dialCode: '+55',  flag: '🇧🇷', states: [] },
    { iso2: 'CA', name: 'Canada',         dialCode: '+1',   flag: '🇨🇦', states: [] },
    { iso2: 'CM', name: 'Cameroon',       dialCode: '+237', flag: '🇨🇲', states: [] },
    { iso2: 'CN', name: 'China',          dialCode: '+86',  flag: '🇨🇳', states: [] },
    { iso2: 'CI', name: "Côte d'Ivoire",  dialCode: '+225', flag: '🇨🇮', states: [] },
    { iso2: 'DE', name: 'Germany',        dialCode: '+49',  flag: '🇩🇪', states: [] },
    { iso2: 'DZ', name: 'Algeria',        dialCode: '+213', flag: '🇩🇿', states: [] },
    { iso2: 'EG', name: 'Egypt',          dialCode: '+20',  flag: '🇪🇬', states: [] },
    { iso2: 'ES', name: 'Spain',          dialCode: '+34',  flag: '🇪🇸', states: [] },
    { iso2: 'ET', name: 'Ethiopia',       dialCode: '+251', flag: '🇪🇹', states: [] },
    { iso2: 'FR', name: 'France',         dialCode: '+33',  flag: '🇫🇷', states: [] },
    { iso2: 'GB', name: 'United Kingdom', dialCode: '+44',  flag: '🇬🇧', states: [] },
    { iso2: 'GH', name: 'Ghana',          dialCode: '+233', flag: '🇬🇭', states: [] },
    { iso2: 'ID', name: 'Indonesia',      dialCode: '+62',  flag: '🇮🇩', states: [] },
    { iso2: 'IN', name: 'India',          dialCode: '+91',  flag: '🇮🇳', states: [] },
    { iso2: 'IT', name: 'Italy',          dialCode: '+39',  flag: '🇮🇹', states: [] },
    { iso2: 'KE', name: 'Kenya',          dialCode: '+254', flag: '🇰🇪', states: [] },
    { iso2: 'MA', name: 'Morocco',        dialCode: '+212', flag: '🇲🇦', states: [] },
    { iso2: 'PH', name: 'Philippines',    dialCode: '+63',  flag: '🇵🇭', states: [] },
    { iso2: 'PK', name: 'Pakistan',       dialCode: '+92',  flag: '🇵🇰', states: [] },
    { iso2: 'RW', name: 'Rwanda',         dialCode: '+250', flag: '🇷🇼', states: [] },
    { iso2: 'SA', name: 'Saudi Arabia',   dialCode: '+966', flag: '🇸🇦', states: [] },
    { iso2: 'SN', name: 'Senegal',        dialCode: '+221', flag: '🇸🇳', states: [] },
    { iso2: 'TN', name: 'Tunisia',        dialCode: '+216', flag: '🇹🇳', states: [] },
    { iso2: 'TR', name: 'Turkey',         dialCode: '+90',  flag: '🇹🇷', states: [] },
    { iso2: 'TZ', name: 'Tanzania',       dialCode: '+255', flag: '🇹🇿', states: [] },
    { iso2: 'UG', name: 'Uganda',         dialCode: '+256', flag: '🇺🇬', states: [] },
    { iso2: 'US', name: 'United States',  dialCode: '+1',   flag: '🇺🇸', states: [] },
    { iso2: 'ZA', name: 'South Africa',   dialCode: '+27',  flag: '🇿🇦', states: [] },
  ]
  
  export const DEFAULT_COUNTRY = COUNTRIES[0] // Nigeria