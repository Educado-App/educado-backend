const { spawn } = require('child_process');


const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';

// Utility function to execute a Python script
const executePythonScript = (scriptPath, input = null, isBinary = false, courses = null) => {
	return new Promise((resolve, reject) => {
		const python = spawn(pythonCommand, [scriptPath], { stdio: ['pipe', 'pipe', 'pipe'] });

		if (input && courses){
			const payload = JSON.stringify({ input, courses });
			python.stdin.write(payload);
			python.stdin.end();
		}else if(input){
			python.stdin.write(input);
			python.stdin.end();
		}


		let output = [];
		let errorOutput = '';

		python.stdout.on('data', (data) => {
			if (isBinary) {
				output.push(data); // Collect binary chunks
			} else {
				output.push(data.toString()); // Collect text output
			}
		});

		python.stderr.on('data', (data) => {
			errorOutput += data.toString();
		});

		python.on('close', (code) => {
			if (code === 0) {
				if (isBinary) {
					resolve(Buffer.concat(output)); // Return concatenated binary buffer
				} else {
					resolve(output.join('').trim()); // Return concatenated string output
				}
			} else {
				reject(errorOutput || `Script exited with code ${code}`);
			}
		});
	});
};

module.exports = executePythonScript;