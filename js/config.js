const C = {
  TMDB: 'd1ae0bb951546956aa8d92d45053495e',
  TMDB_URL: 'https://api.themoviedb.org/3',
  IMG: 'https://image.tmdb.org/t/p',
  JIKAN: 'https://api.jikan.moe/v4',
  CATS: {
    anime:  { label: 'Anime',   color: '#E8365D', jikan: true  },
    donghua:{ label: 'Donghua', color: '#00D4A8', cn_anim: true},
    drakor: { label: 'Drakor',  color: '#7C3AED', kr: true     },
    dracin: { label: 'Dracin',  color: '#F59E0B', cn: true     },
  },
  PLANS: [
    { id:'free',    name:'Free',    price:0,     color:'#6B7280',
      perks:['Kualitas 480p','Dengan iklan','Konten terbatas','1 perangkat'] },
    { id:'premium', name:'Premium', price:29000, color:'#E8365D', hot:true,
      perks:['Kualitas 1080p','Bebas iklan','Semua konten','Download 5 video','1 perangkat'] },
    { id:'ultra',   name:'Ultra',   price:49000, color:'#F59E0B',
      perks:['Kualitas 4K','Bebas iklan','Semua konten','Download unlimited','4 perangkat','Early access','Badge Ultra'] },
  ],
  PAY: [
    { id:'qris',  label:'QRIS' },
    { id:'gopay', label:'GoPay' },
    { id:'ovo',   label:'OVO'  },
    { id:'dana',  label:'DANA' },
  ],
};
