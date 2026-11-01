import React from 'react';

interface AnimalIllustrationProps {
  number: number;
  className?: string;
}

export const AnimalIllustration: React.FC<AnimalIllustrationProps> = ({ number, className = 'w-full h-full' }) => {
  switch (number) {
    case 1: // ជូត (Rat)
      return (
        <img
          src="/assets/aistudio/image_56958bf8.png"
          alt="ជូត 1"
          className={`${className} object-contain rounded`}
        />
      );

    case 2: // ឆ្លូវ (Ox)
      return (
        <img
          src="/assets/aistudio/image_db618d8c.png"
          alt="ឆ្លូវ 2"
          className={`${className} object-contain rounded`}
        />
      );

    case 3: // ខាល (Tiger)
      return (
        <img
          src="/assets/aistudio/image_f12e60ed.png"
          alt="ខាល 3"
          className={`${className} object-contain rounded`}
        />
      );

    case 4: // ថោះ (Rabbit)
      return (
        <img
          src="/assets/aistudio/image_da2dada5.png"
          alt="ថោះ 4"
          className={`${className} object-contain rounded`}
        />
      );

    case 5: // រោង (Dragon / Naga)
      return (
        <img
          src="/assets/aistudio/image_d13f2d73.png"
          alt="រោង 5"
          className={`${className} object-contain rounded`}
        />
      );

    case 6: // ម្សាញ់ (Snake)
      return (
        <img
          src="/assets/aistudio/image_200a760b.png"
          alt="ម្សាញ់ 6"
          className={`${className} object-contain rounded`}
        />
      );

    case 7: // មមី (Horse)
      return (
        <img
          src="/assets/aistudio/image_50856913.png"
          alt="មមី 7"
          className={`${className} object-contain rounded`}
        />
      );

    case 8: // មមែ (Goat)
      return (
        <img
          src="/assets/aistudio/image_c0557994.png"
          alt="មមែ 8"
          className={`${className} object-contain rounded`}
        />
      );

    case 9: // វក (Monkey / Hanuman)
      return (
        <img
          src="/assets/aistudio/image_799af351.png"
          alt="វក 9"
          className={`${className} object-contain rounded`}
        />
      );

    case 10: // រកា (Rooster)
      return (
        <img
          src="/assets/aistudio/image_a48a72a3.png"
          alt="រកា 10"
          className={`${className} object-contain rounded`}
        />
      );

    case 11: // ច (Dog)
      return (
        <img
          src="/assets/aistudio/image_512554a0.png"
          alt="ច 11"
          className={`${className} object-contain rounded`}
        />
      );

    case 12: // កុរ (Pig)
      return (
        <img
          src="/assets/aistudio/image_64be13af.png"
          alt="កុរ 12"
          className={`${className} object-contain rounded`}
        />
      );

    default:
      return null;
  }
};
