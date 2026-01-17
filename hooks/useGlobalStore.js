import create from "zustand"

export const useGlobalStore = create((set, get) => ({
    cache: {},
    setCache: (table, data) => set((state) => ({
        cache: { ...state.cache, [table]: data }
    })),
    getCache: (table) => get().cache[table] || [],

    filters: {},
    setFilter: (table, filter) => set((state) => ({
        filters: { ...state.filters, [table]: filter }
    })),
    getFilter: (table) => get().filters[table] || {}
}))
