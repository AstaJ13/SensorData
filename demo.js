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

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const sensorRef = database.ref("sensorData");

document.addEventListener("DOMContentLoaded", function () {
    const voltageElement = document.getElementById("voltage");
    const currentElement = document.getElementById("current");
    const airQualityElement = document.getElementById("airQuality");
    const lastUpdatedElement = document.getElementById("lastUpdated");

    let labels = [];
    let voltageData = [];
    let currentData = [];
    let airQualityData = [];
    const maxDataPoints = 10;

    const voltageCurrentCtx = document.getElementById("voltageCurrentChart").getContext("2d");

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
                },
                {
                    label: "Air Quality (PPM)",
                    data: airQualityData,
                    borderColor: "purple",
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

    function updateUI(voltage, current, airQuality) {
        voltageElement.textContent = voltage !== null ? `${voltage} V` : "-- V";
        currentElement.textContent = current !== null ? `${current} A` : "-- A";
        airQualityElement.textContent = airQuality !== null ? `${airQuality} PPM` : "-- PPM";
        lastUpdatedElement.textContent = `Last Updated: ${new Date().toLocaleTimeString()}`;

        if (labels.length >= maxDataPoints) {
            labels.shift();
            voltageData.shift();
            currentData.shift();
            airQualityData.shift();
        }

        labels.push(new Date().toLocaleTimeString());
        voltageData.push(voltage);
        currentData.push(current);
        airQualityData.push(airQuality);

        voltageCurrentChart.update();
    }

    sensorRef.on("value", function (snapshot) {
        if (snapshot.exists()) {
            const data = snapshot.val();
            let voltage = parseFloat(data.voltage) || null;
            let current = parseFloat(data.current) || null;
            let airQuality = parseFloat(data.airQuality) || null;

            updateUI(voltage, current, airQuality);
        } else {
            console.warn("⚠️ No data found in Firebase.");
        }
    }, function (error) {
        console.error("🔥 Firebase read error:", error);
    });
});
