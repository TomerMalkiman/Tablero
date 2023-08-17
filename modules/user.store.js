import { userService } from '../../services/user.service.js';

export const userStore = {
    state: {
        loggedinUser: null,
        searchedUsers: null,
    },
    getters: {
        loggedinUser(state) {
            return state.loggedinUser;
        },
        searchedUsers(state) {
            return state.searchedUsers
        }
    },
    mutations: {
        login(state, { user }) {
            state.loggedinUser = user;
        },
        logout(state) {
            state.loggedinUser = null;
        },
        updateSearchedUsers(state, { users }) {
            state.searchedUsers = users
        }
    },
    actions: {
        async getLoggedinUser({ commit }) {
            try {
                const user = await userService.getLoggedinUser();
                commit({ type: 'login', user });
            } catch (err) {
                throw err
            }
        },
        async login({ commit }, { user }) {
            try {
                const returnedUser = await userService.login(user)
                commit({ type: 'login', user: returnedUser })
            } catch (err) {
                throw err
            }
        },
        async signup({ commit }, { user }) {
            try {
                const returnedUser = await userService.signup(user)
                commit({ type: 'login', user: returnedUser })
            } catch (err) {
                throw err
            }
        },
        async googleLogin({ commit }, { user }) {
            const returnedUser = await userService.googleLogin(user);
            commit({ type: 'login', user: returnedUser })

        },
        async logout({ commit }) {
            try {
                await userService.logout()
                commit({ type: 'logout' })
            } catch (err) {
                throw err
            }
        },
        async searchForUsers({ commit }, { searchInput }) {
            const users = await userService.getUsers(searchInput)
            commit({ type: 'updateSearchedUsers', users })
        },
    },
};
