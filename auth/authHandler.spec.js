const connectDb = require('../__tests__/fixtures/db')

const makeFakeUser = require('../__tests__/fixtures/fakeUser')
const { userList, makeUser } = require('../users')
const { authHandler } = require('.')

describe('Authentication Handler', () => {

    beforeAll(() => connectDb())

    it("succesfully authenticates a valid user", async () => {
        const fakeUser = makeFakeUser()
        
        const user = makeUser(fakeUser)
        await userList.add(user)
        
        const result = await authHandler.authenticate(fakeUser)

        expect(result.accessToken).toMatch('ey')
        expect(result.refreshToken).toMatch('ey')
    })
    
})