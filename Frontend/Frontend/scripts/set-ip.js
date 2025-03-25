const fs = require('fs');
const os = require('os');
const path = require('path');

// Function to get local IP address
function getLocalIp() {
    const interfaces = os.networkInterfaces();
    
    for (let interfaceName in interfaces) {
        for (let iface of interfaces[interfaceName]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    
    return '127.0.0.1';
}

// Get local IP
const localIp = getLocalIp();
const envPath = path.join(__dirname, '../.env');
const envVarKey = 'EXPO_PUBLIC_BASE_URL';
const newEnvVar = `${envVarKey}=http://${localIp}:5125`;

try {
    let envContent = '';

    // Read existing .env file if it exists
    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');

        const regex = new RegExp(`^${envVarKey}=.*$`, 'm');

        if (regex.test(envContent)) {
            // Update existing variable
            envContent = envContent.replace(regex, newEnvVar);
        } else {
            // Append new variable
            envContent += `\n${newEnvVar}\n`;
        }
    } else {
        // Create new .env file
        envContent = `${newEnvVar}\n`;
    }

    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log(`✅ Updated .env with IP: ${localIp}`);
} catch (error) {
    console.error(`❌ Failed to update .env: ${error.message}`);
}