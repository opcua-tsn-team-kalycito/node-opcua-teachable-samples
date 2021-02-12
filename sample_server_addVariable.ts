// Import the modules required for to start a server, get it running and adding variables
import {
    OPCUAServer,
    DataType
} from "node-opcua";

(async function main() {
    try {
        // step 1: Create a server instance with a port number and build info options
        const server = new OPCUAServer({
            port: 26543,
            buildInfo: {
                manufacturerName: "MyCompany",
                productName: "MyFirstOPCUAServer",
                softwareVersion: "1.0.0"
            },
        });

        // step 2: Initialize the server
        await server.initialize();

        // step 3: Get the server addressSpace and a namespace to add the varaibles
        const addressSpace = server.engine.addressSpace;
        const namespace = addressSpace.getOwnNamespace();

        // step 4: Add 'ReadWriteVariableOne' with a string nodeId
        // Add the variable node to the address space by setting various attribute values
        // like nodeId, accesslevel, browsename, description, datatype, value,
        // minimumsamplinginterval and useraccesslevel. Reference values is also set
        const myVariable1 = namespace.addVariable({
            nodeId: "s=ReadWriteVariableOne",
            accessLevel: "CurrentRead | CurrentWrite",
            browseName: "ReadWriteVariableOne",
            description: "A variable that has nodeId of String type",
            dataType: DataType.Int32,
            value: {
                dataType: DataType.Int32,
                value: 0
            },
            minimumSamplingInterval: 100,
            userAccessLevel: "CurrentRead | CurrentWrite",
            organizedBy: addressSpace.rootFolder.objects
        });
        console.log("nodeId1 = ", myVariable1.nodeId.toString());

        // step 5: Add 'ReadWriteVariableTwo' with a numeric nodeId
        // Add the variable node to the address space by setting various attribute values
        // like nodeId, accesslevel, browsename, description, datatype, value,
        // minimumsamplinginterval and useraccesslevel. Reference values is also set
        const myVariable2 = namespace.addVariable({
            nodeId: "i=62541",
            accessLevel: "CurrentRead | CurrentWrite",
            browseName: "ReadWriteVariableTwo",
            description: "A variable that has nodeId of Int type",
            dataType: "Int32",
            value: {
                dataType: DataType.Int32,
                value: 0
            },
            minimumSamplingInterval: 10,
            userAccessLevel: "CurrentRead | CurrentWrite",
            organizedBy: addressSpace.rootFolder.objects
        });
        console.log("nodeId2 = ", myVariable2.nodeId.toString());

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
