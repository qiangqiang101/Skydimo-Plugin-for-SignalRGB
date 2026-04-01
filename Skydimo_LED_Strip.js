import serial from "@SignalRGB/serial";
export function Name() { return "Skydimo LED Strip"; }
export function VendorId() { return 0x1A86; }
export function ProductId() { return [0x7523]; }
export function Publisher() { return "I'm Not MentaL"; }
export function Documentation() { return "troubleshooting/skydimo"; }
export function Type() { return "serial"; }
export function DeviceType() { return "lightingcontroller"; }
export function ImageUrl() { return "https://assets.signalrgb.com/devices/brands/phanteks/led-strips/led-strip.png"; }
/* global
shutdownColor:readonly
LightingMode:readonly
forcedColor:readonly
*/
export function ControllableParameters() {
    return [
        { property: "shutdownColor", group: "lighting", label: "Shutdown Color", description: "This color is applied to the device when the System, or SignalRGB is shutting down", min: "0", max: "360", type: "color", default: "#000000" },
        { property: "LightingMode", group: "lighting", label: "Lighting Mode", description: "Determines where the device's RGB comes from. Canvas will pull from the active Effect, while Forced will override it to a specific color", type: "combobox", values: ["Canvas", "Forced"], default: "Canvas" },
        { property: "forcedColor", group: "lighting", label: "Forced Color", description: "The color used when 'Forced' Lighting Mode is enabled", min: "0", max: "360", type: "color", default: "#009bde" },
    ];
}

let skydimoPortName = null;
let skydimoModel = null;
let skydimoInfoRead = false;

