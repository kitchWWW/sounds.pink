document.addEventListener('DOMContentLoaded', async () => {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');

        const cameraSelect = document.getElementById('cameraSelect');
        videoDevices.forEach(device => {
            const option = document.createElement('option');
            option.value = device.deviceId;
            option.text = device.label || `Camera ${cameraSelect.length + 1}`;
            cameraSelect.appendChild(option);
        });

        cameraSelect.addEventListener('change', () => {
            const selectedDeviceId = cameraSelect.value;
            setCamera(selectedDeviceId);
        });

        if (videoDevices.length > 0) {
            setCamera(videoDevices[0].deviceId);
        }
    } catch (error) {
        console.error('Error accessing media devices.', error);
    }
});

async function setCamera(deviceId) {
    try {
        const constraints = {
            video: { deviceId: { exact: deviceId } }
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        const videoElement = document.getElementById('videoElement');
        videoElement.srcObject = stream;
    } catch (error) {
        console.error('Error setting camera.', error);
    }
}
