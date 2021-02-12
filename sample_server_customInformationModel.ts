// Import the modules required for to start a server and get it running
import {
    OPCUAServer,
    nodesets
} from "node-opcua";

(async function main() {
    try {
        // step 1: Create a server instance with a port number and build info options
        // Custom information model is passed in as an option to be included in the
        // server address space
        const server = new OPCUAServer({
            nodeset_filename: [nodesets.standard_nodeset_file, "MachineIM.xml"],
            port: 26543,
            buildInfo: {
                manufacturerName: "MyCompany",
                productName: "MyFirstOPCUAServer",
                softwareVersion: "1.0.0"
            },
        });

        // step 2: Initialize the server
        await server.initialize();

        // step 3: Let us now check the namespace index of the MachineIM
        const addressSpace = server.engine.addressSpace;

        const nsMachineIM = addressSpace.getNamespaceIndex("MachineIM");
        if (nsMachineIM <= 0) { throw new Error("Cannot find namespace MachineIM"); }

        console.log(`Namespace Index for MachineIM is ${nsMachineIM}`)

        // step 4: Start the server
        await server.start();

        // Read the endpoint url of the server and print it
        const endpointUrl = server.endpoints[0].endpointDescriptions()[0].endpointUrl!;
        console.log(" server is ready on ", endpointUrl);
    }
    catch (err) {
        console.log("error", err);
        process.exit(-1);
    }
})();
