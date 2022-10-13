const connectDb = require('../__tests__/fixtures/db')

const makeFakeUser = require("../__tests__/fixtures/fakeUser")

const { userList } = require(".")


describe("User List", () => {

    beforeAll(() => connectDb())
    beforeEach(async () => await userList.remove({}))

    it("successfully adds a user to the db", async () => {
        const fakeUser = makeFakeUser()
        const addedUser = await userList.add(fakeUser)

        expect(addedUser).not.toBeNull()
    })

    it("can remove a user from the db", async () => {
        const fakeUser = makeFakeUser()
        const added = await userList.add(fakeUser)
        const removedCount = await userList.remove(added)

        expect(removedCount).toBe(1)

    })

    it("finds a user by email", async () => {
        const fakeUser = makeFakeUser()
        
        await userList.add(fakeUser)
        
        const found = await userList.findOneByEmail(fakeUser.email)

        expect(found).not.toBeNull()
        expect(found.email).toBe(fakeUser.email)

    })

})