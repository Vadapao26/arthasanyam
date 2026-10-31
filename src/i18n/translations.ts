import { Category, Language, LanguageDefinition } from '../types';

export const DEFAULT_LANGUAGES: LanguageDefinition[] = [
  {
    code: 'mr',
    nativeLabel: 'मराठी',
    shortLabel: 'मराठी',
    locale: 'mr-IN',
    isCustom: false,
    useDevanagariDigits: true,
  },
  {
    code: 'hi',
    nativeLabel: 'हिंदी',
    shortLabel: 'हिंदी',
    locale: 'hi-IN',
    isCustom: false,
    useDevanagariDigits: true,
  },
  {
    code: 'en',
    nativeLabel: 'English',
    shortLabel: 'EN',
    locale: 'en-IN',
    isCustom: false,
    useDevanagariDigits: false,
  },
];

export const PRESET_ADDITIONAL_LANGUAGES: LanguageDefinition[] = [
  {
    code: 'kok',
    nativeLabel: 'कोंकणी (Konkani)',
    shortLabel: 'कोंकणी',
    locale: 'kok-IN',
    isCustom: true,
    useDevanagariDigits: true,
  },
  {
    code: 'sa',
    nativeLabel: 'संस्कृतम् (Sanskrit)',
    shortLabel: 'संस्कृतम्',
    locale: 'sa-IN',
    isCustom: true,
    useDevanagariDigits: true,
  },
  {
    code: 'gu',
    nativeLabel: 'ગુજરાતી (Gujarati)',
    shortLabel: 'ગુજરાતી',
    locale: 'gu-IN',
    isCustom: true,
    useDevanagariDigits: false,
  },
  {
    code: 'kn',
    nativeLabel: 'ಕನ್ನಡ (Kannada)',
    shortLabel: 'ಕನ್ನಡ',
    locale: 'kn-IN',
    isCustom: true,
    useDevanagariDigits: false,
  },
  {
    code: 'te',
    nativeLabel: 'తెలుగు (Telugu)',
    shortLabel: 'తెలుగు',
    locale: 'te-IN',
    isCustom: true,
    useDevanagariDigits: false,
  },
  {
    code: 'ta',
    nativeLabel: 'தமிழ் (Tamil)',
    shortLabel: 'தமிழ்',
    locale: 'ta-IN',
    isCustom: true,
    useDevanagariDigits: false,
  },
];

const DEVANAGARI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

export function toDevanagariDigits(value: number | string, lang: Language): string {
  const str = String(value);
  if (lang === 'en' || lang === 'gu' || lang === 'kn' || lang === 'te' || lang === 'ta') {
    return str;
  }
  return str.replace(/[0-9]/g, (d) => DEVANAGARI_DIGITS[Number(d)]);
}

export function formatINR(amount: number, lang: Language, useDevanagariNumerals = false): string {
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
  const finalStr = useDevanagariNumerals ? toDevanagariDigits(formatted, lang) : formatted;
  return `₹${finalStr}`;
}

export function getCategoryLabel(cat: Category | undefined, lang: Language): string {
  if (!cat) return '—';
  return cat.labels[lang] || cat.labels.mr || cat.labels.en || cat.id;
}

export function formatRelativeTime(isoString: string, lang: Language): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 2) {
    return lang === 'mr' || lang === 'kok' || lang === 'sa'
      ? 'आत्ताच'
      : lang === 'hi'
      ? 'अभी-अभी'
      : 'Just now';
  }
  if (diffMins < 60) {
    const m = toDevanagariDigits(diffMins, lang);
    return lang === 'mr' || lang === 'kok'
      ? `${m} मिनिटांपूर्वी`
      : lang === 'hi'
      ? `${m} मिनट पहले`
      : `${diffMins}m ago`;
  }
  if (diffHours < 24 && date.getDate() === now.getDate()) {
    const timeStr = date.toLocaleTimeString(lang === 'en' ? 'en-IN' : 'mr-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return lang === 'mr' || lang === 'hi' ? `आज, ${timeStr}` : `Today, ${timeStr}`;
  }
  if (diffDays === 1 || (diffHours < 48 && date.getDate() !== now.getDate())) {
    return lang === 'mr' ? 'काल' : lang === 'hi' ? 'कल (बीता)' : 'Yesterday';
  }
  return date.toLocaleDateString(lang === 'en' ? 'en-IN' : 'mr-IN', {
    day: 'numeric',
    month: 'short',
  });
}

