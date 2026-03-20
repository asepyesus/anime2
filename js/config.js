const API_BASE = 'https://anichin-api-production.up.railway.app';

const PLANS = [
  { id:'free',    name:'Free',    price:0,     color:'#6B7280',
    perks:['Kualitas 480p','Dengan iklan','Akses terbatas','1 perangkat'] },
  { id:'premium', name:'Premium', price:29000, color:'#E8365D', hot:true,
    perks:['Kualitas 1080p','Bebas iklan','Semua konten','Download 5 video','1 perangkat'] },
  { id:'ultra',   name:'Ultra',   price:49000, color:'#F59E0B',
    perks:['Kualitas 4K','Bebas iklan','Semua konten','Download unlimited','4 perangkat','Early access','Badge Ultra'] },
];

const PAY_METHODS = [
  { id:'qris',  label:'QRIS'  },
  { id:'gopay', label:'GoPay' },
  { id:'ovo',   label:'OVO'   },
  { id:'dana',  label:'DANA'  },
];
