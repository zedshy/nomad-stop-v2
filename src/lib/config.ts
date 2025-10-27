export const config = {
  restaurant: {
    name: 'Nomad Stop',
    address: '133 High Street, Staines-upon-Thames, TW18 4PD',
    halal: true,
  },
  hours: {
    open: '12:00',
    close: '04:00', // daily
  },
  delivery: {
    postcodes: ['TW18', 'TW19', 'TW15'],
    fee: 299, // £2.99 in pence
    freeOver: 2500, // £25.00 in pence
  },
  tips: [0, 5, 10, 12.5],
  slots: {
    intervalMins: 15,
    prepTimeMins: 20,
    maxPerSlot: 6,
  },
} as const;
