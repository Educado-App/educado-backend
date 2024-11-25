const axios = require('axios');
const FormData = require('form-data');
const process = require('process');


const serviceUrl = process.env.TRANSCODER_SERVICE_URL;

const uploadFileToBucket = async (file, fileName) => {
	const form = new FormData();

	// Add file and filename to form
	console.log('file', file);
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
			throw new Error(error.response.data);
		} else {
			throw new Error('An error occurred during upload.');
		}
	}
};

module.exports = {
	uploadFileToBucket
};