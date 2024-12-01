const axios = require('axios');
const FormData = require('form-data');
const process = require('process');

const serviceUrl = process.env.TRANSCODER_SERVICE_URL;

// Also works as an update function since the service will overwrite the file if it already exists
const uploadFileToBucket = async (file, fileName) => {
	const form = new FormData();

	// Add file and filename to form
	form.append('file', file.buffer, {
		filename: file.originalname,
		contentType: file.mimetype
	});
	form.append('fileName', fileName);

	try {
		const response = await axios.post(serviceUrl + '/bucket/', form, { headers: form.getHeaders() });
		return response.data;
	} catch (error) {
		if (error.response && error.response.data) {
			throw new Error(`Upload error: ${JSON.stringify(error.response.data)}`);
		} else {
			throw new Error(`An error occurred during upload: ${error.message}`);
		}
	}
};

const deleteFileFromBucket = (fileName) => {
	return axios.delete(serviceUrl + '/bucket/' + fileName);
};

module.exports = {
	uploadFileToBucket,
	deleteFileFromBucket,
};