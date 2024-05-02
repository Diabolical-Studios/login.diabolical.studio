const Busboy = require('busboy');
const { NodeSSH } = require('node-ssh');
const fs = require('fs');
const os = require('os');
const path = require('path');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const busboy = new Busboy({ headers: event.headers });

    // Create promises to handle asynchronous file processing
    const fileWrites = [];
    const formData = {};

    return new Promise((resolve, reject) => {
        busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
            const saveToPath = path.join(os.tmpdir(), filename);
            const writeStream = fs.createWriteStream(saveToPath);
            file.pipe(writeStream);

            fileWrites.push(new Promise((resolve, reject) => {
                file.on('end', () => writeStream.end());
                writeStream.on('finish', () => resolve({ fieldname, saveToPath }));
                writeStream.on('error', reject);
            }));
        });

        busboy.on('field', (fieldname, value) => {
            formData[fieldname] = value;
        });

        busboy.on('finish', async () => {
            try {
                const files = await Promise.all(fileWrites);
                const ssh = new NodeSSH();
                await ssh.connect({
                    host: formData.publicIP,
                    username: formData.username,
                    privateKey: fs.readFileSync(files.find(f => f.fieldname === 'sshKey').saveToPath)
                });

                for (const file of files) {
                    if (file.fieldname === 'gameFile') {
                        await ssh.putFile(file.saveToPath, formData.uploadPath);
                    }
                }

                ssh.dispose();
                resolve({
                    statusCode: 200,
                    body: JSON.stringify({ message: "File uploaded successfully!" })
                });
            } catch (error) {
                console.error('SCP Upload Failed:', error);
                reject({
                    statusCode: 500,
                    body: JSON.stringify({ message: "Failed to upload file." })
                });
            }
        });

        busboy.write(event.body);
        busboy.end();
    });
};
