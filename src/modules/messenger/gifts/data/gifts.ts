import { Gift } from "../types";

export const gifts: Gift[] = [
  {
    id: "love_t1_rose",
    name: "Rose",
    category: "love",
    tier: "t1",
    price: { diamonds: 5 },
    assets: {
      icon: "/gifts/icons/love/rose.webp",
      animation: "/gifts/anims/love/rose.webm",
      preview: "/gifts/preview/love/rose.mp4",
    },
  },

  {
    id: "love_t3_rose_rain",
    name: "Rose Rain",
    category: "love",
    tier: "t3",
    price: { diamonds: 200 },
    assets: {
      icon: "/gifts/icons/love/rose_rain.webp",
      animation: "/gifts/anims/love/rose_rain.webm",
      preview: "/gifts/preview/love/rose_rain.mp4",
    },
  },

  {
    id: "dragon_t5_royal",
    name: "Dragon King",
    category: "dragon",
    tier: "t5",
    price: { diamonds: 5000 },
    assets: {
      icon: "/gifts/icons/dragon/dragon_king.webp",
      animation: "/gifts/anims/dragon/dragon_king.webm",
      preview: "/gifts/preview/dragon/dragon_king.mp4",
    },
    audio: {
      src: "/gifts/audio/dragon_king.mp3",
      duration: 8,
    },
  },

  {
    id: "womens_t4_queen",
    name: "Queen Rose",
    category: "womens_day",
    tier: "t4",
    price: { diamonds: 800 },
    assets: {
      icon: "/gifts/icons/womens/queen_rose.webp",
      animation: "/gifts/anims/womens/queen_rose.webm",
      preview: "/gifts/preview/womens/queen_rose.mp4",
    },
    audio: {
      src: "/gifts/audio/queen_rose.mp3",
      duration: 5,
    },
  },

  {
    id: "cosmos_t3_galaxy",
    name: "Galaxy",
    category: "cosmos",
    tier: "t3",
    price: { diamonds: 300 },
    assets: {
      icon: "/gifts/icons/cosmos/galaxy.webp",
      animation: "/gifts/anims/cosmos/galaxy.webm",
      preview: "/gifts/preview/cosmos/galaxy.mp4",
    },
  },

  {
    id: "birthday_t2_cake",
    name: "Cake",
    category: "birthday",
    tier: "t2",
    price: { diamonds: 50 },
    assets: {
      icon: "/gifts/icons/birthday/cake.webp",
      animation: "/gifts/anims/birthday/cake.webm",
      preview: "/gifts/preview/birthday/cake.mp4",
    },
  },

  {
    id: "angel_t4_archangel",
    name: "Archangel",
    category: "angel",
    tier: "t4",
    price: { diamonds: 900 },
    assets: {
      icon: "/gifts/icons/angel/archangel.webp",
      animation: "/gifts/anims/angel/archangel.webm",
      preview: "/gifts/preview/angel/archangel.mp4",
    },
    audio: {
      src: "/gifts/audio/archangel.mp3",
      duration: 6,
    },
  },

  {
    id: "wedding_t5_proposal",
    name: "Proposal",
    category: "wedding",
    tier: "t5",
    price: { diamonds: 3000 },
    assets: {
      icon: "/gifts/icons/wedding/proposal.webp",
      animation: "/gifts/anims/wedding/proposal.webm",
      preview: "/gifts/preview/wedding/proposal.mp4",
    },
    audio: {
      src: "/gifts/audio/proposal.mp3",
      duration: 7,
    },
  },

  {
    id: "newyear_t3_fireworks",
    name: "Fireworks",
    category: "new_year",
    tier: "t3",
    price: { diamonds: 250 },
    assets: {
      icon: "/gifts/icons/newyear/fireworks.webp",
      animation: "/gifts/anims/newyear/fireworks.webm",
      preview: "/gifts/preview/newyear/fireworks.mp4",
    },
  },

  {
    id: "holi_t4_color_explosion",
    name: "Color Explosion",
    category: "holi",
    tier: "t4",
    price: { diamonds: 700 },
    assets: {
      icon: "/gifts/icons/holi/color.webp",
      animation: "/gifts/anims/holi/color.webm",
      preview: "/gifts/preview/holi/color.mp4",
    },
    audio: {
      src: "/gifts/audio/holi.mp3",
      duration: 5,
    },
  },
];