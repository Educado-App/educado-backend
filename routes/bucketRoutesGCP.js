const router = require('express').Router();
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const { PassThrough } = require('stream');

//Get serviceUrl from environment variable

/* global process */
const serviceUrl = process.env.TRANSCODER_SERVICE_URL;
//const serviceUrl = "http://localhost:8080/api/v1";


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Get list of all files in bucket
router.get('/', (req, res) => {
	//Forward to service api
	axios.get(serviceUrl + '/bucket/').then((response) => {
		res.send(response.data);
	}).catch((error) => {
		if (error.response && error.response.data) {
			// Forward the status code from the Axios error if available
			res.status(error.response.status || 500).send(error.response.data);
		} else {
			// Handle cases where the error does not have a response part (like network errors)
			res.status(500).send({ message: 'An error occurred during fecthing.' });
		}
	});
});

// Get file from bucket
router.get('/:filename', (req, res) => {
	//Forward to service api
	axios.get(serviceUrl + '/bucket/' + req.params.filename).then((response) => {
		res.send(response.data);
	}).catch((error) => {
		if (error.response && error.response.data) {
			// Forward the status code from the Axios error if available
			res.status(error.response.status || 500).send(error.response.data);
		} else {
			// Handle cases where the error does not have a response part (like network errors)
			res.status(500).send({ message: 'An error occurred during fetching.' });
		}
	});
});

// Delete file from bucket
router.delete('/:filename', (req, res) => {
	//Forward to service api
	axios.delete(serviceUrl + '/bucket/' + req.params.filename).then((response) => {
		res.send(response.data);
	}).catch((error) => {
		if (error.response && error.response.data) {
			// Forward the status code from the Axios error if available
			res.status(error.response.status || 500).send(error.response.data);
		} else {
			// Handle cases where the error does not have a response part (like network errors)
			res.status(500).send({ message: 'An error occurred during deletion.' });
		}
	});
});

// Upload file to bucket
router.post('/', upload.single('file'), (req, res) => {
	const form = new FormData();

	// Add file and filename to form
	form.append('file', req.file.buffer, {
		filename: req.file.originalname,
		contentType: req.file.mimetype
	});
	form.append('fileName', req.body.fileName);

	// Forward to service api
	axios.post(serviceUrl + '/bucket/', form, { headers: form.getHeaders() })
		.then(response => {
			res.send(response.data);
		})
		.catch(error => {
			if (error.response && error.response.data) {
				// Forward the status code from the Axios error if available
				res.status(error.response.status || 500).send(error.response.data);
			} else {
				// Handle cases where the error does not have a response part (like network errors)
				res.status(500).send({ message: 'An error occurred during upload.' });
			}
		});
});



axios.interceptors.response.use(response => {
	// This will process successful responses (within 2xx status codes)
	return response;
}, error => {
	// Handle error responses
	if (error.response && error.response.data && typeof error.response.data.on === 'function') {
		return new Promise((resolve, reject) => {
			let errorData = '';

			error.response.data.on('data', (chunk) => {
				errorData += chunk;
			});

			error.response.data.on('end', () => {
				// Once the entire error message is read from the stream, update the error object
				error.response.data = errorData;
				reject(error);
			});
		});
	} else {
		// Pass the original error through if the response data is not a stream
		return Promise.reject(error);
	}
});

// Stream file from bucket
router.get('/stream/:filename', async (req, res) => {
	try {
		// Forward to Go service stream handler
		const streamUrl = serviceUrl + '/stream/' + req.params.filename;

		// Make a GET request to the Go service
		const response = await axios({
			method: 'get',
			url: streamUrl,
			responseType: 'stream'
		});

		// Check for errors from the Go service
		if (response.status !== 200) {
			res.status(response.status).send(response.data);
			return;
		}

		// Set the headers from the Go service response
		res.set(response.headers);

		// Pipe the response stream back to the client
		const passThrough = new PassThrough();
		response.data.pipe(passThrough);
		passThrough.pipe(res);

		// Handle any errors during streaming
		passThrough.on('error', () => {
			res.status(500).send('Error during streaming');
		});
	} catch (error) {
		// Use the error response data (if available) when sending the error to the client
		res.status(500).send(error.response ? error.response.data : 'Error in request to Go service');
	}
});


module.exports = router;