const BASE_TRANSLATIONS: Record<'mr' | 'hi' | 'en', Record<string, string>> = {
  mr: {
    appName: 'अर्थसंयम',
    appTagline: 'पारंपरिक महाराष्ट्रीयन जमाखर्च आणि वारली संस्कृतीवर आधारित १००% ऑफलाईन तिजोरी',
    privacyMandateBadge: '१००% ऑफलाईन • शून्य इंटरनेट परवानगी • स्थानिक सुरक्षित साठवणूक',
    selectLanguagePrompt: 'आपली भाषा निवडा (Select Language)',
    authTitle: 'स्थानिक तिजोरी प्रवेश (Local Vault)',
    authSubtitle: 'पासकोड, पॅटर्न लॉक, फिंगरप्रिंट किंवा फेस आयडी (Face ID) वापरून आपली स्थानिक तिजोरी उघडा.',
    userIdLabel: 'स्थानिक युजर आयडी (User ID)',
    userIdPlaceholder: 'उदा. siddharth_01',
    passcodeLabel: 'स्थानिक पासकोड (४-८ अंक / अक्षरे)',
    passcodePlaceholder: '••••',
    unlockVaultBtn: 'तिजोरी उघडा (Unlock Vault)',
    createVaultBtn: 'नवीन स्थानिक तिजोरी तयार करा',
    quickDemoBtn: 'त्वरित डेमो जमाखर्च उघडा (1-Click Demo)',
    encryptionProofTitle: 'स्थानिक सुरक्षित साठवणूक (AES-GCM / SHA-256)',
    zeroInternetProof: 'AndroidManifest: INTERNET Permission Removed',

    // Lock Screen Biometrics & Pattern
    authTabPasscode: 'पासकोड',
    authTabPattern: 'पॅटर्न लॉक',
    authTabFingerprint: 'फिंगरप्रिंट',
    authTabFaceId: 'फेस आयडी (Face ID)',
    patternPrompt: 'ठिपके जोडून आपला पॅटर्न काढा (उदा. पहिले ४ ठिपके किंवा L-आकार)',
    fingerprintPrompt: 'स्थानिक बायोमेट्रिक सेन्सरवर बोट ठेवा',
    faceIdPrompt: 'स्थानिक फेस आयडी (Face ID) स्कॅन करण्यासाठी खालील बटण दाबा',
    scanBiometricBtn: 'आता बायोमेट्रिक स्कॅन करा व तिजोरी उघडा',

    // Top Bar & Navigation
    streakDays: 'दिवस सातत्य',
    navVault: 'गृह (The Vault)',
    navAnalytics: 'ताळेबंद व बजेट',
    navAccounts: 'तिजोरी (खाती)',
    navCategories: 'वर्गवारी',
    navHabits: 'सवयी व सूचना',
    navSettings: 'सेटिंग्ज (Settings)',
    navPrivacyDb: 'स्थानिक डेटाबेस',
    lockVault: 'तिजोरी लॉक करा',
    soundEnabled: 'नाद चालू',
    soundMuted: 'नाद बंद',

    // Module 2: Dashboard
    netWealthLabel: 'एकूण निव्वळ संपत्ती (Total Net Wealth)',
    currentMonthRevenue: 'चालू महिना जमा (Revenue)',
    currentMonthExpense: 'चालू महिना खर्च (Expense)',
    savingsRateLabel: 'बचत प्रमाण',
    accountsCarouselTitle: 'स्थानिक खाती व तिजोरी (Local Vaults)',
    manageAllAccounts: 'सर्व खाती पहा →',
    recentActivityTitle: 'अलीकडील जमाखर्च नोंदवही (Jamakharch Ledger)',
    filterAll: 'सर्व नोंदी',
    filterRevenue: 'फक्त जमा (+)',
    filterExpense: 'फक्त खर्च (-)',
    noTransactionsYet: 'अद्याप कोणतीही जमाखर्च नोंद नाही.',
    fabAddRevenue: '+ जमा (Revenue)',
    fabAddExpense: '- खर्च (Expense)',

    // Module 3: Accounts & Vault Management
    vaultModuleTitle: 'बँक खाती आणि बचत तिजोरी व्यवस्थापन',
    vaultModuleDesc: 'तुमची सर्व बँक खाती, मुदत ठेव (FD) आणि रोख पाकीट एकाच ठिकाणी ऑफलाईन व्यवस्थापित करा.',
    addAccountTitle: 'नवीन खाते / तिजोरी जोडा',
    accountNameLabel: 'खात्याचे नाव (Account Name)',
    accountNamePlaceholder: 'उदा. महाराष्ट्र ग्रामीण बँक / आपत्कालीन निधी',
    accountTypeLabel: 'खात्याचा प्रकार (Account Type)',
    typeBankAccount: 'बँक खाते (Bank Account)',
    typeSavingsGoal: 'बचत ध्येय / मुदत ठेव (Savings Goal / FD)',
    typeCashWallet: 'रोख पाकीट (Cash Wallet)',
    openingBalanceLabel: 'प्रारंभिक शिल्लक (Opening Balance ₹)',
    openingBalancePlaceholder: 'उदा. 25000',
    saveAccountBtn: 'खाते तिजोरीत जतन करा',
    openingBalanceTag: 'प्रारंभिक शिल्लक',
    currentBalanceTag: 'सध्याची शिल्लक',

    // Module 4: Category Management & Multi-Language Mapping
    categoryModuleTitle: 'वर्गवारी आणि बहुभाषिक मॅपिंग (Category Mapping)',
    categoryModuleDesc: 'एकाच बॅकएंड आयडी (Unified ID) अंतर्गत सर्व सक्रिय भाषांमधील नावे जोडली जातात. भाषा बदलल्यावरही तुमचा जमाखर्च अचूक राहतो.',
    preExistingCategoriesTitle: 'उपलब्ध वर्गवारी (Active Categories)',
    addCustomCategoryTitle: 'नवीन सानुकूल वर्गवारी तयार करा (Custom Category)',
    customCategoryInputLabel: 'वर्गवारीचे नाव (सध्याच्या भाषेत)',
    customCategoryPlaceholder: 'उदा. मंदिर देणगी, पुस्तक खरेदी, शेती अवजारे...',
    categoryKindLabel: 'व्यवहार प्रकार',
    kindExpense: 'खर्च (Expense)',
    kindRevenue: 'जमा (Revenue)',
    kindBoth: 'दोन्ही (Both)',
    createCategoryBtn: 'पुढे जा व भाषा मॅप करा →',
    mappingModalTitle: 'बहुभाषिक शब्द मॅपिंग (Multi-Language Mapping)',
    mappingModalDesc: 'ही वर्गवारी सर्व भाषांमध्ये अचूक दिसण्यासाठी इतर सक्रिय भाषांमधील प्रतिशब्द तपासा किंवा भरा:',
    unifiedIdBadge: 'एकत्रित बॅकएंड आयडी (Unified Backend ID)',
    autoSuggestBtn: 'स्मार्ट भाषांतर सुचवा',
    confirmMappingBtn: 'सर्व भाषांसह वर्गवारी जतन करा',
    cancelBtn: 'रद्द करा',
    customTag: 'सानुकूल (Custom)',
    defaultTag: 'मूळ (Built-in)',

    // Module 5: Transaction Logging & Acoustic Simulation Cues
    txModalTitleRevenue: 'नवीन जमा नोंद (+ Revenue)',
    txModalTitleExpense: 'नवीन खर्च नोंद (- Expense)',
    txTypeRevenue: '+ जमा (Revenue)',
    txTypeExpense: '- खर्च (Expense)',
    selectAccountLabel: 'खाते निवडा (Select Account)',
    amountLabel: 'रक्कम (Amount in ₹)',
    amountPlaceholder: '०',
    top4RecentCategoriesLabel: 'अलीकडे वापरलेल्या टॉप ४ वर्गवारी (Top 4 Recently Used)',
    allCategoriesDropdownLabel: 'सर्व वर्गवारी यादीतून निवडा (Category Dropdown)',
    selectCategoryLabel: 'वर्गवारी निवडा (Category)',
    noteLabel: 'तपशील / टीप (ऐच्छिक)',
    notePlaceholder: 'उदा. मंडईतून भाजीपाला, मासिक पगार...',
    submitRevenueBtn: 'जमा नोंदवा (सरस्वती वीणा नाद)',
    submitExpenseBtn: 'खर्च नोंदवा (तबला थाप: धा-धिन-धिन-ना)',
    acousticPreviewSection: 'मराठी वाद्य ध्वनी संकेत (वीणा • तबला • हार्मोनियम)',
    testTaalPakhawaj: 'वीणा झंकार ऐका (जमा - Veena)',
    testGhungrooBamboo: 'तबला थाप ऐका (खर्च - Tabla)',

    // Module 6: Smart Local Habit Triggers & Notifications
    habitModuleTitle: 'स्मार्ट स्थानिक सवय ट्रिगर्स आणि सूचना',
    habitModuleDesc: 'कोणत्याही क्लाउड वेबहुकशिवाय १००% डिव्हाइसवर चालणारे स्थानिक वर्कर इंजिन (Local Worker Engine).',
    workerStatusActive: 'स्थानिक शेड्यूलर इंजिन सक्रिय (On-Device Worker Running)',
    triggerMorningTitle: 'सकाळचा अर्थ-संकल्प (Morning Intention Nudge — 9:00 AM)',
    triggerMorningDesc: 'दररोज सकाळी ९:०० वाजता आजच्या खर्चावर संयम ठेवण्यासाठी सकारात्मक स्मरण.',
    triggerEveningTitle: 'संध्याकाळचा जमाखर्च आढावा (Evening Jamakharch Reflection — 9:00 PM)',
    triggerEveningDesc: 'रात्री ९:०० वाजता दिवसभरातील चहा-पाणी व इतर किरकोळ खर्च नोंदवण्याची आठवण.',
    triggerPatternTitle: 'स्थानिक सवय शिक्षण (On-Device Pattern Learning)',
    triggerPatternDesc: 'डिव्हाइसवरील स्थानिक डेटावरून वारंवार होणाऱ्या खर्चाचे (उदा. चहा/प्रवास) विश्लेषण करून सूचना देणे.',
    liveSimTitle: 'थेट सूचना सिम्युलेटर (Live Notification Simulator)',
    liveSimDesc: 'मराठी, हिंदी आणि इंग्रजी भाषेतील नमुना पुश बॅनर आणि ध्वनी त्वरित तपासण्यासाठी खालील बटणे दाबा:',
    simMarathiBtn: 'मराठी सूचना चाचणी (Preview Marathi)',
    simHindiBtn: 'हिंदी सूचना चाचणी (Preview Hindi)',
    simEnglishBtn: 'इंग्रजी सूचना चाचणी (Preview English)',
    patternInsightBoxTitle: 'स्थानिक पॅटर्न विश्लेषक निष्कर्ष (On-Device Insight)',

    // Module 7: Settings Page
    settingsTitle: 'सेटिंग्ज, सुरक्षा आणि भाषा व्यवस्थापन (Settings)',
    settingsSubtitle: 'स्थानिक पासकोड बदला, फेस आयडी / फिंगरप्रिंट / पॅटर्न लॉक सेट करा, नवीन भाषा जोडा आणि मराठी वाद्य नाद निवडा.',
    changePasscodeTitle: '१. पासकोड व युजर आयडी बदला (Change Passcode)',
    newPasscodeLabel: 'नवीन पासकोड (किमान ४ अक्षरे/अंक)',
    confirmPasscodeLabel: 'नवीन पासकोडची पुष्टी करा',
    savePasscodeBtn: 'नवीन पासकोड एनक्रिप्ट करून जतन करा',
    biometricPatternTitle: '२. लॉक स्क्रीन सुरक्षा: Face ID, फिंगरप्रिंट आणि पॅटर्न लॉक',
    languageSettingsTitle: '३. भाषा बदला आणि नवीन भाषा जोडा (Manage & Add Languages)',
    marathiAudioSettingsTitle: '४. मराठी लोकवाद्य आणि आवाज सेटिंग्ज (Marathi Musical Voice)',
  },

  hi: {
    appName: 'अर्थसंयम',
    appTagline: 'पारंपरिक महाराष्ट्रीयन जमाखर्च और वारली कला पर आधारित १००% ऑफ़लाइन तिजोरी',
    privacyMandateBadge: '१००% ऑफ़लाइन • शून्य इंटरनेट अनुमति • स्थानीय सुरक्षित स्टोरेज',
    selectLanguagePrompt: 'अपनी भाषा चुनें (Select Language)',
    authTitle: 'स्थानीय तिजोरी प्रवेश (Local Vault)',
    authSubtitle: 'पासकोड, पैटर्न लॉक, फिंगरप्रिंट या फेस आईडी (Face ID) का उपयोग करके अपनी स्थानीय तिजोरी खोलें।',
    userIdLabel: 'स्थानीय यूज़र आईडी (User ID)',
    userIdPlaceholder: 'उदा. siddharth_01',
    passcodeLabel: 'स्थानीय पासकोड (४-८ अंक / अक्षर)',
    passcodePlaceholder: '••••',
    unlockVaultBtn: 'तिजोरी खोलें (Unlock Vault)',
    createVaultBtn: 'नई स्थानीय तिजोरी बनाएं',
    quickDemoBtn: 'त्वरित डेमो जमाखर्च खोलें (1-Click Demo)',
    encryptionProofTitle: 'स्थानीय सुरक्षित स्टोरेज (AES-GCM / SHA-256)',
    zeroInternetProof: 'AndroidManifest: INTERNET Permission Removed',

    // Lock Screen Biometrics & Pattern
    authTabPasscode: 'पासकोड',
    authTabPattern: 'पैटर्न लॉक',
    authTabFingerprint: 'फिंगरप्रिंट',
    authTabFaceId: 'फेस आईडी (Face ID)',
    patternPrompt: 'बिंदुओं को जोड़कर अपना पैटर्न बनाएं (कम से कम ३ बिंदु)',
    fingerprintPrompt: 'स्थानीय बायोमेट्रिक सेंसर पर अपनी उंगली रखें',
    faceIdPrompt: 'स्थानीय फेस आईडी (Face ID) स्कैन करने के लिए नीचे बटन दबाएं',
    scanBiometricBtn: 'अभी बायोमेट्रिक स्कैन करें और तिजोरी खोलें',

    // Top Bar & Navigation
    streakDays: 'दिन निरंतरता',
    navVault: 'गृह (The Vault)',
    navAnalytics: 'बजट व विश्लेषण',
    navAccounts: 'तिजोरी (खाते)',
    navCategories: 'श्रेणियाँ',
    navHabits: 'आदतें व सूचनाएं',
    navSettings: 'सेटिंग्स (Settings)',
    navPrivacyDb: 'स्थानीय डेटाबेस',
    lockVault: 'तिजोरी लॉक करें',
    soundEnabled: 'ध्वनि चालू',
    soundMuted: 'ध्वनि बंद',

    // Module 2: Dashboard
    netWealthLabel: 'कुल शुद्ध संपत्ति (Total Net Wealth)',
    currentMonthRevenue: 'चालू माह जमा (Revenue)',
    currentMonthExpense: 'चालू माह खर्च (Expense)',
    savingsRateLabel: 'बचत दर',
    accountsCarouselTitle: 'स्थानीय बैंक खाते व तिजोरी (Local Vaults)',
    manageAllAccounts: 'सभी खाते देखें →',
    recentActivityTitle: 'हालिया जमाखर्च बहीखाता (Jamakharch Ledger)',
    filterAll: 'सभी प्रविष्टियाँ',
    filterRevenue: 'केवल जमा (+)',
    filterExpense: 'केवल खर्च (-)',
    noTransactionsYet: 'अभी तक कोई जमाखर्च प्रविष्टि नहीं है।',
    fabAddRevenue: '+ जमा (Revenue)',
    fabAddExpense: '- खर्च (Expense)',

    // Module 3: Accounts & Vault Management
    vaultModuleTitle: 'बैंक खाते और बचत तिजोरी प्रबंधन',
    vaultModuleDesc: 'अपने सभी बैंक खाते, सावधि जमा (FD) और नकद बटुए को एक ही स्थान पर ऑफ़लाइन प्रबंधित करें।',
    addAccountTitle: 'नया खाता / तिजोरी जोड़ें',
    accountNameLabel: 'खाते का नाम (Account Name)',
    accountNamePlaceholder: 'उदा. ग्रामीण बैंक बचत / आपातकालीन निधि',
    accountTypeLabel: 'खाते का प्रकार (Account Type)',
    typeBankAccount: 'बैंक खाता (Bank Account)',
    typeSavingsGoal: 'बचत लक्ष्य / एफडी (Savings Goal / FD)',
    typeCashWallet: 'नकद बटुआ (Cash Wallet)',
    openingBalanceLabel: 'प्रारंभिक शेष राशि (Opening Balance ₹)',
    openingBalancePlaceholder: 'उदा. 25000',
    saveAccountBtn: 'खाता तिजोरी में सहेजें',
    openingBalanceTag: 'प्रारंभिक शेष',
    currentBalanceTag: 'वर्तमान शेष',

    // Module 4: Category Management & Multi-Language Mapping
    categoryModuleTitle: 'श्रेणी प्रबंधन और बहुभाषी मैपिंग (Category Mapping)',
    categoryModuleDesc: 'एक ही बैकएंड आईडी (Unified ID) के तहत सभी भाषाओं के नाम जुड़ते हैं। भाषा बदलने पर भी हिसाब सटीक रहता है।',
    preExistingCategoriesTitle: 'उपलब्ध श्रेणियाँ (Active Categories)',
    addCustomCategoryTitle: 'नई कस्टम श्रेणी बनाएं (Custom Category)',
    customCategoryInputLabel: 'श्रेणी का नाम (वर्तमान भाषा में)',
    customCategoryPlaceholder: 'उदा. मंदिर दान, पुस्तकें, कृषि उपकरण...',
    categoryKindLabel: 'लेनदेन प्रकार',
    kindExpense: 'खर्च (Expense)',
    kindRevenue: 'जमा (Revenue)',
    kindBoth: 'दोनों (Both)',
    createCategoryBtn: 'आगे बढ़ें और भाषा मैप करें →',
    mappingModalTitle: 'बहुभाषी शब्द मैपिंग (Multi-Language Mapping)',
    mappingModalDesc: 'इस श्रेणी को सभी भाषाओं में सही दिखाने के लिए अन्य सक्रिय भाषाओं के समानार्थी शब्द जांचें या भरें:',
    unifiedIdBadge: 'एकीकृत बैकएंड आईडी (Unified Backend ID)',
    autoSuggestBtn: 'स्मार्ट अनुवाद सुझाएं',
    confirmMappingBtn: 'सभी भाषाओं के साथ श्रेणी सहेजें',
    cancelBtn: 'रद्द करें',
    customTag: 'कस्टम (Custom)',
    defaultTag: 'डिफ़ॉल्ट (Built-in)',

    // Module 5: Transaction Logging & Acoustic Simulation Cues
    txModalTitleRevenue: 'नई जमा प्रविष्टि (+ Revenue)',
    txModalTitleExpense: 'नई खर्च प्रविष्टि (- Expense)',
    txTypeRevenue: '+ जमा (Revenue)',
    txTypeExpense: '- खर्च (Expense)',
    selectAccountLabel: 'खाता चुनें (Select Account)',
    amountLabel: 'राशि (Amount in ₹)',
    amountPlaceholder: '०',
    top4RecentCategoriesLabel: 'हाल ही में उपयोग की गई शीर्ष ४ श्रेणियाँ (Top 4 Recent)',
    allCategoriesDropdownLabel: 'सभी श्रेणियों की ड्रॉपडाउन सूची (All Categories Dropdown)',
    selectCategoryLabel: 'श्रेणी चुनें (Category)',
    noteLabel: 'विवरण / टिप्पणी (वैकल्पिक)',
    notePlaceholder: 'उदा. सब्ज़ी मंडी, मासिक वेतन...',
    submitRevenueBtn: 'जमा दर्ज करें (सरस्वती वीणा झंकार)',
    submitExpenseBtn: 'खर्च दर्ज करें (तबला थाप: धा-धिन-धिन-ना)',
    acousticPreviewSection: 'भारतीय वाद्य ध्वनि संकेत (वीणा • तबला • हारमोनियम)',
    testTaalPakhawaj: 'वीणा झंकार सुनें (जमा - Veena)',
    testGhungrooBamboo: 'तबला थाप सुनें (खर्च - Tabla)',

    // Module 6: Smart Local Habit Triggers & Notifications
    habitModuleTitle: 'स्मार्ट स्थानीय आदत ट्रिगर्स और सूचनाएं',
    habitModuleDesc: 'बिना किसी क्लाउड वेबहुक के १००% डिवाइस पर चलने वाला स्थानीय वर्कर इंजन (Local Worker Engine)।',
    workerStatusActive: 'स्थानीय शेड्यूलर इंजन सक्रिय (On-Device Worker Running)',
    triggerMorningTitle: 'सुबह का अर्थ-संकल्प (Morning Intention Nudge — 9:00 AM)',
    triggerMorningDesc: 'प्रतिदिन सुबह ९:०० बजे आज के खर्चों पर संयम रखने के लिए सकारात्मक अनुस्मारक।',
    triggerEveningTitle: 'शाम की जमाखर्च समीक्षा (Evening Jamakharch Reflection — 9:00 PM)',
    triggerEveningDesc: 'रात ९:०० बजे दिन भर के चाय-पानी और अन्य खर्च दर्ज करने का स्मरण।',
    triggerPatternTitle: 'स्थानीय पैटर्न लर्निंग (On-Device Pattern Learning)',
    triggerPatternDesc: 'डिवाइस के स्थानीय डेटा से बार-बार होने वाले खर्चों का विश्लेषण कर स्मार्ट सुझाव देना।',
    liveSimTitle: 'लाइव नोटिफिकेशन सिम्युलेटर (Live Notification Simulator)',
    liveSimDesc: 'मराठी, हिंदी और अंग्रेज़ी में सैंपल पुश बैनर और ध्वनि तुरंत परखने के लिए नीचे दिए बटन दबाएं:',
    simMarathiBtn: 'मराठी सूचना परीक्षण (Preview Marathi)',
    simHindiBtn: 'हिंदी सूचना परीक्षण (Preview Hindi)',
    simEnglishBtn: 'अंग्रेज़ी सूचना परीक्षण (Preview English)',
    patternInsightBoxTitle: 'स्थानीय पैटर्न विश्लेषक निष्कर्ष (On-Device Insight)',

    // Module 7: Settings Page
    settingsTitle: 'सेटिंग्स, सुरक्षा और भाषा प्रबंधन (Settings)',
    settingsSubtitle: 'स्थानीय पासकोड बदलें, फेस आईडी / फिंगरप्रिंट / पैटर्न लॉक सेट करें, नई भाषाएं जोड़ें और मराठी वाद्य चुनें।',
    changePasscodeTitle: '१. पासकोड व यूज़र आईडी बदलें (Change Passcode)',
    newPasscodeLabel: 'नया पासकोड (कम से कम ४ अक्षर/अंक)',
    confirmPasscodeLabel: 'नए पासकोड की पुष्टि करें',
    savePasscodeBtn: 'नया पासकोड एन्क्रिप्ट कर सहेजें',
    biometricPatternTitle: '२. लॉक स्क्रीन सुरक्षा: Face ID, फिंगरप्रिंट और पैटर्न लॉक',
    languageSettingsTitle: '३. भाषा बदलें और अतिरिक्त भाषाएं जोड़ें (Manage Languages)',
    marathiAudioSettingsTitle: '४. मराठी लोकवाद्य और स्वर सेटिंग्स (Marathi Musical Voice)',
  },

  en: {
    appName: 'अर्थसंयम (Arthasanyam)',
    appTagline: '100% Offline-First Maharashtrian Jamakharch Ledger & Warli Heritage Vault',
    privacyMandateBadge: '100% Offline • Zero Internet Permissions • Local Device Storage Only',
    selectLanguagePrompt: 'Choose Your Language (भाषा निवडा)',
    authTitle: 'Local Vault Authentication',
    authSubtitle: 'Unlock your local vault using Passcode, Pattern Lock, Fingerprint, or Face ID.',
    userIdLabel: 'Local User ID',
    userIdPlaceholder: 'e.g. siddharth_01',
    passcodeLabel: 'Local Passcode (4-8 digits / chars)',
    passcodePlaceholder: '••••',
    unlockVaultBtn: 'Unlock Local Vault',
    createVaultBtn: 'Initialize Local Vault',
    quickDemoBtn: 'Instant Demo Vault (1-Click Jamakharch)',
    encryptionProofTitle: 'Platform Local Secure Storage (AES-GCM / SHA-256)',
    zeroInternetProof: 'AndroidManifest: INTERNET Permission Removed',

    // Lock Screen Biometrics & Pattern
    authTabPasscode: 'Passcode',
    authTabPattern: 'Pattern Lock',
    authTabFingerprint: 'Fingerprint',
    authTabFaceId: 'Face ID',
    patternPrompt: 'Connect at least 3 dots on the Warli Chowk grid to unlock',
    fingerprintPrompt: 'Touch the local biometric fingerprint sensor below',
    faceIdPrompt: 'Authenticate using on-device Face ID recognition',
    scanBiometricBtn: 'Scan Biometrics & Unlock Vault',

    // Top Bar & Navigation
    streakDays: 'Day Streak',
    navVault: 'The Vault (गृह)',
    navAnalytics: 'Analytics & Budget',
    navAccounts: 'Tijori (Accounts)',
    navCategories: 'Categories',
    navHabits: 'Habit Triggers',
    navSettings: 'Settings (सेटिंग्ज)',
    navPrivacyDb: 'Local SQLite/DB',
    lockVault: 'Lock Vault',
    soundEnabled: 'Audio On',
    soundMuted: 'Muted',

    // Module 2: Dashboard
    netWealthLabel: 'Total Net Wealth (एकूण संपत्ती)',
    currentMonthRevenue: 'Current Month Revenue (जमा)',
    currentMonthExpense: 'Current Month Expense (खर्च)',
    savingsRateLabel: 'Savings Rate',
    accountsCarouselTitle: 'Bank Accounts & Savings Vaults (तिजोरी)',
    manageAllAccounts: 'Manage Vaults →',
    recentActivityTitle: 'Recent Activity Feed (जमाखर्च नोंदवही)',
    filterAll: 'All Entries',
    filterRevenue: 'Revenue (+ जमा)',
    filterExpense: 'Expense (- खर्च)',
    noTransactionsYet: 'No transactions logged in local storage yet.',
    fabAddRevenue: '+ जमा (Revenue)',
    fabAddExpense: '- खर्च (Expense)',

    // Module 3: Accounts & Vault Management
    vaultModuleTitle: 'Bank Accounts & Savings Vault Management (तिजोरी)',
    vaultModuleDesc: 'Manage all active local bank accounts, FD / Emergency savings pots, and cash wallets 100% offline.',
    addAccountTitle: 'Add New Local Account / Vault',
    accountNameLabel: 'Account Name',
    accountNamePlaceholder: 'e.g. State Bank Savings / Monsoon Emergency Fund',
    accountTypeLabel: 'Account Type',
    typeBankAccount: 'Bank Account',
    typeSavingsGoal: 'Savings Goal / FD',
    typeCashWallet: 'Cash Wallet',
    openingBalanceLabel: 'Opening Balance (₹)',
    openingBalancePlaceholder: 'e.g. 25000',
    saveAccountBtn: 'Save Account to Local Vault',
    openingBalanceTag: 'Opening Balance',
    currentBalanceTag: 'Current Balance',

    // Module 4: Category Management & Multi-Language Mapping
    categoryModuleTitle: 'Category Management & Multi-Language Mapping',
    categoryModuleDesc: 'All active language labels map to a single Unified Backend ID, guaranteeing accurate financial aggregation across every language.',
    preExistingCategoriesTitle: 'Active Unified Categories',
    addCustomCategoryTitle: 'Create Custom Category',
    customCategoryInputLabel: 'Category Name (in active language)',
    customCategoryPlaceholder: 'e.g. Temple Donation, Books, Farm Supplies...',
    categoryKindLabel: 'Transaction Kind',
    kindExpense: 'Expense (खर्च)',
    kindRevenue: 'Revenue (जमा)',
    kindBoth: 'Both (दोन्ही)',
    createCategoryBtn: 'Next: Map Other Languages →',
    mappingModalTitle: 'Multi-Language Mapping Modal',
    mappingModalDesc: 'Enter matching terms for your other active languages so this category aggregates seamlessly under one Unified Backend ID:',
    unifiedIdBadge: 'Unified Backend ID',
    autoSuggestBtn: 'Auto-Suggest Translations',
    confirmMappingBtn: 'Save Unified Category',
    cancelBtn: 'Cancel',
    customTag: 'Custom',
    defaultTag: 'Built-in',

    // Module 5: Transaction Logging & Acoustic Simulation Cues
    txModalTitleRevenue: 'Log Revenue (+ जमा)',
    txModalTitleExpense: 'Log Expense (- खर्च)',
    txTypeRevenue: '+ जमा (Revenue)',
    txTypeExpense: '- खर्च (Expense)',
    selectAccountLabel: 'Select Account Vault',
    amountLabel: 'Amount (in ₹)',
    amountPlaceholder: '0',
    top4RecentCategoriesLabel: 'Top 4 Recently Used Categories',
    allCategoriesDropdownLabel: 'Select from All Categories Dropdown',
    selectCategoryLabel: 'Select Category',
    noteLabel: 'Ledger Note / Particulars (Optional)',
    notePlaceholder: 'e.g. Morning Mandai vegetables, Monthly Salary...',
    submitRevenueBtn: 'Log Revenue (Veena Resonance)',
    submitExpenseBtn: 'Log Expense (Tabla Rhythm)',
    acousticPreviewSection: 'Marathi Musical Instruments (Veena • Tabla • Harmonium)',
    testTaalPakhawaj: 'Play Veena (Revenue)',
    testGhungrooBamboo: 'Play Tabla (Expense)',

    // Module 6: Smart Local Habit Triggers & Notifications
    habitModuleTitle: 'Smart Local Habit Triggers & Notifications',
    habitModuleDesc: 'Local background scheduler triggering notifications entirely on-device without cloud webhooks.',
    workerStatusActive: 'Local Background Worker Engine Active (Zero Cloud Webhooks)',
    triggerMorningTitle: 'Morning Intention Nudge (9:00 AM)',
    triggerMorningDesc: 'Daily 9:00 AM mindful prompt to set your spending intention before stepping out.',
    triggerEveningTitle: 'Evening Jamakharch Reflection (9:00 PM)',
    triggerEveningDesc: 'Nightly 9:00 PM reminder to reconcile daily cash & bank ledger entries.',
    triggerPatternTitle: 'On-Device Pattern Learning',
    triggerPatternDesc: 'Analyzes local SQLite/storage ledger patterns on-device to surface mindful spending nudges.',
    liveSimTitle: 'Live Notification Simulator',
    liveSimDesc: 'Interactive test buttons to preview sample push banners in Marathi, Hindi, and English immediately:',
    simMarathiBtn: 'Preview Marathi Banner (मराठी)',
    simHindiBtn: 'Preview Hindi Banner (हिंदी)',
    simEnglishBtn: 'Preview English Banner (English)',
    patternInsightBoxTitle: 'On-Device Pattern Learning Analysis',

    // Module 7: Settings Page
    settingsTitle: 'Settings, Lock Security & Languages (सेटिंग्ज)',
    settingsSubtitle: 'Change your local passcode, configure Face ID / Fingerprint / Pattern Lock, add new languages, and customize Marathi musical instrument cues.',
    changePasscodeTitle: '1. Change Local Passcode & User ID',
    newPasscodeLabel: 'New Passcode (min 4 digits/chars)',
    confirmPasscodeLabel: 'Confirm New Passcode',
    savePasscodeBtn: 'Encrypt & Save New Passcode',
    biometricPatternTitle: '2. Lock Screen Security: Face ID, Fingerprint & Pattern Lock',
    languageSettingsTitle: '3. Change Language & Add Additional Languages',
    marathiAudioSettingsTitle: '4. Marathi Musical Instruments & Localization Voice',
  },
};

export function getTranslations(lang: Language): Record<string, string> {
  if (lang === 'mr' || lang === 'hi' || lang === 'en') {
    return BASE_TRANSLATIONS[lang];
  }
  // For additional Indian languages added by the user (e.g. Konkani, Sanskrit, Gujarati, Kannada),
  // use Marathi/Devanagari base for Konkani/Sanskrit and English/Bilingual base for others
  if (lang === 'kok' || lang === 'sa') {
    return BASE_TRANSLATIONS.mr;
  }
  return BASE_TRANSLATIONS.en;
}

export const TRANSLATIONS: Record<string, Record<string, string>> = new Proxy(BASE_TRANSLATIONS, {
  get(target, prop: string) {
    if (prop in target) {
      return target[prop as 'mr' | 'hi' | 'en'];
    }
    return getTranslations(prop);
  },
});
