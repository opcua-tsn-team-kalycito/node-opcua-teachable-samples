'use strict'
// Import the modules required for to start a client and get it running
import {
    OPCUAClient,
    MessageSecurityMode,
    SecurityPolicy,
    ClientSession
} from "node-opcua";

import * as readline from 'readline';

let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

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

// Function to disconnect and shutdown the client application 
async function exit(session: ClientSession) {
    // Close session
    await session.close();
    // Disconnect from the server
    await client.disconnect();
    console.log("Done !");
    process.exit(-1);
};

(async function main() {
    try {
        // step 1 : Connect to the server using the endpoint url
        await client.connect(endpointUrl);
        console.log("connected !");

        // step 2 : Request to create a session
        const session = await client.createSession();
        console.log("session created !");

        // Print the information to the users
        console.log("Press Ctrl+C to stop the client");

        // step 3 : Execute either the StartMotor or StopMotor method as per user input
        let answerCommand: string;
        let loop: string;

        // Based on the user input, execute either StartMotor or StopMotor method
        do {
            rl.setPrompt('Is this example useful? [start/stop/exit] ');
            rl.prompt();
            rl.on('line', (userInput) => {
                answerCommand = userInput.toLowerCase();
                switch (answerCommand) {
                    case 'start':
                        console.log('StartMotor method call');
                        const methodStart = [{
                            objectId: "ns=2;i=3902",
                            methodId: "ns=2;i=23811",
                        }];
                        session.call(methodStart, (err, callResults) => {
                            if (!err) {
                                const callResult = callResults[0];
                                console.log(" statusCode = ", callResult.statusCode);
                            }
                        });
                        loop = 'yes';
                        break;
                    case 'stop':
                        console.log('StopMotor method call');
                        const methodStop = [{
                            objectId: "ns=2;i=3902",
                            methodId: "ns=2;i=17035",
                        }];
                        session.call(methodStop, (err, callResults) => {
                            if (!err) {
                                const callResult = callResults[0];
                                console.log(" statusCode = ", callResult.statusCode);
                            }
                        });
                        loop = 'yes';
                        break;
                    case 'exit':
                        loop = 'no';
                        rl.close();
                        exit(session);
                        break;
                    default:
                        console.log('Invalid answer');
                        rl.close();
                        exit(session);
                }
            });
        } while (loop == 'yes')

        //step 4: On the capture of 'CTRL+C', the client disconnects from the server
        process.on("SIGINT", async () => {
            exit(session);
        });
    } catch (err) {
        console.log("An error has occurred : ", err);
        process.exit(-1);
    }
})();
