// Generate 100 masters with random data

const professions = ['Santexnik', 'Elektrik', 'Ta\'mirchi', 'Tozalash', 'Bog\'bonchilik', 'Duradgor', 'Bo\'yoqchi', 'Konditsioner ustasi'];

const firstNames = ['Sardor', 'Aziz', 'Kamol', 'Rustam', 'Javohir', 'Bobur', 'Jamshid', 'Davron', 'Eldor', 'Farrux', 'Sanjar', 'Timur', 'Ulugbek', 'Vali', 'Zafar', 'Abbos', 'Bekzod', 'Dilshod', 'Otabek', 'Sherzod'];

const lastNames = ['Karimov', 'Rahimov', 'Tursunov', 'Normatov', 'Abdullayev', 'Yusupov', 'Sharipov', 'Mahmudov', 'Ibragimov', 'Aliyev'];

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomFloat = (min, max, decimals = 1) => parseFloat((Math.random() * (max - min) + min).toFixed(decimals));

export const generateMasters = (count = 100) => {
  const masters = [];

  for (let i = 1; i <= count; i++) {
    const profession = getRandomElement(professions);
    const isQuickCall = Math.random() > 0.6; // 40% chance
    const workScheduleTypes = ['24/7', 'Standart', 'Moslashuvchan'];
    const scheduleType = isQuickCall && Math.random() > 0.5 ? '24/7' : getRandomElement(workScheduleTypes);

    let workSchedule;
    switch (scheduleType) {
      case '24/7':
        workSchedule = { type: '24/7', days: 'Har kuni', hours: 'Tun-kunduz' };
        break;
      case 'Standart':
        workSchedule = { type: 'Standart', days: 'Dush-Juma', hours: '09:00-18:00' };
        break;
      case 'Moslashuvchan':
        workSchedule = { type: 'Moslashuvchan', days: 'Dush-Shan', hours: '08:00-20:00' };
        break;
    }

    const portfolioCount = getRandomNumber(2, 5);
    const portfolio = Array(portfolioCount).fill(null).map((_, idx) => {
      const imageIds = [
        '1585704032915-c3400ca199e7',
        '1607472586893-edb57bdc0e39',
        '1581858726788-75bc0f6a952d',
        '1620626011761-996317b8d101',
        '1621905251189-08b45d6a269e',
        '1621905252507-b35492cc74b4',
        '1504148455328-c376907d081c',
        '1513467535987-fd81bc7d62f8',
        '1589939705384-5185137a7f0f',
        '1562259949-e8e7689d7828',
        '1550581190-9c1c48d21d6c',
        '1586023492125-27b2c045efd7',
      ];
      return `https://images.unsplash.com/photo-${getRandomElement(imageIds)}?w=400`;
    });

    const master = {
      id: i,
      name: `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`,
      profession,
      rating: getRandomFloat(3.5, 5.0, 1),
      reviewCount: getRandomNumber(10, 300),
      hourlyRate: getRandomNumber(20, 80) * 10000, // 200k - 800k
      avatar: `https://i.pravatar.cc/150?img=${getRandomNumber(1, 70)}`,
      isVerified: Math.random() > 0.3, // 70% verified
      isInsured: Math.random() > 0.5, // 50% insured
      isPro: Math.random() > 0.7, // 30% pro
      completedJobs: getRandomNumber(10, 500),
      distance: getRandomFloat(0.5, 15.0, 1),
      description: `${getRandomNumber(3, 20)} yillik tajriba. Professional ${profession.toLowerCase()}. Sifatli va tezkor xizmat.`,
      phone: `+998 9${getRandomNumber(0, 9)} ${getRandomNumber(100, 999)} ${getRandomNumber(10, 99)} ${getRandomNumber(10, 99)}`,
      availability: ['2025-12-05', '2025-12-06', '2025-12-07'],
      workSchedule,
      isQuickCall,
      portfolio,
      experience: getRandomNumber(1, 25), // years of experience
      isAvailable: Math.random() > 0.2, // 80% available
    };

    masters.push(master);
  }

  return masters;
};
