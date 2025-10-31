export const config = {
  restaurant: {
    name: 'Nomad Stop',
    address: '133 High Street, Staines-upon-Thames, TW18 4PD',
    postcode: 'TW18 4PD', // Restaurant postcode for distance calculations
    halal: true,
    // Coordinates fetched from Postcodes.io for TW18 4PD
    coordinates: {
      latitude: 51.434826, // From Postcodes.io API
      longitude: -0.507945, // From Postcodes.io API
    },
  },
  hours: {
    open: '12:00',
    close: '04:00', // daily
  },
  delivery: {
    radiusMiles: 12, // Delivery radius in miles (10-12 as requested)
    fee: 299, // £2.99 in pence
    freeOver: 2500, // £25.00 in pence
    // Legacy: keep for backward compatibility during transition
    postcodes: ['TW18', 'TW19', 'TW15'],
  },
  tips: [0, 5, 10, 12.5],
  slots: {
    intervalMins: 15,
    prepTimeMins: 20,
    maxPerSlot: 6,
  },
} as const;
