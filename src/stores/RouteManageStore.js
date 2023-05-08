import { defineStore } from "pinia";

export const useRouteManageStore = defineStore('RouteManageStore', {
    state: () => {
        return {
            currentRoute: null,
            routeTo: null,
            isRouteFromApp: false,
            isAdmin: false
        }
    }
})