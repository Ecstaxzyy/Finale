const ctx = document.getElementById('interestRateChart').getContext('2d');
const forecastCtx = document.getElementById('forecastChart').getContext('2d');

const labels = [];
const interestRates = [];

// Membuat grafik menggunakan Chart.js untuk suku bunga
const interestRateChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: labels,
        datasets: [{
            label: 'Suku Bunga (%)',
            data: interestRates,
            borderColor: 'rgba(75, 192, 192, 1)',
            fill: false
        }]
    },
    options: {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'Pergerakan Suku Bunga Real-Time'
            }
        }
    }
});

// Fungsi untuk mengambil data suku bunga real-time dari API
function fetchInterestRateData() {
    const apiURL = 'https://api.exchangerate-api.com/v4/latest/USD';  // Gantilah dengan API suku bunga yang sesuai
    
    fetch(apiURL)
        .then(response => response.json())
        .then(data => {
            const rate = data.rates.BRL;  // Gantilah sesuai dengan data suku bunga yang tersedia di API

            const now = new Date();
            const label = `${now.getHours()}:${now.getMinutes()}`;
            labels.push(label);
            interestRates.push(rate);

            // Update grafik utama (suku bunga real-time)
            if (interestRates.length > 10) {  // Hanya tampilkan 10 data terakhir
                labels.shift();
                interestRates.shift();
            }

            interestRateChart.update();
        })
        .catch(error => console.error('Error fetching data:', error));
}

// Simulasi perhitungan proyeksi suku bunga
function generateProjection(period, scenario) {
    const projections = [];
    const baseRate = interestRates[interestRates.length - 1] || 4.5; // Mengambil suku bunga terakhir (atau default 4.5%)

    // Model proyeksi sederhana
    for (let i = 0; i < period; i++) {
        let projectedRate = baseRate;
        if (scenario === 'optimistic') {
            projectedRate += Math.random() * 0.5; // Kenaikan optimis
        } else if (scenario === 'realistic') {
            projectedRate += Math.random() * 0.3; // Kenaikan realistis
        } else if (scenario === 'pessimistic') {
            projectedRate -= Math.random() * 0.5; // Penurunan pesimis
        }
        projections.push(projectedRate);
    }
    return projections;
}

// Fungsi untuk memperbarui grafik proyeksi
function updateForecastChart(projections) {
    const projectionLabels = [];
    const forecastData = projections;

    // Menambahkan label untuk periode proyeksi
    for (let i = 0; i < projections.length; i++) {
        projectionLabels.push(`Tahun ${i + 1}`);
    }

    // Menghapus grafik sebelumnya jika ada
    if (forecastCtx.chart) {
        forecastCtx.chart.destroy(); // Menghapus grafik lama
    }

    // Membuat grafik baru dengan data proyeksi
    new Chart(forecastCtx, {
        type: 'line',
        data: {
            labels: projectionLabels,
            datasets: [{
                label: 'Proyeksi Suku Bunga (%)',
                data: forecastData,
                borderColor: 'rgba(255, 99, 132, 1)',
                fill: false
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Proyeksi Suku Bunga (5 Tahun Ke Depan)'
                }
            }
        }
    });
}

// Fungsi untuk menangani perhitungan proyeksi berdasarkan input pengguna
document.getElementById('generateProjection').addEventListener('click', function() {
    const period = parseInt(document.getElementById('projectionPeriod').value) || 5; // Default 5 tahun
    const scenario = document.getElementById('scenario').value;

    const projections = generateProjection(period, scenario);
    updateForecastChart(projections);

    // Tampilkan hasil proyeksi
    document.getElementById('projectionDetails').innerText = `Hasil proyeksi suku bunga untuk periode ${period} tahun berdasarkan skenario "${scenario}"`;
});

// Fungsi untuk menghitung cicilan pinjaman
document.getElementById('calculateButton').addEventListener('click', function() {
    const loanAmount = parseFloat(document.getElementById('loanAmount').value);
    const loanTerm = parseInt(document.getElementById('loanTerm').value);
    const interestRate = parseFloat(document.getElementById('interestRate').value) / 100;

    if (!loanAmount || !loanTerm || !interestRate) {
        alert('Harap masukkan semua data!');
        return;
    }

    // Menghitung cicilan bulanan
    const monthlyRate = interestRate / 12;
    const numPayments = loanTerm * 12;
    const monthlyPayment = loanAmount * monthlyRate / (1 - Math.pow(1 + monthlyRate, -numPayments));
    const totalPayment = monthlyPayment * numPayments;

    // Menampilkan hasil perhitungan
    document.getElementById('monthlyPayment').innerText = `Cicilan Bulanan: Rp ${monthlyPayment.toFixed(2)}`;
    document.getElementById('totalPayment').innerText = `Total Pembayaran: Rp ${totalPayment.toFixed(2)}`;
});

// Memperbarui data suku bunga setiap 10 detik
setInterval(fetchInterestRateData, 10000);
fetchInterestRateData();  // Panggil langsung saat halaman dimuat
