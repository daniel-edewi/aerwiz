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
    tripType: 'ONE_WAY'
  },
  searchResults: [],
  selectedFlight: null,
  isSearching: false,
  error: null,

  setSearchParams: (params) => set((state) => ({
    searchParams: { ...state.searchParams, ...params }
  })),

  setSearchResults: (results) => set({ searchResults: results }),

  setSelectedFlight: (flight) => set({ selectedFlight: flight }),

  setIsSearching: (isSearching) => set({ isSearching }),

  setError: (error) => set({ error }),

  clearSearch: () => set({
    searchResults: [],
    selectedFlight: null,
    error: null
  })
}));

export default useFlightStore;