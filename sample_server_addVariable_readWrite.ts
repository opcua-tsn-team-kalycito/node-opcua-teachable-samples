// Import the modules required for to start a server, get it running and adding variables
import {
    OPCUAServer,
    ServerState,
    coerceLocalizedText,
    DataType,
    SessionContext,
    AttributeIds
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
            dataType: "Int32",
            value: {
                dataType: DataType.Double,
                value: 0
            },
            minimumSamplingInterval: 10,
            userAccessLevel: "CurrentRead | CurrentWrite",
            organizedBy: addressSpace.rootFolder.objects
        });
        console.log(myVariable1.nodeId.toString());

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
        console.log(myVariable2.nodeId.toString());

        // step 6: Callback functions called in an interval of 5 seconds to read the 
        // value of variable node with string nodeId
        const timerId1 = setInterval(() => {
            const dataValue1 = myVariable1.readAttribute(SessionContext.defaultContext, AttributeIds.Value);
            console.log("ReadWriteVariableOne value: ", dataValue1.value.value.toString());
        }, 5000);

        // step 7: Callback functions called in an interval of 5 seconds to read the 
        // value of variable node with integer nodeId
        const timerId2 = setInterval(() => {
            const dataValue2 = myVariable2.readAttribute(SessionContext.defaultContext, AttributeIds.Value);
            console.log("ReadWriteVariableTwo value: ", dataValue2.value.value.toString());
        }, 5000);

        // step 8: Callback functions called in an interval of 5 seconds to write the
        // value to variable node with string nodeId. Value is incremented by once for
        // every 5 seconds once
        let t = 0;
        const timerId3 = setInterval(() => {
            const value = t;
            t += 1;
            myVariable1.setValueFromSource({
                dataType: DataType.Int32,
                value
            });
        }, 5000);

        // step 9: Callback functions called in an interval of 5 seconds to write the
        // value to variable node with integer nodeId. Value is incremented by once for
        // every 5 seconds once
        let t1 = 0;
        const timerId4 = setInterval(() => {
            const value = t1;
            t1 += 1;
            myVariable2.setValueFromSource({
                dataType: DataType.Int32,
                value
            });
        }, 5000);

        // step 9: Start the server
        await server.start();

        // Read the endpoint url of the server and print it
        const endpointUrl = server.endpoints[0].endpointDescriptions()[0].endpointUrl!;
        console.log(" server is ready on ", endpointUrl);

        // Print to inform users that the server will get terminated on a 'CTRL+C' signal
        console.log("CTRL+C to stop");

        // step 10: On the capture of 'CTRL+C', the server should shutdown gracefully
        process.on("SIGINT", async () => {
            if (server.engine.serverStatus.state === ServerState.Shutdown) {
                console.log(
                    "Server shutdown already requested... shutdown will happen in ",
                    server.engine.serverStatus.secondsTillShutdown,
                    "second"
                );
                return;
            }

            // Clear all the set interval method callbacks
            clearInterval(timerId1);
            clearInterval(timerId2);
            clearInterval(timerId3);
            clearInterval(timerId4);

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

