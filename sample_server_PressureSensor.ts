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

        // step 5: Bind the pressure sensor variable to asynchronous timestamped getter
        // The value will get updated each time the client tries to read the value of the pressure sensor
        // Find the pressure sensor variable in the server address space
        const myPressureSensorVariable = addressSpace.findNode(`ns=${nsMachineIM};i=14771`) as UAVariable;

        // Initiate the variable called myDataValue and also increment the value field
        let valueField = 1;
        const myDataValue = new DataValue({
            value: { dataType: DataType.Double, value: valueField + 1 },
            sourceTimestamp: new Date(),
            sourcePicoseconds: 0
        });

        // Options to be passed to bindVariable method is set
        // Here the value is incremented by 1 for each read call from the client
        const options = {
            timestamped_get: function (
                this: UAVariable,
                callback: (err: Error | null, dataValue?: DataValue) => void
            ): void {
                myDataValue.sourceTimestamp = new Date();
                myDataValue.value.value += 1;
                callback(null, myDataValue);
            }
        };

        // Bind the variable to a function which increments its value field
        myPressureSensorVariable.bindVariable(options);

        // step 6: Start the server
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
