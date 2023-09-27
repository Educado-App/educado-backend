module.exports = function makeFakeUser() {

    return {
        email: "fake@gmail.com",
        password: "ABC123456!",
        googleID: "1234567891011",
        joinedAt: new Date(),
        modifiedAt: new Date(),
        name: "Fake User"
    }

}