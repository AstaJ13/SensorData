// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAdNLlFOlIKreOnWjbMmLR-nRmII_LagLU",
    authDomain: "wirless-sensor-network.firebaseapp.com",
    databaseURL: "https://wirless-sensor-network-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "wirless-sensor-network",
    storageBucket: "wirless-sensor-network.appspot.com",
    messagingSenderId: "186999672140",
    appId: "1:186999672140:web:94af4274408dea2672d3e9",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const sensorRef = database.ref("sensorData");

document.addEventListener("DOMContentLoaded", function () {
    const voltageElement = document.getElementById("voltage");
    const currentElement = document.getElementById("current");
    const powerElement = document.getElementById("power");
    const lastUpdatedElement = document.getElementById("lastUpdated");

    // Chart.js Data Arrays
    let labels = [];
    let voltageData = [];
    let currentData = [];
    let powerData = [];
    const maxDataPoints = 10;

    // Initialize Charts
    const voltageCurrentCtx = document.getElementById("voltageCurrentChart").getContext("2d");
    const powerCtx = document.getElementById("powerChart").getContext("2d");

    const voltageCurrentChart = new Chart(voltageCurrentCtx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Voltage (V)",
                    data: voltageData,
                    borderColor: "red",
                    borderWidth: 2,
                    fill: false
                },
                {
                    label: "Current (A)",
                    data: currentData,
                    borderColor: "blue",
                    borderWidth: 2,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { title: { display: true, text: "Time" } },
                y: { title: { display: true, text: "Value" } }
            }
        }
    });

    const powerChart = new Chart(powerCtx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Power (W)",
                    data: powerData,
                    borderColor: "green",
                    borderWidth: 2,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { title: { display: true, text: "Time" } },
                y: { title: { display: true, text: "W" } }
            }
        }
    });

    // Function to update UI and Graphs
    function updateUI(voltage, current, power) {
        voltageElement.textContent = voltage !== null ? `${voltage} V` : "-- V";
        currentElement.textContent = current !== null ? `${current} A` : "-- A";
        powerElement.textContent = power !== null ? `${power} W` : "-- W";
        lastUpdatedElement.textContent = `Last Updated: ${new Date().toLocaleTimeString()}`;

        // Update Graph Data
        if (labels.length >= maxDataPoints) {
            labels.shift();
            voltageData.shift();
            currentData.shift();
            powerData.shift();
        }

        labels.push(new Date().toLocaleTimeString());
        voltageData.push(voltage);
        currentData.push(current);
        powerData.push(power);

        voltageCurrentChart.update();
        powerChart.update();
    }

    // Listen for data updates
    sensorRef.on("value", function (snapshot) {
        if (snapshot.exists()) {
            let data = snapshot.val();
            console.log("📡 Live Data from Firebase:", data);

            let voltage = null, current = null, power = null;

            if (typeof data === "object") {
                voltage = parseFloat(data.voltage) || null;
                current = parseFloat(data.current) || null;

                // Calculate power as Voltage * Current (if both are available)
                if (voltage !== null && current !== null) {
                    power = voltage * current;
                } else {
                    power = null;
                }
            } else {
                console.warn("⚠️ Invalid sensor data received. Skipping update.");
                return;
            }

            updateUI(voltage, current, power);
        } else {
            console.warn("⚠️ No data found in Firebase.");
        }
    }, function (error) {
        console.error("🔥 Firebase read error:", error);
    });
});
