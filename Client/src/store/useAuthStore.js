import {create} from "zustand";
import api from "../Services/api";


export const useAuthStore = create((set) => ({
    user: null,
    setUser: (user) => set({ user }),
    error: null,
    isLoading: false,
    setIsLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    login: async(values) => {
       try {
        set({ isLoading: true })
        const response = await api.post('auth/login', values)
        if(response.status === 200){
         set({ user: response.data })
        }
        return {success:true}
       } catch (error) {
        console.log(error)  
        set({ error: error?.response?.data?.message })
        return {success:false,error:error?.response?.data?.message}
       } finally {
        set({ isLoading: false })
       }
    },
    checkAuth: async() => {
        try {
            const response = await api.get('auth/me')
            if(response.status === 200){
                set({ user: response.data })
            }
        } catch (error) {
            console.log(error)
            set({ error: error?.response?.data?.message })
        }
    },
    logout: () => set({ user: null })
}))
