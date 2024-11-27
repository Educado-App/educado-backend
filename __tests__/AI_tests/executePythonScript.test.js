const { spawn } = require('child_process');
const executePythonScript = require('../../helpers/excutePython');

// Mock child_process.spawn
jest.mock('child_process', () => ({
    spawn: jest.fn(),
}));

describe('executePythonScript', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return text output when script executes successfully', async () => {
        // Mock spawn behavior for successful text output
        const mockStdout = {
            on: jest.fn((event, callback) => {
                if (event === 'data') callback(Buffer.from('Hello World'));
            }),
        };
        const mockStderr = { on: jest.fn() };
        const mockProcess = {
            stdout: mockStdout,
            stderr: mockStderr,
            on: jest.fn((event, callback) => {
                if (event === 'close') callback(0); // Exit code 0 (success)
            }),
            stdin: { write: jest.fn(), end: jest.fn() },
        };

        spawn.mockReturnValue(mockProcess);

        const result = await executePythonScript('test.py');
        expect(result).toBe('Hello World');
    });

    it('should return binary output when isBinary is true', async () => {
        const mockStdout = {
            on: jest.fn((event, callback) => {
                if (event === 'data') callback(Buffer.from([0x01, 0x02, 0x03]));
            }),
        };
        const mockStderr = { on: jest.fn() };
        const mockProcess = {
            stdout: mockStdout,
            stderr: mockStderr,
            on: jest.fn((event, callback) => {
                if (event === 'close') callback(0); // Exit code 0 (success)
            }),
            stdin: { write: jest.fn(), end: jest.fn() },
        };

        spawn.mockReturnValue(mockProcess);

        const result = await executePythonScript('test.py', null, true);
        expect(result).toEqual(Buffer.from([0x01, 0x02, 0x03]));
    });

    it('should throw an error when script exits with a non-zero code', async () => {
        const mockProcess = {
            stdout: { on: jest.fn() },
            stderr: { on: jest.fn() },
            on: jest.fn((event, callback) => {
                if (event === 'close') callback(1); // Exit code 1 (failure)
            }),
            stdin: { write: jest.fn(), end: jest.fn() },
        };

        spawn.mockReturnValue(mockProcess);

        await expect(executePythonScript('test.py')).rejects.toBe('Script exited with code 1');
    });

    it('should capture stderr output and throw it as an error', async () => {
        const mockStdout = { on: jest.fn() };
        const mockStderr = {
            on: jest.fn((event, callback) => {
                if (event === 'data') callback(Buffer.from('Some error occurred'));
            }),
        };
        const mockProcess = {
            stdout: mockStdout,
            stderr: mockStderr,
            on: jest.fn((event, callback) => {
                if (event === 'close') callback(1); // Exit code 1 (failure)
            }),
            stdin: { write: jest.fn(), end: jest.fn() },
        };

        spawn.mockReturnValue(mockProcess);

        await expect(executePythonScript('test.py')).rejects.toBe('Some error occurred');
    });

    it('should handle input correctly when provided', async () => {
        const mockStdout = {
            on: jest.fn((event, callback) => {
                if (event === 'data') callback(Buffer.from('Processed input'));
            }),
        };
        const mockStderr = { on: jest.fn() };
        const mockProcess = {
            stdout: mockStdout,
            stderr: mockStderr,
            on: jest.fn((event, callback) => {
                if (event === 'close') callback(0); // Exit code 0 (success)
            }),
            stdin: { write: jest.fn(), end: jest.fn() },
        };

        spawn.mockReturnValue(mockProcess);

        const result = await executePythonScript('test.py', 'input data');
        expect(result).toBe('Processed input');
        expect(mockProcess.stdin.write).toHaveBeenCalledWith('input data');
        expect(mockProcess.stdin.end).toHaveBeenCalled();
    });
});