const deviceConfig = {
    // 2-zone models
    "SK0201": { vLedPositions: [], vLedNames: [], size: [0, 0] },
    "SK0202": { vLedPositions: [], vLedNames: [], size: [0, 0] },
    "SK0204": { vLedPositions: [], vLedNames: [], size: [0, 0] },
    "SK0F01": { vLedPositions: [], vLedNames: [], size: [0, 0] },
    "SK0F02": { vLedPositions: [], vLedNames: [], size: [0, 0] },

    // 3-zone models
    "SK0121": { vLedPositions: [], vLedNames: [], size: [0, 0] },
    "SK0124": { vLedPositions: [], vLedNames: [], size: [0, 0] },
    "SK0127": { vLedPositions: [], vLedNames: [], size: [0, 0] },
    "SK0132": { vLedPositions: [], vLedNames: [], size: [0, 0] },
    "SK0134": { vLedPositions: [], vLedNames: [], size: [0, 0] },
    "SK0149": { vLedPositions: [], vLedNames: [], size: [0, 0] },

    // 4-zone models
    "SK0L21": { vLedPositions: [], vLedNames: [], size: [0, 0] },
    "SK0L24": { vLedPositions: [], vLedNames: [], size: [0, 0] },
    "SK0L27": {
        vLedPositions: [
            [0, 17], [0, 16], [0, 15], [0, 14], [0, 13], [0, 12], [0, 11], [0, 10], [0, 9], [0, 8], [0, 7], [0, 6], [0, 5], [0, 4], [0, 3], [0, 2], [0, 1], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [8, 0], [9, 0], [10, 0],
            [11, 0], [12, 0], [13, 0], [14, 0], [15, 0], [16, 0], [17, 0], [18, 0], [19, 0], [20, 0], [21, 0], [22, 0], [23, 0], [24, 0], [25, 0], [26, 0], [27, 0], [28, 0], [29, 0], [30, 0], [31, 0], [32, 1], [32, 2], [32, 3],
            [32, 4], [32, 5], [32, 6], [32, 7], [32, 8], [32, 9], [32, 10], [32, 11], [32, 12], [32, 13], [32, 14], [32, 15], [32, 16], [32, 17], [31, 18], [30, 18], [29, 18], [28, 18], [27, 18], [26, 18], [25, 18], [24, 18],
            [23, 18], [22, 18], [21, 18], [20, 18], [19, 18], [18, 18], [17, 18], [16, 18], [15, 18], [14, 18], [13, 18], [12, 18], [11, 18], [10, 18], [9, 18], [8, 18], [7, 18], [6, 18], [5, 18], [4, 18], [3, 18], [2, 18], [1, 18]
        ],
        vLedNames: [
            "Led1", "Led2", "Led3", "Led4", "Led5", "Led6", "Led7", "Led8", "Led9", "Led10", "Led11", "Led12", "Led13", "Led14", "Led15", "Led16", "Led17", "Led18", "Led19", "Led20", "Led21", "Led22", "Led23",
            "Led24", "Led25", "Led26", "Led27", "Led28", "Led29", "Led30", "Led31", "Led32", "Led33", "Led34", "Led35", "Led36", "Led37", "Led38", "Led39", "Led40", "Led41", "Led42", "Led43", "Led44", "Led45",
            "Led46", "Led47", "Led48", "Led49", "Led50", "Led51", "Led52", "Led53", "Led54", "Led55", "Led56", "Led57", "Led58", "Led59", "Led60", "Led61", "Led62", "Led63", "Led64", "Led65", "Led66", "Led67",
            "Led68", "Led69", "Led70", "Led71", "Led72", "Led73", "Led74", "Led75", "Led76", "Led77", "Led78", "Led79", "Led80", "Led81", "Led82", "Led83", "Led84", "Led85", "Led86", "Led87", "Led88", "Led89",
            "Led90", "Led91", "Led92", "Led93", "Led94", "Led95", "Led96"
        ],
        size: [33, 19]
    },
    "SK0L32": { vLedPositions: [], vLedNames: [], size: [0, 0] },
    "SK0L34": { vLedPositions: [], vLedNames: [], size: [0, 0] },

    // SKA series
    "SKA124": { vLedPositions: [], vLedNames: [], size: [0, 0] },
    "SKA127": { vLedPositions: [], vLedNames: [], size: [0, 0] },
    "SKA132": { vLedPositions: [], vLedNames: [], size: [0, 0] },
    "SKA134": { vLedPositions: [], vLedNames: [], size: [0, 0] },

    // Single-zone LED strip models
    "SK0402": { vLedPositions: [], vLedNames: [], size: [0, 0] },
    "SK0403": { vLedPositions: [], vLedNames: [], size: [0, 0] },
    "SK0404": { vLedPositions: [], vLedNames: [], size: [0, 0] },
    "SK0901": { vLedPositions: [], vLedNames: [], size: [0, 0] },
    "SK0801": { vLedPositions: [], vLedNames: [], size: [0, 0] },
    "SK0803": { vLedPositions: [], vLedNames: [], size: [0, 0] },
    "SK0E01": { vLedPositions: [], vLedNames: [], size: [0, 0] },
    "SK0H01": { vLedPositions: [], vLedNames: [], size: [0, 0] },
    "SK0H02": { vLedPositions: [], vLedNames: [], size: [0, 0] },
    "SK0S01": { vLedPositions: [], vLedNames: [], size: [0, 0] },
    "SK0J01": { vLedPositions: [], vLedNames: [], size: [0, 0] },
    "SK0K01": { vLedPositions: [], vLedNames: [], size: [0, 0] },
    "SK0K02": { vLedPositions: [], vLedNames: [], size: [0, 0] },
    "SK0M01": { vLedPositions: [], vLedNames: [], size: [0, 0] },
    "SK0N01": { vLedPositions: [], vLedNames: [], size: [0, 0] },
    "SK0N02": { vLedPositions: [], vLedNames: [], size: [0, 0] },
    "SK0N03": { vLedPositions: [], vLedNames: [], size: [0, 0] }
}

export function LedNames() {
    if (skydimoModel && deviceConfig[skydimoModel]) {
        return deviceConfig[skydimoModel].vLedNames;
    } else {
        return ["Led"];
    }
}
export function LedPositions() {
    if (skydimoModel && deviceConfig[skydimoModel]) {
        return deviceConfig[skydimoModel].vLedPositions;
    } else {
        return [[0,0]];
    }
}
export function Size() {
    if (skydimoModel && deviceConfig[skydimoModel]) {
        return deviceConfig[skydimoModel].size;
    } else {
        return [1, 1];
    }
}

// init serial connection
export function Initialize() {
    const ports = serial.availablePorts();
    if (!ports.length) {
        console.log("No serial ports detected.");
        return;
    }

    skydimoPortName = ports.find(p =>
        p.vendorId === 0x1A86 && p.productId === 0x7523
    )?.portName;

    if (!skydimoPortName) {
        console.log("Skydimo device not found.");
        return;
    }

    // attempt to connect to Skydimo
    connectToSkydimo();
}

