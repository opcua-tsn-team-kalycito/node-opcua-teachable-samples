// Import the modules required for to start a server and get it running
import {
    OPCUAServer,
    nodesets,
    StatusCodes,
    UAVariable,
    DataType,
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

        // step 3: Get the server addressSpace and a namespace to add the varaibles
        const addressSpace = server.engine.addressSpace;

        const nsMachineIM = addressSpace.getNamespaceIndex("MachineIM");
        if (nsMachineIM <= 0) { throw new Error("Cannot find namespace MachineIM"); }

        console.log(`Namespace Index for MachineIM is ${nsMachineIM}`)

        // step 4: Initialize the StartMotor and StopMotor method, 'Executable' attribute
        // Find the start and stop method from the address space
        const myStartMethod = addressSpace.findMethod(`ns=${nsMachineIM};i=23811`);
        const myStopMethod = addressSpace.findMethod(`ns=${nsMachineIM};i=17035`);

        // Find the MotorRunningStatus variable from the address space and set its value to 'false'
        const myMotorRunningStatus = addressSpace.findNode(`ns=${nsMachineIM};i=153`) as UAVariable;
        myMotorRunningStatus.setValueFromSource({
            dataType: DataType.Boolean,
            value: false
        });

        // let create some helper lambda to easily read and write motoring running state.
        const isMotorRunning = (): boolean => myMotorRunningStatus.readValue().value.value ? true : false;
        const setMotorRunning = (isRunning: boolean): void =>  myMotorRunningStatus.setValueFromSource({
            dataType: DataType.Boolean,
            value: isRunning
        });

        // step 5: Bind the StartMotor and StopMotor method to perform some functions
        // once the method is called
        // StartMotor function prints the a message to indicate the method is called and changes
        // 'Executable' Attribute of 'StartMotor' method to be 'false' and 'Executable' Attribute 
        // of 'StopMotor' method to be 'true'
        myStartMethod.bindMethod((inputArguments, context, callback) => {
            console.log('Start Method called');
            setMotorRunning(true);
            const callMethodResult = {
                statusCode: StatusCodes.Good,
            };
            callback(null, callMethodResult);
        });

        // StopMotor function prints the a message to indicate the method is called and changes
        // 'Executable' Attribute of 'StartMotor' method to be 'true' and 'Executable' Attribute 
        // of 'StopMotor' method to be 'false'
        myStopMethod.bindMethod((inputArguments, context, callback) => {
            console.log('Stop Method called');
            setMotorRunning(false);
            const callMethodResult = {
                statusCode: StatusCodes.Good,
            };
            callback(null, callMethodResult);
        });

        // let's make sure that the start method cannot be called when motor is already started
        myStartMethod._getExecutableFlag = () => !isMotorRunning();

        // let's make sure that stop method cannot be called when motor is already stopped
        myStopMethod._getExecutableFlag = () => isMotorRunning();


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
