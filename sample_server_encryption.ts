// Import the modules required for to start a server and get it running
import {
    OPCUAServer,
    SecurityPolicy,
    MessageSecurityMode
} from "node-opcua";

import * as  path from "path";

import {
    readCertificate
} from "node-opcua-crypto"

// Create two user credentials to be provided along with server options
const userManager = {
    isValidUser: (userName: string, password: string): boolean => {
        if (userName === "user1" && password === "password1") {
            return true;
        }
        if (userName === "user2" && password === "password2") {
            return true;
        }
        return false;
    }
};

// Function used to construct the file name with the folder path
function constructFilename(filename: string): string {
    return path.join(__dirname, filename);
}

// Provide the server certificate and key generated using the node-opcua-pki module
const server_certificate_file = constructFilename("./certificates/server_selfsigned_cert_2048.pem");
const server_certificate_privatekey_file = constructFilename("./certificates/server_key_2048.pem");

(async function main() {
    try {
        // step 1: Create a server instance with a port number, server certificate and key along
        // with build info options. The server options also contain security policies and messaging
        // mode supported by the server
        const server = new OPCUAServer({
            port: 26543,
            certificateFile: server_certificate_file,
            privateKeyFile: server_certificate_privatekey_file,
            userManager,
            buildInfo: {
                manufacturerName: "MyCompany",
                productName: "MyFirstOPCUAServer",
                softwareVersion: "1.0.0"
            },
            securityPolicies: [
                SecurityPolicy.Basic256Sha256
            ],

            securityModes: [
                MessageSecurityMode.Sign,
                MessageSecurityMode.SignAndEncrypt
            ],
            allowAnonymous: false
        });

        // step 2: Trust the client certificate
        const client_certificate_file = constructFilename("./certificates/client_selfsigned_cert_2048.pem");
        const certificate = readCertificate(client_certificate_file);
        server.serverCertificateManager.trustCertificate(certificate);

        // step 3: Start the server
        await server.start();

        // Read the endpoint url of the server and print it
        const endpointUrl = server.endpoints[0].endpointDescriptions()[0].endpointUrl!;
        console.log(" server is ready on ", endpointUrl);

        // Print to inform users that the server will get terminated on a 'CTRL+C' signal
        console.log("CTRL+C to stop");
    }
    catch (err) {
        console.log("error", err);
        process.exit(-1);
    }
})();