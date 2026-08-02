export const getTaskBgClass = (color: string) => {
  switch (color) {
    case 'red': return 'bg-[#D9ABC3]/25 border-[#D9ABC3]/40 text-[#7A4060]';
    case 'green': return 'bg-[#C3D9AB]/25 border-[#C3D9AB]/40 text-[#4F5E3E]';
    case 'purple': return 'bg-[#C3ABD9]/25 border-[#C3ABD9]/40 text-[#533966]';
    case 'orange': return 'bg-[#EED0AC]/30 border-[#EED0AC]/45 text-[#735930]';
    case 'dark': return 'bg-[#ABD9D1]/25 border-[#ABD9D1]/40 text-[#2B5E54]';
    case 'blue': return 'bg-[#ABC3D9]/25 border-[#ABC3D9]/40 text-[#3B546A]';
    case 'darkGreen': return 'bg-[#ABD9D1]/25 border-[#ABD9D1]/40 text-[#2B5E54]';
    case 'mossGreen': return 'bg-[#C3D9AB]/25 border-[#C3D9AB]/40 text-[#4F5E3E]';
    case 'beige': return 'bg-[#EED0AC]/30 border-[#EED0AC]/45 text-[#735930]';
    case 'rosyBrown': return 'bg-[#D9ABC3]/25 border-[#D9ABC3]/40 text-[#7A4060]';
    case 'midnightGreen': return 'bg-[#ABD9D1]/25 border-[#ABD9D1]/40 text-[#2B5E54]';
    case 'spaceCadet': return 'bg-[#C3ABD9]/25 border-[#C3ABD9]/40 text-[#533966]';
    case 'slateGray': return 'bg-[#ABC3D9]/25 border-[#ABC3D9]/40 text-[#3B546A]';
    case 'tan': return 'bg-[#EED0AC]/30 border-[#EED0AC]/45 text-[#735930]';
    case 'coffee': return 'bg-[#EED0AC]/30 border-[#EED0AC]/45 text-[#735930]';
    case 'caputMortuum': return 'bg-[#D9ABC3]/25 border-[#D9ABC3]/40 text-[#7A4060]';
    default: return 'bg-[#ABC3D9]/25 border-[#ABC3D9]/40 text-[#3B546A]';
  }
};

export const getTaskBorderLeftClass = (color: string) => {
  switch (color) {
    case 'red': return 'border-l-[#D9ABC3]';
    case 'green': return 'border-l-[#C3D9AB]';
    case 'purple': return 'border-l-[#C3ABD9]';
    case 'orange': return 'border-l-[#EED0AC]';
    case 'dark': return 'border-l-[#ABD9D1]';
    case 'blue': return 'border-l-[#ABC3D9]';
    case 'darkGreen': return 'border-l-[#ABD9D1]';
    case 'mossGreen': return 'border-l-[#C3D9AB]';
    case 'beige': return 'border-l-[#EED0AC]';
    case 'rosyBrown': return 'border-l-[#D9ABC3]';
    case 'midnightGreen': return 'border-l-[#ABD9D1]';
    case 'spaceCadet': return 'border-l-[#C3ABD9]';
    case 'slateGray': return 'border-l-[#ABC3D9]';
    case 'tan': return 'border-l-[#EED0AC]';
    case 'coffee': return 'border-l-[#EED0AC]';
    case 'caputMortuum': return 'border-l-[#D9ABC3]';
    default: return 'border-l-[#ABC3D9]';
  }
};

export const getDotBgClass = (colorVal: string) => {
  switch (colorVal) {
    case 'red': return 'bg-[#D9ABC3]';
    case 'green': return 'bg-[#C3D9AB]';
    case 'purple': return 'bg-[#C3ABD9]';
    case 'orange': return 'bg-[#EED0AC]';
    case 'blue': return 'bg-[#ABC3D9]';
    case 'dark': return 'bg-[#ABD9D1]';
    case 'darkGreen': return 'bg-[#ABD9D1]';
    case 'mossGreen': return 'bg-[#C3D9AB]';
    case 'beige': return 'bg-[#EED0AC]';
    case 'rosyBrown': return 'bg-[#D9ABC3]';
    case 'midnightGreen': return 'bg-[#ABD9D1]';
    case 'spaceCadet': return 'bg-[#C3ABD9]';
    case 'slateGray': return 'bg-[#ABC3D9]';
    case 'tan': return 'bg-[#EED0AC]';
    case 'coffee': return 'bg-[#EED0AC]';
    case 'caputMortuum': return 'bg-[#D9ABC3]';
    default: return 'bg-[#ABC3D9]';
  }
};

export const getBorderThemeClass = (colorVal: string) => {
  switch (colorVal) {
    case 'red': return 'border-[#D9ABC3]/30';
    case 'green': return 'border-[#C3D9AB]/35';
    case 'purple': return 'border-[#C3ABD9]/30';
    case 'orange': return 'border-[#EED0AC]/30';
    case 'blue': return 'border-[#ABC3D9]/30';
    case 'dark': return 'border-[#ABD9D1]/30';
    case 'darkGreen': return 'border-[#ABD9D1]/30';
    case 'mossGreen': return 'border-[#C3D9AB]/35';
    case 'beige': return 'border-[#EED0AC]/30';
    case 'rosyBrown': return 'border-[#D9ABC3]/30';
    case 'midnightGreen': return 'border-[#ABD9D1]/30';
    case 'spaceCadet': return 'border-[#C3ABD9]/30';
    case 'slateGray': return 'border-[#ABC3D9]/30';
    case 'tan': return 'border-[#EED0AC]/30';
    case 'coffee': return 'border-[#EED0AC]/30';
    case 'caputMortuum': return 'border-[#D9ABC3]/30';
    default: return 'border-[#ABC3D9]/30';
  }
};

export const getTextThemeClass = (colorVal: string) => {
  switch (colorVal) {
    case 'red': return 'text-[#7A4060]';
    case 'green': return 'text-[#4F5E3E]';
    case 'purple': return 'text-[#533966]';
    case 'orange': return 'text-[#735930]';
    case 'blue': return 'text-[#3B546A] font-bold';
    case 'dark': return 'text-[#2B5E54]';
    case 'darkGreen': return 'text-[#2B5E54]';
    case 'mossGreen': return 'text-[#4F5E3E]';
    case 'beige': return 'text-[#735930]';
    case 'rosyBrown': return 'text-[#7A4060]';
    case 'midnightGreen': return 'text-[#2B5E54]';
    case 'spaceCadet': return 'text-[#533966]';
    case 'slateGray': return 'text-[#3B546A]';
    case 'tan': return 'text-[#735930]';
    case 'coffee': return 'text-[#735930]';
    case 'caputMortuum': return 'text-[#7A4060]';
    default: return 'text-[#3B546A]';
  }
};
