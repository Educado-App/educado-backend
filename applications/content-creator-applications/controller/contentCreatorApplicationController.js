const { makeContentCreatorApplication } = require('../domain');
const { makeHttpError } = require('../../../helpers/error');

module.exports = function makeContentCreatorApplicationController({ contentCreatorApplicationList }) {

	return async function handle(httpRequest) {

		switch (httpRequest.method) {
		case 'GET':
			return await getContentCreatorApplication(httpRequest);
                
		case 'POST':
			if ('action' in httpRequest.queryParams) {
				return await postContentCreatorApplicationWithActions(httpRequest);
			}
			else {
				return await postContentCreatorApplication(httpRequest);
			}
		default:
			return makeHttpError({
				status: 405,
				message: `Method '${httpRequest.method}' is not allowed`
			});
		}

	};

	async function getContentCreatorApplication(httpRequest) {

		const id = httpRequest.params.id ?? null;
		try {
			const results = id ?
				await contentCreatorApplicationList.findById(id) :
				await contentCreatorApplicationList.findAll(httpRequest.queryParams);

			return {
				success: true,
				status: 200,
				data: results
			};

		} catch (error) {
			return makeHttpError({ status: 400, message: error.message });
		}

	}

	async function postContentCreatorApplication(httpRequest) {

		const applicationInfo = httpRequest.body;

		try {

			const validCCApplication = makeContentCreatorApplication(applicationInfo);

            const created = await contentCreatorApplicationList.add({
                id: validCCApplication.getId(),
                name: validCCApplication.getName(),
                email: validCCApplication.getEmail(),
                password: validCCApplication.getPassword(),
                approved: validCCApplication.isApproved(),
                rejectionReason: validCCApplication.getRejectReason(),
                createdAt: validCCApplication.getCreatedAt(),
                modifiedAt: validCCApplication.getModifiedAt(),
            })

			return {
				success: true,
				status: 201,
				data: created
			};

		} catch (error) {
			return makeHttpError({ status: 400, message: error.message });
		}
	}

	async function postContentCreatorApplicationWithActions(httpRequest) {
		const action = httpRequest.queryParams.action;
		const id = httpRequest.params.id;
		const declineReason = httpRequest.body.rejectReason;

		const ALLOWED_ACTIONS = [
			'approve',
			'decline'
		];


		if (!action || !ALLOWED_ACTIONS.includes(action)) {
			return makeHttpError({ status: 400, message: `Invalid action. Valid actions include ${ALLOWED_ACTIONS}` });
		}
		if (!id) {
			return makeHttpError({ status: 400, message: 'An id of a content creator application must be provided as a request parameter' });
		}

		const existing = await contentCreatorApplicationList.findById(id);

		if (!existing) {
			return makeHttpError({ status: 400, message: `No content creator application with id '${id}' was found` });
		}

		const application = makeContentCreatorApplication({ id: existing._id, ...existing });

		if (action === 'approve') { application.approve(); }
		else {
			if (declineReason) { application.decline({ reason: declineReason }); }
			else { application.decline(); }

		}

		try {
			const updated = await contentCreatorApplicationList.update({
				id: application.getId(),
				approved: application.isApproved(),
				rejectReason: application.getRejectReason(),
				modifiedAt: new Date()
			});

			return {
				success: true,
				status: 200,
				data: updated
			};

		} catch (error) {
			return makeHttpError({ status: 400, message: error.message });
		}

	}
};