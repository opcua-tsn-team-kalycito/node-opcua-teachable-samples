// Import the modules required for to start a server and get it running
import {
    OPCUAServer,
    ServerState,
    coerceLocalizedText,
    nodesets,
    coerceNodeId,
    UAVariable,
    DataValue,
    DataType,
    SessionContext,
    AttributeIds
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

        // step 4: Get the server addressSpace and a namespace to add the varaibles
        const addressSpace = server.engine.addressSpace;

        const nsMachineIM = addressSpace.getNamespaceIndex("MachineIM");
        if (nsMachineIM <= 0) { throw new Error("Cannot find namespace MachineIM"); }

        console.log(`Namespace Index for MachineIM is ${nsMachineIM}`)

        // step 5: Bind the temperature sensor variable to asynchronous timestamped getter
        // The value will get updated each time the client tries to read the value of the temperature sensor
        // Find the temperature sensor variable in the server address space
        const myTemperatureSensorVariable = addressSpace.findNode(`ns=${nsMachineIM};i=17421`) as UAVariable;

        // Here the value is incremented by 1 for every 5 seconds
        let t1 = 0;
        const timerId1 = setInterval(() => {
            const value = t1;
            t1 += 1;
            myTemperatureSensorVariable.setValueFromSource({
                dataType: DataType.Int32,
                value
            });
        }, 5000);

        // step 6: Start the server
        await server.start();

        // Read the endpoint url of the server and print it
        const endpointUrl = server.endpoints[0].endpointDescriptions()[0].endpointUrl!;
        console.log(" server is ready on ", endpointUrl);

        // Print to inform users that the server will get terminated on a 'CTRL+C' signal
        console.log("CTRL+C to stop");

        //step 7: On the capture of 'CTRL+C', the server should shutdown gracefully
        process.on("SIGINT", async () => {
            if (server.engine.serverStatus.state === ServerState.Shutdown) {
                console.log(
                    "Server shutdown already requested... shutdown will happen in ",
                    server.engine.serverStatus.secondsTillShutdown,
                    "second"
                );
                return;
            }
            // Clear the set interval method callback
            clearInterval(timerId1);

            console.log(" Received server interruption from user ");
            console.log(" shutting down ...");
            server.engine.serverStatus.shutdownReason = coerceLocalizedText("Shutdown by administrator");
            // To exit cleanly, use a timeout interval of 10s
            server.shutdown(10000, () => {
                console.log(" shutting down completed ");
                console.log(" done ");
                process.exit(0);
            });
        });
    }
    catch (err) {
        console.log("error", err);
        process.exit(-1);
    }
})();
