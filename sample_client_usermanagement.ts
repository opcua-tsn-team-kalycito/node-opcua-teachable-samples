// Import the modules required for to start a client and get it running
import {
    OPCUAClient,
    MessageSecurityMode,
    SecurityPolicy,
    UserIdentityInfoUserName,
    UserTokenType,
    AttributeIds
} from "node-opcua";

import chalk from "chalk";

// Set various options like application name, connection strategy
// security mode and policy
const connectionStrategy = {
    initialDelay: 1000,
    maxRetry: 1
};
const options = {
    applicationName: "MyClient",
    connectionStrategy: connectionStrategy,
    securityMode: MessageSecurityMode.None,
    securityPolicy: SecurityPolicy.None,
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
            console.log("Usage: npx ts-node sample_client_usermanagement.ts <username> <password>");
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
