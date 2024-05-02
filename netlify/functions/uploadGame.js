const process = require('process');
const { NodeSSH } = require('node-ssh');

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { username, publicIP, uploadPath, sshKey, gameFile } = JSON.parse(event.body);

    const ssh = new NodeSSH();
    try {
        // Connect to the server using SSH
        await ssh.connect({
            host: publicIP,
            username: username,
            privateKey: sshKey
        });

        // Simulated upload - replace with actual file handling logic
        // For real-world usage, consider using multipart/form-data parsing libraries to handle uploads

        // Your SSH upload logic here
        console.log('Simulated file upload:', gameFile);

        // Closing the SSH connection
        ssh.dispose();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'File uploaded successfully' })
        };
    } catch (error) {
        console.error('SSH Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to upload file' })
        };
    }
};
