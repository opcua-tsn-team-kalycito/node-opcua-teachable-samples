// Import the modules required for to start a client and get it running
import {
  OPCUAClient,
  MessageSecurityMode,
  SecurityPolicy,
  AttributeIds,
  DataType
} from "node-opcua";

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
    // step 1 : Connect to the server using the endpoint url
    await client.connect(endpointUrl);
    console.log("connected !");

    // step 2 : Request to create a session
    const session = await client.createSession();
    console.log("session created !");

    // step 3 : Browse through the server address space
    const browseResult = await session.browse("RootFolder");

    // Printing the references of the RootFolder
    console.log("references of RootFolder :");
    for (const reference of browseResult.references) {
      console.log("   -> ", reference.browseName.toString());
    }

    // step 4 : Read a variable with string nodeId type
    // Assign the nodeId and the attribute to be read
    const maxAge = 0;
    const nodeToRead = {
      nodeId: "ns=1;s=ReadWriteVariableOne",
      attributeId: AttributeIds.Value
    };

    // Send a request to read the value attribute and print the same
    const dataValue = await session.read(nodeToRead, maxAge);
    console.log(" The value of 'ReadWriteVariableOne' ", dataValue.toString());

    // step 5: Write a value to the variable attribute with string nodeId type
    // Assign the nodeId and the value to be written
    const nodeToWrite = {
      nodeId: "ns=1;s=ReadWriteVariableOne",
      attributeId: AttributeIds.Value,
      value: {
        value: { dataType: DataType.Int32, value: 63 }
      }
    }

    // Send a request to write the value to the value attribute
    await session.write(nodeToWrite);

    // step 6 : Read a variable with Integer nodeId type
    // Assign the nodeId and the attribute to be read
    const maxAge1 = 0;
    const nodeToRead1 = {
      nodeId: "ns=1;i=62541",
      attributeId: AttributeIds.Value
    };

    // Send a request to read the value attribute and print the same
    const dataValue1 = await session.read(nodeToRead1, maxAge1);
    console.log(" The value of 'ReadWriteVariableTwo' ", dataValue1.toString());

    // step 7: Write a value to the variable attribute with integer nodeId type
    // Send a request to write the value to the value attribute
    await session.write({
      nodeId: "ns=1;i=62541",
      attributeId: AttributeIds.Value,
      value: {
        value: { dataType: DataType.Int32, value: 73 }
      }
    });

    // step 8: Close session
    await session.close();

    // step 9: Disconnect from the server
    await client.disconnect();
    console.log("done !");
  } catch (err) {
    console.log("An error has occurred : ", err);
    process.exit(-1);
  }
})();
