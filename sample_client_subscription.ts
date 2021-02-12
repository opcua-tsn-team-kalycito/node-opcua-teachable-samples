// Import the modules required for to start a client and get it running
import {
    OPCUAClient,
    MonitoringParametersOptions,
    DataChangeFilter,
    DeadbandType,
    DataChangeTrigger,
    AttributeIds,
    ReadValueIdLike,
    TimestampsToReturn,
    DataValue,
    ClientMonitoredItem,
    MessageSecurityMode,
    SecurityPolicy
} from "node-opcua";

const connectionStrategy = {
    initialDelay: 1000,
    maxRetry: 1
};
// Set various options like application name, connection strategy
// security mode and policy
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
        console.log("Connected !");

        // step 2 : Request to create a session
        const session = await client.createSession();
        console.log("Session created !");

        // step 3: Create a subscription request with a publishing interval of 1 second
        // and maxNotificationsPerPublish as 1000
        const subscription = await session.createSubscription2({
            maxNotificationsPerPublish: 1000,
            publishingEnabled: true,
            requestedLifetimeCount: 100,
            requestedMaxKeepAliveCount: 10,
            requestedPublishingInterval: 1000,
        });

        if (false) {
            subscription.on("raw_notification", (n) => {
                console.log(n.toString());
            });
        }

        // step 4: Create a Monitored item request
        // Set options to create monitored item
        const parameters1: MonitoringParametersOptions = {
            discardOldest: true,
            queueSize: 100,
            samplingInterval: 100,
            filter: new DataChangeFilter({
                deadbandType: DeadbandType.Absolute,
                deadbandValue: 0.1,
                trigger: DataChangeTrigger.StatusValueTimestamp,
            }),
        };

        // Choose the node that needs to be monitored for changes
        // In our case we are going to monitor Temperature sensor variable under Machine-1 object
        const itemToMonitor1: ReadValueIdLike = {
            attributeId: AttributeIds.Value,
            nodeId: "ns=2;i=17421"
        };

        // Send the request to create monitored items
        const item1 = await subscription.monitor(
            itemToMonitor1,
            parameters1,
            TimestampsToReturn.Both
        );

        console.log(" Item1 = ", item1.statusCode.toString());

        // If a data change is detected print the value
        item1.on("changed", (dataValue: DataValue) => {
            console.log(" The temperature sensor value has changed : ", dataValue.toString());
        });

        // detect CTRL+C and close
        let running = true;
        process.on("SIGINT", async () => {
            if (!running) {
                return; // avoid calling shutdown twice
            }
            console.log("shutting down client");
            running = false;

            await item1.terminate();
            await subscription.terminate();

            await session.close();
            await client.disconnect();
            console.log("Done");
        });
    } catch (err) {
        console.log(err);
    }
})();
