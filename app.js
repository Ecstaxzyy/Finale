const ctx = document.getElementById('interestRateChart').getContext('2d');

const labels = [];
const interestRates = [];

// Membuat grafik menggunakan Chart.js untuk suku bunga real-time
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
    const apiURL = 'https://api.exchangerate-api.com/v4/latest/USD'; // Gantilah dengan API suku bunga yang sesuai

    fetch(apiURL)
        .then(response => response.json())
        .then(data => {
            const rate = data.rates.BRL; // Gantilah sesuai dengan data suku bunga yang tersedia di API

            const now = new Date();
            const label = `${now.getHours()}:${now.getMinutes()}`;
            labels.push(label);
            interestRates.push(rate);

            // Update grafik real-time (hanya tampilkan 10 data terakhir)
            if (interestRates.length > 10) {
                labels.shift();
                interestRates.shift();
            }

            interestRateChart.update();
        })
        .catch(error => console.error('Error fetching data:', error));
}

// Fungsi untuk menghitung cicilan pinjaman
document.getElementById('calculateButton').addEventListener('click', function () {
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
fetchInterestRateData(); // Panggil langsung saat halaman dimuat
