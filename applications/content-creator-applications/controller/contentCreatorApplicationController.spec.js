const connectDb = require('../../../__tests__/fixtures/db');
const makeFakeContentCreatorApplication = require('../../../__tests__/fixtures/fakeContentCreatorApplication');

const { contentCreatorApplicationController: handle } = require('.');
const { contentCreatorApplicationList } = require('../data-access');
const mongoose = require('mongoose');

describe('Content Creator Application Controller', () => {

  beforeAll(() => connectDb());
  afterEach(async () => await contentCreatorApplicationList.remove({}));

  it('successfully posts a content creator application', async () => {

    const fakeApplication = makeFakeContentCreatorApplication();

    const request = {
      header: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: fakeApplication,
      params: {},
      queryParams: {},
    };

    const response = await handle(request);

    expect(response.status).toBe(201);
    expect(response.success).toBe(true);
  });

  it('gets a specific content creator application', async () => {
    const fakeApplication = makeFakeContentCreatorApplication();

    await contentCreatorApplicationList.add(fakeApplication);

    const request = {
      header: { 'Content-Type': 'application/json' },
      method: 'GET',
      params: { id: fakeApplication.id },
    };

    const expected = {
      success: true,
      status: 200,
      data: fakeApplication
    };

    const actual = await handle(request);

    expect(actual.status).toBe(expected.status);
    expect(actual.success).toBe(expected.success);

  });

  it('approves a single content creator application', async () => {
    const fakeApplication = makeFakeContentCreatorApplication();

    await contentCreatorApplicationList.add(fakeApplication);

    const request = {
      header: { 'Content-Type': 'application/json' },
      method: 'POST',
      params: { id: fakeApplication.id },
      queryParams: { action: 'approve' },
      body: {}
    };

    const response = await handle(request);

    expect(response.status).toBe(200);
    expect(response.success).toBe(true);
    expect(response.data.approved).toBe(true);

  });
  xit('declines a single content creator application', async () => { });

  afterAll(async () => {
    await mongoose.connection.close();
  });

});