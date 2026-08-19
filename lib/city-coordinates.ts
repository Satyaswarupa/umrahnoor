// Approximate city-center coordinates for every city in INDIA_STATES_CITIES
// (lib/locations.ts). Agents can only register under a city from that list,
// so this table covers every city an agent's `locations[].city` can hold.
// Used to rank agents by real-world distance when a search falls back from
// "no agent in this exact city" to "nearest agents in the state".
export const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  // Andhra Pradesh
  Visakhapatnam: { lat: 17.6868, lng: 83.2185 },
  Vijayawada: { lat: 16.5062, lng: 80.6480 },
  Guntur: { lat: 16.3067, lng: 80.4365 },
  Tirupati: { lat: 13.6288, lng: 79.4192 },
  Nellore: { lat: 14.4426, lng: 79.9865 },
  Kurnool: { lat: 15.8281, lng: 78.0373 },

  // Arunachal Pradesh
  Itanagar: { lat: 27.0844, lng: 93.6053 },
  Naharlagun: { lat: 27.1044, lng: 93.6958 },

  // Assam
  Guwahati: { lat: 26.1445, lng: 91.7362 },
  Silchar: { lat: 24.8333, lng: 92.7789 },
  Dibrugarh: { lat: 27.4728, lng: 94.9120 },
  Jorhat: { lat: 26.7509, lng: 94.2037 },

  // Bihar
  Patna: { lat: 25.5941, lng: 85.1376 },
  Gaya: { lat: 24.7955, lng: 85.0002 },
  Bhagalpur: { lat: 25.2425, lng: 86.9842 },
  Muzaffarpur: { lat: 26.1225, lng: 85.3906 },
  Darbhanga: { lat: 26.1542, lng: 85.8918 },

  // Chhattisgarh
  Raipur: { lat: 21.2514, lng: 81.6296 },
  Bhilai: { lat: 21.2094, lng: 81.4285 },
  Bilaspur: { lat: 22.0797, lng: 82.1391 },
  Durg: { lat: 21.1904, lng: 81.2849 },

  // Goa
  Panaji: { lat: 15.4909, lng: 73.8278 },
  Margao: { lat: 15.2832, lng: 73.9862 },
  "Vasco da Gama": { lat: 15.3960, lng: 73.8110 },

  // Gujarat
  Ahmedabad: { lat: 23.0225, lng: 72.5714 },
  Surat: { lat: 21.1702, lng: 72.8311 },
  Vadodara: { lat: 22.3072, lng: 73.1812 },
  Rajkot: { lat: 22.3039, lng: 70.8022 },
  Bhavnagar: { lat: 21.7645, lng: 72.1519 },
  Jamnagar: { lat: 22.4707, lng: 70.0577 },

  // Haryana
  Gurugram: { lat: 28.4595, lng: 77.0266 },
  Faridabad: { lat: 28.4089, lng: 77.3178 },
  Panipat: { lat: 29.3909, lng: 76.9635 },
  Ambala: { lat: 30.3782, lng: 76.7767 },
  Karnal: { lat: 29.6857, lng: 76.9905 },

  // Himachal Pradesh
  Shimla: { lat: 31.1048, lng: 77.1734 },
  Dharamshala: { lat: 32.2190, lng: 76.3234 },
  Solan: { lat: 30.9045, lng: 77.0967 },

  // Jharkhand
  Ranchi: { lat: 23.3441, lng: 85.3096 },
  Jamshedpur: { lat: 22.8046, lng: 86.2029 },
  Dhanbad: { lat: 23.7957, lng: 86.4304 },
  Bokaro: { lat: 23.6693, lng: 86.1511 },

  // Karnataka
  Bengaluru: { lat: 12.9716, lng: 77.5946 },
  Mysuru: { lat: 12.2958, lng: 76.6394 },
  Mangaluru: { lat: 12.9141, lng: 74.8560 },
  Hubballi: { lat: 15.3647, lng: 75.1240 },
  Belagavi: { lat: 15.8497, lng: 74.4977 },

  // Kerala
  Kochi: { lat: 9.9312, lng: 76.2673 },
  Thiruvananthapuram: { lat: 8.5241, lng: 76.9366 },
  Kozhikode: { lat: 11.2588, lng: 75.7804 },
  Kannur: { lat: 11.8745, lng: 75.3704 },
  Malappuram: { lat: 11.0510, lng: 76.0711 },
  Kollam: { lat: 8.8932, lng: 76.6141 },

  // Madhya Pradesh
  Bhopal: { lat: 23.2599, lng: 77.4126 },
  Indore: { lat: 22.7196, lng: 75.8577 },
  Jabalpur: { lat: 23.1815, lng: 79.9864 },
  Gwalior: { lat: 26.2183, lng: 78.1828 },
  Ujjain: { lat: 23.1765, lng: 75.7885 },

  // Maharashtra
  Mumbai: { lat: 19.0760, lng: 72.8777 },
  Pune: { lat: 18.5204, lng: 73.8567 },
  Nagpur: { lat: 21.1458, lng: 79.0882 },
  Nashik: { lat: 19.9975, lng: 73.7898 },
  Aurangabad: { lat: 19.8762, lng: 75.3433 },
  Thane: { lat: 19.2183, lng: 72.9781 },

  // Manipur
  Imphal: { lat: 24.8170, lng: 93.9368 },

  // Meghalaya
  Shillong: { lat: 25.5788, lng: 91.8933 },

  // Mizoram
  Aizawl: { lat: 23.7271, lng: 92.7176 },

  // Nagaland
  Kohima: { lat: 25.6751, lng: 94.1086 },
  Dimapur: { lat: 25.9091, lng: 93.7266 },

  // Odisha
  Bhubaneswar: { lat: 20.2961, lng: 85.8245 },
  Cuttack: { lat: 20.4625, lng: 85.8828 },
  Rourkela: { lat: 22.2604, lng: 84.8536 },
  Puri: { lat: 19.8135, lng: 85.8312 },
  Sambalpur: { lat: 21.4669, lng: 83.9756 },
  Berhampur: { lat: 19.3149, lng: 84.7941 },
  Jajpur: { lat: 20.8500, lng: 86.3350 },

  // Punjab
  Ludhiana: { lat: 30.9010, lng: 75.8573 },
  Amritsar: { lat: 31.6340, lng: 74.8723 },
  Jalandhar: { lat: 31.3260, lng: 75.5762 },
  Patiala: { lat: 30.3398, lng: 76.3869 },
  Mohali: { lat: 30.7046, lng: 76.7179 },

  // Rajasthan
  Jaipur: { lat: 26.9124, lng: 75.7873 },
  Jodhpur: { lat: 26.2389, lng: 73.0243 },
  Udaipur: { lat: 24.5854, lng: 73.7125 },
  Kota: { lat: 25.2138, lng: 75.8648 },
  Ajmer: { lat: 26.4499, lng: 74.6399 },

  // Sikkim
  Gangtok: { lat: 27.3389, lng: 88.6065 },

  // Tamil Nadu
  Chennai: { lat: 13.0827, lng: 80.2707 },
  Coimbatore: { lat: 11.0168, lng: 76.9558 },
  Madurai: { lat: 9.9252, lng: 78.1198 },
  Tiruchirappalli: { lat: 10.7905, lng: 78.7047 },
  Salem: { lat: 11.6643, lng: 78.1460 },

  // Telangana
  Hyderabad: { lat: 17.3850, lng: 78.4867 },
  Warangal: { lat: 17.9689, lng: 79.5941 },
  Nizamabad: { lat: 18.6725, lng: 78.0941 },

  // Tripura
  Agartala: { lat: 23.8315, lng: 91.2868 },

  // Uttar Pradesh
  Lucknow: { lat: 26.8467, lng: 80.9462 },
  Kanpur: { lat: 26.4499, lng: 80.3319 },
  Ghaziabad: { lat: 28.6692, lng: 77.4538 },
  Agra: { lat: 27.1767, lng: 78.0081 },
  Varanasi: { lat: 25.3176, lng: 82.9739 },
  Meerut: { lat: 28.9845, lng: 77.7064 },
  Noida: { lat: 28.5355, lng: 77.3910 },
  Prayagraj: { lat: 25.4358, lng: 81.8463 },

  // Uttarakhand
  Dehradun: { lat: 30.3165, lng: 78.0322 },
  Haridwar: { lat: 29.9457, lng: 78.1642 },
  Roorkee: { lat: 29.8543, lng: 77.8880 },

  // West Bengal
  Kolkata: { lat: 22.5726, lng: 88.3639 },
  Howrah: { lat: 22.5958, lng: 88.2636 },
  Durgapur: { lat: 23.5204, lng: 87.3119 },
  Siliguri: { lat: 26.7271, lng: 88.3953 },
  Asansol: { lat: 23.6739, lng: 86.9524 },

  // Andaman and Nicobar Islands
  "Port Blair": { lat: 11.6234, lng: 92.7265 },

  // Chandigarh
  Chandigarh: { lat: 30.7333, lng: 76.7794 },

  // Dadra and Nagar Haveli and Daman and Diu
  Daman: { lat: 20.3974, lng: 72.8328 },
  Silvassa: { lat: 20.2766, lng: 73.0169 },

  // Delhi
  "New Delhi": { lat: 28.6139, lng: 77.2090 },
  Delhi: { lat: 28.7041, lng: 77.1025 },

  // Jammu and Kashmir
  Srinagar: { lat: 34.0837, lng: 74.7973 },
  Jammu: { lat: 32.7266, lng: 74.8570 },

  // Ladakh
  Leh: { lat: 34.1526, lng: 77.5771 },
  Kargil: { lat: 34.5539, lng: 76.1349 },

  // Lakshadweep
  Kavaratti: { lat: 10.5669, lng: 72.6420 },

  // Puducherry
  Puducherry: { lat: 11.9416, lng: 79.8083 },
};

// Haversine great-circle distance in kilometers.
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;

  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
