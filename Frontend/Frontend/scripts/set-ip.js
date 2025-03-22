// const fs = require('fs');
// const os = require('os');
// const path = require('path');

// // Function to get local IP address
// function getLocalIp() {
//     const interfaces = os.networkInterfaces();
//     for (let interfaceName in interfaces) {
//         for (let iface of interfaces[interfaceName]) {
//             if (iface.family === 'IPv4' && !iface.internal) {
//                 return iface.address;
//             }
//         }
//     }
//     return '127.0.0.1';
// }

// // Generate new .env content
// const localIp = getLocalIp();
// const envContent = `EXPO_PUBLIC_BASE_URL=http://${localIp}:5125\n`;

// // Write to .env file
// fs.writeFileSync(path.join(__dirname, '../.env'), envContent);

// console.log(`Updated .env with IP: ${localIp}`);
