Steps to generate certificates for the security tutorial

1. Install node-opcua-pki using,
    npm install node-opcua-pki
2. To generate certificates for the demo use,
    node node_modules/node-opcua-pki/bin/crypto_create_CA.js demo
3. The certificates will be generated inside the 'certificates' folder. Make use of the self signed certificates for the security tutorial