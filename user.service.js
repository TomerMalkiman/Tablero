import { boardService } from './board.service.js'
import { httpService } from './http.service.js'
// import { socketService, SOCKET_EVENT_USER_UPDATED } from './socket.service.js'
// var gWatchedUser = null;

export const userService = {
    login,
    logout,
    signup,
    getLoggedinUser,
    getUsers,
    getById,
    remove,
    update,
    googleLogin
}

// Debug technique
window.userService = userService


async function getUsers(searchName) {
    return httpService.get(`user`, searchName)
}

async function getById(userId) {
    const user = await httpService.get(`user/${userId}`)
    gWatchedUser = user;
    return user;
}
function remove(userId) {
    return httpService.delete(`user/${userId}`)
}

async function update(user) {
    user = await httpService.put(`user/${user._id}`, user)
    // Handle case in which admin updates other user's details
    return user;
}

async function login(userCred) {
    const user = await httpService.post('auth/login', userCred)
    // socketService.emit('set-user-socket', user._id);
    return user;
}
async function signup(userCred) {
    const user = await httpService.post('auth/signup', userCred)
    // socketService.emit('set-user-socket', user._id);
    boardService.AddNewUserBoard()
    return user;
}
async function logout() {
    // socketService.emit('unset-user-socket');
    return await httpService.post('auth/logout')
}


async function getLoggedinUser() {
    try {
        const user = await httpService.get('auth/loggedinUser');
        return user;
    } catch (err) {
        throw err;
    }
}

async function googleLogin(user){
    const returnedUser = await httpService.post('auth/googleLogin', user);
    return returnedUser;
}