
export type MaterialType = 'cotton' | 'sand' | 'coarse_sand' | 'small_stones' | 'large_stones' | 'charcoal';

export interface Material {
  id: MaterialType;
  name: string;
  color: string;
  description: string;
  function: string;
}

export const MATERIALS: Material[] = [
  {
    id: 'cotton',
    name: 'Algodão',
    color: '#FFFFFF',
    description: 'Fibras finas para reter partículas muito pequenas.',
    function: 'Filtragem final de partículas finas.'
  },
  {
    id: 'charcoal',
    name: 'Carvão Ativado Triturado',
    color: '#1A1A1A',
    description: 'Material altamente poroso que remove odores, cores e impurezas químicas.',
    function: 'Filtragem química e remoção de odores/gostos.'
  },
  {
    id: 'sand',
    name: 'Areia Fina',
    color: '#E6C9A8',
    description: 'Filtra partículas pequenas e sedimentos.',
    function: 'Retenção de partículas médias.'
  },
  {
    id: 'coarse_sand',
    name: 'Areia Grossa',
    color: '#C5A880',
    description: 'Filtra partículas médias e sedimentos maiores.',
    function: 'Retenção de partículas intermediárias.'
  },
  {
    id: 'small_stones',
    name: 'Pedras Pequenas',
    color: '#757575',
    description: 'Pedras de tamanho médio para reter sujeira maior.',
    function: 'Filtragem de detritos grandes.'
  },
  {
    id: 'large_stones',
    name: 'Pedras Grandes',
    color: '#5D5D5D',
    description: 'Primeira barreira para galhos e folhas grandes.',
    function: 'Retenção de detritos muito grandes.'
  }
];

export type GameStatus = 'building' | 'filtering' | 'result';