// renders colors
export function Render() {
    // automatic reconnect if disconnected
    if (!serial.isConnected()) {
        console.log("Serial port not connected, attempting reconnect...");
        connectToSkydimo();
    }

    sendColors();
}

// shut down colors
export function Shutdown(SystemSuspending) {
    if (!skydimoPortName) return;

    const color = SystemSuspending ? "#000000" : shutdownColor;
    sendColors(color);

    disconnect();
}

function connectToSkydimo() {
    if (!skydimoPortName) return false;

    if (serial.isConnected()) return true;

    const connected = serial.connect({
        portName: skydimoPortName,
        baudRate: 115200,
        parity: "None",
        dataBits: 8,
        stopBits: "One"
    });

    if (!connected) {
        console.log("Failed to connect to Skydimo.");
        return false;
    }

    console.log("Connected to Skydimo on port", skydimoPortName);
    const info = serial.getDeviceInfo(skydimoPortName);
    console.log("Device Info:", info);

    skydimoInfoRead = getDeviceInfo();

    return true;
}

function disconnect() {
    if (serial.isConnected()) {
        serial.disconnect();
        console.log("Disconnected from serial port");
    }
}

// grabs colors and sends
function sendColors(overrideColor) {
    if (!skydimoPortName) return;
    if (!serial.isConnected()) {
        console.warn("Serial port not connected, skipping color write");
        return;
    }
    if (!skydimoInfoRead) return;

    const count = deviceConfig[skydimoModel].vLedPositions.length;
    const RGBData = [];

    for (let i = 0; i < count; i++) {
        const [x, y] = deviceConfig[skydimoModel].vLedPositions[i];
        let color;

        if (overrideColor) {
            color = hexToRgb(shutdownColor);
        } else if (LightingMode === "Forced") {
            color = hexToRgb(forcedColor);
        } else {
            color = device.color(x, y);
        }

        // Skydimo expects RGB order
        RGBData.push(color[0]); // R
        RGBData.push(color[1]); // G
        RGBData.push(color[2]); // B
    }

    // Build Adalight header: "Ada" + 0x00 + count (2 bytes)
    const header = [
        0x41, 0x64, 0x61, 0x00,
        (count >> 8) & 0xFF,
        count & 0xFF
    ];

    const packet = [...header, ...RGBData];
    const success = serial.write(packet);

    if (!success) console.error("Failed to write LED colors");
}

// Convert hex string to RGB array
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ];
}

function getDeviceInfo() {
    if (!skydimoPortName || !serial.isConnected()) {
        return false;
    }

    // Send query command "Moni-A"
    const cmd = "Moni-A";
    const bytes = Array.from(cmd).map(c => c.charCodeAt(0));
    serial.write(bytes);

    // Wait briefly for response (100ms)
    device.pause(1000);

    // Read response (up to 64 bytes)
    const buf = serial.read(64, 1000);
    if (!buf || buf.length === 0) {
        console.log("No response from Skydimo device.");
        return false;
    }

    // Convert byte array to string
    const response = String.fromCharCode(...buf);
    device.log("Raw response:", response);

    // Parse "Model,Serial"
    const commaPos = response.indexOf(",");
    if (commaPos !== -1) {
        const model = response.substring(0, commaPos).trim();
        const serialRaw = response.substring(commaPos + 1).trim();
        let device_name = 'Skydimo';
        let device_serial = '000000';

        if (model) {
            device_name = "Skydimo " + model;
            skydimoModel = model;

            const devConfig = deviceConfig[model];
            if (!devConfig) {
                device.log(`No configuration found for model: ${model}, please contact SignalRGB support.`);
            } else {
                device.setName(device_name);
                device.setSize(devConfig.size);
                device.setControllableLeds(devConfig.vLedNames, devConfig.vLedPositions);
                device.setFrameRateTarget(60);
                device.log("Device Name:", device_name);
            }
        }

        if (serialRaw) {
            // Convert serial to hex string
            device_serial = Array.from(serialRaw)
                .map(ch => ch.charCodeAt(0).toString(16).padStart(2, "0").toUpperCase())
                .join("");
            device.log("Device Serial:", device_serial);
        }

        return true;
    }

    return false;
}