// Import the modules required for to start a client and get it running
import {
    OPCUAClient,
    MessageSecurityMode,
    SecurityPolicy,
    UserIdentityInfoUserName,
    UserTokenType,
    AttributeIds
} from "node-opcua";

import * as  path from "path";
import chalk from "chalk";

// Function used to construct the file name with the folder path
function constructFilename(filename: string): string {
    return path.join(__dirname, filename);
}

// Provide the client certificate and key generated using the node-opcua-pki module
const client_certificate_file = constructFilename("./certificates/client_selfsigned_cert_2048.pem");
const client_certificate_privatekey_file = constructFilename("./certificates/client_key_2048.pem");

// Set various options like application name, connection strategy
// security mode and policy, client certificate and private key
const connectionStrategy = {
    initialDelay: 1000,
    maxRetry: 1
};
const options = {
    applicationName: "MyClient",
    certificateFile: client_certificate_file,
    privateKeyFile: client_certificate_privatekey_file,
    connectionStrategy: connectionStrategy,
    securityMode: MessageSecurityMode.Sign,
    securityPolicy: SecurityPolicy.Basic256Sha256,
    endpoint_must_exist: false
};

// Create a client instance with the options
const client = OPCUAClient.create(options);

// Set the endpoint url of the server to which the client wants to connect
const endpointUrl = "opc.tcp://localhost:26543";

(async function main() {
    try {
        // step 1: Parse the command line arguments and store the username and password to a variable
        let username: string;
        let password: string;

        // Check if the user has provided all the arguments correctly, if not print the usage and exit
        if (process.argv.length < 4) {
            console.log("Usage: npx ts-node sample_client_encryption.ts <username> <password>");
            process.exit(-1);
        }

        // Assign the username and password to variables
        username = process.argv[2];
        password = process.argv[3];

        // step 2 : Connect to the server using the endpoint url
        await client.connect(endpointUrl);
        console.log("connected !");

        // step 3 : Request to create a session
        const session = await client.createSession({
            userName: username,
            password: password,
            type: UserTokenType.UserName
        } as UserIdentityInfoUserName);
        console.log("session created !");

        // step 4:  Read the current server time and display the same
        const dataValue = await session.read({
            nodeId: "i=2258",
            attributeId: AttributeIds.Value,
        });
        console.log("Current date time:", dataValue.toString());

        // Print the security mode and security policy
        console.log('Security mode:', chalk.green(client.securityMode));
        console.log('Security policy:', chalk.green(client.securityPolicy));

        // step 5: Close the session
        await session.close();

        // step 6: Disconnect the client
        await client.disconnect();
    } catch (err) {
        console.log("An error has occurred : ", err);
        process.exit(-1);
    }
})();
