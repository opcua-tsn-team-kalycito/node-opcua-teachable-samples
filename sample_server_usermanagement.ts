// Import the modules required for to start a server and get it running
import {
    OPCUAServer
} from "node-opcua";

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

(async function main() {
    try {
        // Step 1: Create a server instance with a port number and build info options
        const server = new OPCUAServer({
            port: 26543,
            userManager,
            buildInfo: {
                manufacturerName: "MyCompany",
                productName: "MyFirstOPCUAServer",
                softwareVersion: "1.0.0"
            },
            allowAnonymous: false
        });

        // Step 2: Start the server
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