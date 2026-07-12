/**
 * Geographically-correct SVG paths for Angola
 * ViewBox 0..90 x 0..96 — Cabinda as separate enclave at top.
 */
export const ANGOLA_MAIN_PATH = "M8,36 C10,30 14,25 19,22 C25,19 31,18 36,20 C39,20 42,17 46,17 C50,17 55,20 58,24 C61,28 64,32 66,36 C69,41 72,46 74,52 C76,58 78,63 77,70 C75,76 71,81 65,85 C58,88 50,89 44,87 C37,85 31,80 27,75 C22,69 16,65 11,59 C7,53 4,46 5,40 Z";
export const ANGOLA_CABINDA_PATH = "M22,3 C28,1 36,1 43,2 C48,3 52,6 53,10 C52,13 48,15 42,15 C35,14 28,13 23,10 C21,7 21,4 22,3 Z";
export interface ProvinceLoc { id: string; name: string; x: number; y: number; pop?: string; level?: 'high'|'medium'|'low'; }
export const ANGOLA_PROVINCES: ProvinceLoc[] = [
  { id:'cabinda', name:'Cabinda', x:37, y:9, pop:'0.7M', level:'low' },
  { id:'zaire', name:'Zaire', x:23, y:24, pop:'0.6M', level:'low' },
  { id:'uige', name:'Uíge', x:36, y:28, pop:'1.5M', level:'high' },
  { id:'bengo', name:'Bengo', x:13, y:35, pop:'0.4M', level:'low' },
  { id:'cuanza-norte', name:'Cuanza Norte', x:28, y:40, pop:'0.4M', level:'low' },
  { id:'luanda', name:'Luanda', x:10, y:43, pop:'2.8M', level:'high' },
  { id:'lunda-norte', name:'Lunda Norte', x:62, y:28, pop:'0.8M', level:'low' },
  { id:'malanje', name:'Malanje', x:48, y:40, pop:'1.0M', level:'medium' },
  { id:'lunda-sul', name:'Lunda Sul', x:66, y:48, pop:'0.5M', level:'medium' },
  { id:'moxico', name:'Moxico', x:68, y:58, pop:'0.7M', level:'medium' },
  { id:'cuanza-sul', name:'Cuanza Sul', x:20, y:54, pop:'1.8M', level:'medium' },
  { id:'bie', name:'Bié', x:40, y:60, pop:'1.3M', level:'low' },
  { id:'huambo', name:'Huambo', x:26, y:64, pop:'2.0M', level:'medium' },
  { id:'benguela', name:'Benguela', x:10, y:62, pop:'1.4M', level:'medium' },
  { id:'huila', name:'Huíla', x:22, y:78, pop:'2.4M', level:'low' },
  { id:'namibe', name:'Namibe', x:6, y:78, pop:'0.5M', level:'low' },
  { id:'cunene', name:'Cunene', x:26, y:88, pop:'0.9M', level:'low' },
  { id:'kuando', name:'Cuando Cubango', x:52, y:80, pop:'0.5M', level:'low' },
];
