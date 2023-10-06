const connectDb = require('../../../__tests__/fixtures/db');

const makeFakeContentCreatorApplication = require('../../../__tests__/fixtures/fakeContentCreatorApplication');
const { contentCreatorApplicationList } = require('.');
const mongoose = require('mongoose');

describe('Content Creator Application List', () => {

	beforeAll(() => connectDb());
	afterEach(async () => await contentCreatorApplicationList.remove({}));

	it('can add a new content creator application', async () => {
		const fakeApplication = makeFakeContentCreatorApplication();

		const added = await contentCreatorApplicationList.add(fakeApplication);

		expect(added).toMatchObject(fakeApplication);
	});

	it('can remove a content creator application', async () => {
		const first = makeFakeContentCreatorApplication();
		const second = makeFakeContentCreatorApplication();

		await contentCreatorApplicationList.add(first);
		await contentCreatorApplicationList.add(second);

		const removedCount = await contentCreatorApplicationList.remove({});

		expect(removedCount).toBe(2);

	});
	it('can list all content creator applications', async () => {
		const first = makeFakeContentCreatorApplication();
		const second = makeFakeContentCreatorApplication();

		await contentCreatorApplicationList.add(first);
		await contentCreatorApplicationList.add(second);

		const results = await contentCreatorApplicationList.findAll();

		expect(results.length).toBe(2);

	});
	it('can find a specific content creator application by id', async () => {
		const fakeApplication = makeFakeContentCreatorApplication();

		await contentCreatorApplicationList.add(fakeApplication);

		const found = await contentCreatorApplicationList.findById(fakeApplication.id);

		expect(found).not.toBeNull();
		expect(found).toMatchObject(fakeApplication);
	});

	afterAll(async () => {
		await mongoose.connection.close();
	});
});