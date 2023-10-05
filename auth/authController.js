module.exports = function makeAuthEndpointHandler(authHandler) {

	return async function handle(httpRequest) {

		switch (httpRequest.method) {
		case 'POST':
			return await postUser(httpRequest);
		default:
			return {
				success: false,
				status: 405,
				errors: [{ 
					message: `method ${httpRequest.method} not allowed` 
				}]
			};
		}
	};

    async function postUser(httpRequest) {
        user = httpRequest.body;

        try {
            const response = await authHandler.authenticate(user)
            
            return {
                success: true,
                status: 200,
                data: response
            }

        } catch (error) {
            
            return {
                success: false,
                status: 400,
                errors: [{ 
                    message: error.message 
                }]
            }
        }
    }
}