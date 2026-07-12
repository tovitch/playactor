import * as chai from "chai";

import { DiscoveryVersions } from "../src/discovery/model";
import { formatDiscoveryMessage, formatDiscoveryResponse } from "../src/protocol";

chai.should();

describe("formatDiscoveryMessage", () => {
    it("formats requests with the type and protocol marker", () => {
        const message = formatDiscoveryMessage({
            type: "SRCH",
            version: DiscoveryVersions.PS4,
        });

        message.toString().should.equal(
            "SRCH * HTTP/1.1\n"
            + "device-discovery-protocol-version:00020020\n",
        );
    });
});

describe("formatDiscoveryResponse", () => {
    it("formats responses with a bare status line, like a real device", () => {
        const response = formatDiscoveryResponse({
            statusLine: "HTTP/1.1 620 Server Standby",
            version: DiscoveryVersions.PS4,
            data: {
                "host-id": "serenity",
            },
        });

        response.toString().should.equal(
            "HTTP/1.1 620 Server Standby\n"
            + "host-id:serenity\n"
            + "device-discovery-protocol-version:00020020\n",
        );
    });

    it("omits keys that are not part of the discovery protocol", () => {
        const response = formatDiscoveryResponse({
            statusLine: "HTTP/1.1 200 Ok",
            version: DiscoveryVersions.PS4,
            data: {
                "host-id": "serenity",
                kaylee: "shiny",
            },
        });

        response.toString().should.equal(
            "HTTP/1.1 200 Ok\n"
            + "host-id:serenity\n"
            + "device-discovery-protocol-version:00020020\n",
        );
    });
});
