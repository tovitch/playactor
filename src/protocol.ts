import { DiscoveryVersion, outgoingDiscoveryKeys } from "./discovery/model";

function formatOutgoingKeys(data?: Record<string, unknown>) {
    let formatted = "";
    if (data) {
        for (const key of Object.keys(data)) {
            if (!outgoingDiscoveryKeys.has(key)) continue;
            formatted += `${key}:${data[key]}\n`;
        }
    }

    return formatted;
}

export function formatDiscoveryMessage({
    data,
    type,
    version,
}: {
    data?: Record<string, unknown>,
    type: string,
    version: DiscoveryVersion,
}) {
    return Buffer.from(`${type} * HTTP/1.1\n${formatOutgoingKeys(data)}device-discovery-protocol-version:${version}\n`);
}

/**
 * Formats a response to a discovery request the way a real device
 * does: the first line is the bare status line (eg: "HTTP/1.1 620
 * Server Standby") with no " * HTTP/1.1" suffix. The official apps
 * silently discard responses formatted like requests, so responses
 * must not go through formatDiscoveryMessage.
 */
export function formatDiscoveryResponse({
    data,
    statusLine,
    version,
}: {
    data?: Record<string, unknown>,
    statusLine: string,
    version: DiscoveryVersion,
}) {
    return Buffer.from(`${statusLine}\n${formatOutgoingKeys(data)}device-discovery-protocol-version:${version}\n`);
}
