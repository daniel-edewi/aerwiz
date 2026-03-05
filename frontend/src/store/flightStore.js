import { create } from 'zustand';

const useFlightStore = create((set) => ({
  searchParams: {
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    adults: 1,
    children: 0,
    infants: 0,
    cabinClass: 'ECONOMY',
    tripType: 'ONE_WAY',
    multiCityLegs: [
      { origin: '', destination: '', departureDate: '' },
      { origin: '', destination: '', departureDate: '' }
    ]
  },
  searchResults: [],
  selectedFlight: null,
  isSearching: false,
  error: null,

  setSearchParams: (params) => set((state) => ({
    searchParams: { ...state.searchParams, ...params }
  })),

  setMultiCityLeg: (index, leg) => set((state) => {
    const legs = [...state.searchParams.multiCityLegs];
    legs[index] = { ...legs[index], ...leg };
    return { searchParams: { ...state.searchParams, multiCityLegs: legs } };
  }),

  addMultiCityLeg: () => set((state) => ({
    searchParams: {
      ...state.searchParams,
      multiCityLegs: [...state.searchParams.multiCityLegs, { origin: '', destination: '', departureDate: '' }]
    }
  })),

  removeMultiCityLeg: (index) => set((state) => ({
    searchParams: {
      ...state.searchParams,
      multiCityLegs: state.searchParams.multiCityLegs.filter((_, i) => i !== index)
    }
  })),

  setSearchResults: (results) => set({ searchResults: results }),
  setSelectedFlight: (flight) => set({ selectedFlight: flight }),
  setIsSearching: (isSearching) => set({ isSearching }),
  setError: (error) => set({ error }),
  clearSearch: () => set({ searchResults: [], selectedFlight: null, error: null })
}));

export default useFlightStore;