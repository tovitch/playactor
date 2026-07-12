import * as chai from "chai";
import chaiSubset from "chai-subset";
import { fake } from "sinon";
import sinonChai from "sinon-chai";

import { MimCredentialRequester } from "../../src/credentials/mim-requester";
import {
    DeviceStatus,
    DeviceType,
    DiscoveryVersions,
    IDiscoveredDevice,
    IDiscoveryMessage,
} from "../../src/discovery/model";
import { MockDiscoveryNetworkFactory } from "../discovery/util";

chai.use(chaiSubset);
chai.use(sinonChai);
chai.should();

const device: IDiscoveredDevice = {
    address: {
        address: "192.168.1.37",
        family: "IPv4",
        port: 987,
    },
    hostRequestPort: 997,
    extras: {},
    discoveryVersion: DiscoveryVersions.PS4,
    systemVersion: "13520001",
    id: "serenity",
    name: "PS4-028",
    status: DeviceStatus.AWAKE,
    type: DeviceType.PS4,
};

const appSender = {
    address: "192.168.1.20",
    family: "IPv4",
    port: 52301,
    size: 0,
};

async function flushMessageLoop() {
    await new Promise(resolve => { setImmediate(resolve); });
    await new Promise(resolve => { setImmediate(resolve); });
}

describe("MimCredentialRequester", () => {
    let netFactory: MockDiscoveryNetworkFactory;
    let requester: MimCredentialRequester;

    beforeEach(() => {
        netFactory = new MockDiscoveryNetworkFactory();
        requester = new MimCredentialRequester(netFactory, {});
    });

    it("responds to SRCH exactly like a real device", async () => {
        const sendBuffer = fake.resolves(undefined);
        netFactory.network.sendBuffer = sendBuffer;

        const promise = requester.requestForDevice(device);
        promise.catch(() => { /* cancelled below */ });

        netFactory.onMessage!({
            type: "SRCH",
            sender: appSender,
        } as unknown as IDiscoveryMessage);
        await flushMessageLoop();

        sendBuffer.should.have.been.calledOnceWith(appSender.address, appSender.port);
        const response: Buffer = sendBuffer.firstCall.args[2];
        response.toString().should.equal(
            "HTTP/1.1 620 Server Standby\n"
            + "host-id:1234567890AB\n"
            + "host-name:PlayActor\n"
            + "host-request-port:997\n"
            + "host-type:PS4\n"
            + "system-version:13520001\n"
            + "device-discovery-protocol-version:00020020\n",
        );
    });

    it("resolves with the credentials received via WAKEUP", async () => {
        const promise = requester.requestForDevice(device);

        netFactory.onMessage!({
            type: "WAKEUP",
            sender: appSender,
            data: { "user-credential": "shiny" },
        } as unknown as IDiscoveryMessage);

        const credentials = await promise;
        credentials.should.containSubset({ "user-credential": "shiny" });
    });
});
