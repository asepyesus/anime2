const CONFIG = {
  TMDB_KEY: 'd1ae0bb951546956aa8d92d45053495e',
  TMDB_BASE: 'https://api.themoviedb.org/3',
  TMDB_IMG: 'https://image.tmdb.org/t/p',
  JIKAN_BASE: 'https://api.jikan.moe/v4',

  CATEGORIES: {
    anime: { label: 'Anime', origin: null, useJikan: true },
    donghua: { label: 'Donghua', origin: 'CN', genre: 16 },
    drakor: { label: 'Drakor', origin: 'KR' },
    dracin: { label: 'Dracin', origin: 'CN' },
  },

  PLANS: [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      color: '#6b7280',
      benefits: [
        'Kualitas 480p',
        'Konten terbatas',
        'Dengan iklan',
        'Tidak bisa download',
        '1 perangkat',
      ],
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 29000,
      color: '#e63e6d',
      popular: true,
      benefits: [
        'Kualitas 1080p',
        'Semua konten',
        'Bebas iklan',
        'Download 5 video',
        '1 perangkat',
      ],
    },
    {
      id: 'ultra',
      name: 'Ultra',
      price: 49000,
      color: '#f59e0b',
      benefits: [
        'Kualitas 4K',
        'Semua konten',
        'Bebas iklan',
        'Download unlimited',
        'Early access episode',
        '4 perangkat',
        'Badge Ultra di profil',
      ],
    },
  ],

  PAYMENT: [
    { id: 'qris', label: 'QRIS', icon: '▣' },
    { id: 'gopay', label: 'GoPay', icon: '●' },
    { id: 'ovo', label: 'OVO', icon: '◆' },
    { id: 'dana', label: 'DANA', icon: '◉' },
  ],
};
