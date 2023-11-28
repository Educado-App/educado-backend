const connectDb = require('../__tests__/fixtures/db');
const makeFakeUser = require('../__tests__/fixtures/fakeUser');
const { userList } = require('.');


describe('User List', () => {

  beforeAll(() => connectDb());
  afterEach(async () => await userList.remove({}));

  it('successfully adds a user to the db', async () => {
    const fakeUser = makeFakeUser();
    const addedUser = await userList.add(fakeUser);

    expect(addedUser).not.toBeNull();
  });

  it('can remove a user from the db', async () => {
    const fakeUser = makeFakeUser();
    const added = await userList.add(fakeUser);
    const removedCount = await userList.remove(added);

    expect(removedCount).toBe(1);
  });

  it('finds a user by email', async () => {
    const fakeUser = makeFakeUser();
        
    await userList.add(fakeUser);
        
    const found = await userList.findOneByEmail(fakeUser.email);

    expect(found).not.toBeNull();
    expect(found.email).toBe(fakeUser.email);
  });

  it('can update a user\'s email', async () => {
    const fakeUser = makeFakeUser();
    await userList.add(fakeUser);

    const updatedUser = await userList.updateEmail(fakeUser.email, 'newemail@example.com');

    expect(updatedUser.email).toBe('newemail@example.com');
  });

  it('can update a user\'s first name', async () => {
    const fakeUser = makeFakeUser();
    await userList.add(fakeUser);
    
    const updatedUser = await userList.updateFirstName(fakeUser.firstName, 'New First Name');
    
    expect(updatedUser.firstName).toBe('New First Name');
  });

  it('can update a user\'s last name', async () => {
    const fakeUser = makeFakeUser();
    await userList.add(fakeUser);
    
    const updatedUser = await userList.updateLastName(fakeUser.lastName, 'New Last Name');
    
    expect(updatedUser.lastName).toBe('New Last Name');
  });
    
});
