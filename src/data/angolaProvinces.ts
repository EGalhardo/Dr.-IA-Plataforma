/**
 * Realistic province polygons for epidemiological surveillance.
 * ViewBox 0..90 × 0..96. Cabinda is the top exclave.
 */
export interface ProvinceShape { name: string; label: string; d: string; labelX: number; labelY: number; }
export const ANGOLA_PROVINCE_SHAPES: ProvinceShape[] = [
  { name:'Cabinda', label:'CAB', d:'M22,3 L30,2 L40,2 L47,4 L52,7 L52,11 L48,14 L40,15 L32,14 L24,11 L21,7 Z', labelX:37, labelY:9 },
  { name:'Zaire', label:'ZAI', d:'M6,20 L18,18 L28,18 L36,19 L40,22 L38,28 L30,30 L20,29 L12,26 L6,22 Z', labelX:23, labelY:24 },
  { name:'Uíge', label:'UIG', d:'M26,22 L36,22 L44,24 L50,28 L48,36 L40,40 L32,40 L24,36 L22,29 Z', labelX:36, labelY:31 },
  { name:'Bengo', label:'BNG', d:'M6,28 L14,28 L22,32 L22,38 L16,42 L8,40 L2,34 Z', labelX:13, labelY:35 },
  { name:'Luanda', label:'LDA', d:'M4,38 L10,40 L16,40 L18,44 L14,48 L6,46 L2,42 Z', labelX:10, labelY:43 },
  { name:'Cuanza Norte', label:'CNT', d:'M14,36 L22,36 L32,36 L40,38 L42,44 L36,48 L26,48 L18,44 Z', labelX:28, labelY:42 },
  { name:'Malanje', label:'MAL', d:'M38,32 L48,32 L58,36 L64,42 L62,50 L54,54 L44,52 L36,46 L36,38 Z', labelX:50, labelY:43 },
  { name:'Lunda Norte', label:'LNO', d:'M46,18 L58,16 L70,20 L76,26 L74,34 L68,40 L60,42 L52,36 L48,28 Z', labelX:62, labelY:29 },
  { name:'Lunda Sul', label:'LSU', d:'M58,38 L68,40 L76,46 L76,54 L70,58 L62,58 L56,52 L56,42 Z', labelX:66, labelY:49 },
  { name:'Cuanza Sul', label:'CSU', d:'M12,46 L22,48 L32,48 L38,54 L36,60 L26,62 L16,58 L6,54 L4,48 Z', labelX:20, labelY:55 },
  { name:'Bié', label:'BIÉ', d:'M32,50 L42,50 L52,52 L56,60 L50,68 L40,70 L32,66 L28,58 Z', labelX:42, labelY:60 },
  { name:'Moxico', label:'MOX', d:'M54,40 L64,44 L78,54 L82,62 L80,72 L72,76 L62,72 L56,64 L52,54 Z', labelX:68, labelY:60 },
  { name:'Benguela', label:'BNG', d:'M2,52 L10,56 L18,60 L20,66 L14,72 L4,70 L0,62 L0,54 Z', labelX:10, labelY:62 },
  { name:'Huambo', label:'HBO', d:'M16,58 L26,60 L32,64 L32,72 L24,76 L16,72 L12,66 Z', labelX:23, labelY:67 },
  { name:'Namibe', label:'NAM', d:'M0,66 L8,72 L12,78 L10,86 L2,88 L0,84 L0,74 Z', labelX:6, labelY:78 },
  { name:'Huíla', label:'HUI', d:'M8,68 L18,72 L30,74 L34,82 L26,88 L14,88 L8,82 L4,74 Z', labelX:20, labelY:80 },
  { name:'Cunene', label:'CUN', d:'M18,82 L28,84 L38,84 L40,90 L32,94 L20,94 L12,88 Z', labelX:28, labelY:89 },
  { name:'Cuando Cubango', label:'CCU', d:'M30,68 L44,68 L58,70 L72,74 L76,82 L70,88 L54,90 L40,88 L32,82 L30,74 Z', labelX:52, labelY:80 },
  { name:'Moxico Sul', label:'MSU', d:'M56,58 L66,60 L78,62 L82,70 L78,78 L68,78 L60,72 L56,64 Z', labelX:68, labelY:70 },
];
export const ANGOLA_MAIN_PATH = "M8,36 C10,30 14,25 19,22 C25,19 31,18 36,20 C39,20 42,17 46,17 C50,17 55,20 58,24 C61,28 64,32 66,36 C69,41 72,46 74,52 C76,58 78,63 77,70 C75,76 71,81 65,85 C58,88 50,89 44,87 C37,85 31,80 27,75 C22,69 16,65 11,59 C7,53 4,46 5,40 Z";
export const ANGOLA_CABINDA_PATH = "M22,3 C28,1 36,1 43,2 C48,3 52,6 53,10 C52,13 48,15 42,15 C35,14 28,13 23,10 C21,7 21,4 22,3 Z";
