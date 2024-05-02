document.getElementById('uploadForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const sshKey = document.getElementById('sshKey').files[0];
    const gameFile = document.getElementById('gameFile').files[0];
    const formData = new FormData();
    formData.append('sshKey', sshKey);
    formData.append('gameFile', gameFile);
    formData.append('username', document.getElementById('username').value);
    formData.append('publicIP', document.getElementById('publicIP').value);
    formData.append('uploadPath', document.getElementById('uploadPath').value);

    try {
        const response = await fetch('/.netlify/functions/uploadGame', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        alert('Upload successful: ' + result.message);
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to upload game.');
    }
});
