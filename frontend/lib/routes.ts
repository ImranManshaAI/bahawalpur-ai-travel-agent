export type BusRoute = {
  number: string;
  name: string;
  shortName: string;
  description: string;
  price: string;
  priceLabel: string;
  stops: string[];
};

export const routes: BusRoute[] = [
  {
    number: "01",
    name: "Bahawalpur Heritage Tour",
    shortName: "Heritage Route",
    description:
      "A classic Bahawalpur heritage journey covering important city landmarks and Noor Mehal.",
    price: "Rs. 300",
    priceLabel: "Per Seat",
    stops: [
      "TDCP Terminal",
      "Farid Gate",
      "DC Chowk",
      "Circular Road",
      "Fawwar Chowk",
      "Noor Mehal",
    ],
  },

  {
    number: "02",
    name: "Bahawalpur City Explorer Tour",
    shortName: "City Explorer Route",
    description:
      "Explore Bahawalpur's museum, library, shopping and entertainment destinations in one city tour.",
    price: "Rs. 300",
    priceLabel: "Per Seat",
    stops: [
      "TDCP",
      "Farid Gate",
      "DC Chowk",
      "BWP Museum & Library",
      "Circular Road",
      "Gulzar Sadiq",
      "SS World",
      "KFC",
    ],
  },

  {
    number: "03",
    name: "DHA & Leisure Tour",
    shortName: "Leisure Route",
    description:
      "Travel through the city towards DHA and enjoy leisure time at the park destination.",
    price: "Rs. 300",
    priceLabel: "Per Seat",
    stops: [
      "Terminal (TDCP Office)",
      "Farid Gate",
      "DC Chowk",
      "Islamic Colony Road",
      "DHA Glow / Central Park",
    ],
  },

  {
    number: "04",
    name: "Special School & Family Tour",
    shortName: "Special Full-Day Route",
    description:
      "A special whole-day tour designed for schools and groups, with one-hour stays at every destination.",
    price: "Rs. 30,000",
    priceLabel: "Whole-Day Tour",
    stops: [
      "Zoo",
      "Farid Gate",
      "Museum",
      "Library",
      "Noor Mehal",
      "Gulzar Sadiq",
      "SS World",
      "DHA Park",
    ],
  },
];