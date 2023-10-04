module.exports = function buildMakeAuthHandler({ Password, Token }) {

    return function makeAuthHandler(userList) {

        return Object.freeze({
            authenticate,
        })

        async function authenticate(user) {

            const foundUser = await userList.findOneByEmail(user.email)
            console.log("Found User:  " + foundUser)
            if (!foundUser) { throw new Error("Authentication: Access denied") }

            const isAuthenticated = Password.compare(user.password, foundUser.password)
            console.log("Is Authentic:  " + isAuthenticated)
            if (!isAuthenticated) { throw new Error("Authentication: Access denied") }
            
            return {
                'accessToken': Token.signAccessToken({ user: foundUser.id }),
                'refreshToken': Token.signRefreshToken({ user: foundUser.id }),
            }
        }
    }
}