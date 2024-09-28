class Onesector {
    constructor(year, countries, X, theta = 4) {
        this.year = year;
        this.countries = countries;
        this.N = countries.length;
        this.theta = theta;
        this.X = X;
        this.Xm = X.reduce((acc, row) => acc.map((sum, i) => sum + row[i]), new Array(this.N).fill(0));
        this.Ym = X.map(row => row.reduce((sum, val) => sum + val, 0));
        this.D = this.Xm.map((val, i) => val - this.Ym[i]);
    }

    static async fromJSON(jsonFilePath, year = 2018, theta = 4) {
        try {
            console.log(`Loading data from ${jsonFilePath}`); // Debug log
            const response = await fetch(jsonFilePath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            // Extract countries from the first row (excluding the first element which is likely empty or a label)
            const countries = Object.keys(data[0]).slice(1);

            // Initialize the trade matrix
            const X = [];

            // Populate the trade matrix
            for (let i = 0; i < data.length; i++) {
                const row = [];
                for (let j = 0; j < countries.length; j++) {
                    row.push(parseFloat(data[i][countries[j]]));
                }
                X.push(row);
            }
        //    console.log('Trade matrix:', X);

            return new Onesector(year, countries, X, theta);
        } catch (error) {
            console.error("Error loading or parsing the JSON file:", error);
            throw error;
        }
    }

    getTrumpTariff(tariffOthers, tariffChina) {
        const N = this.N;
        const tauhat = Array(N).fill().map(() => Array(N).fill(1));
        
        const usIndex = this.countries.indexOf('USA');
        const chinaIndex = this.countries.indexOf('CHN');
        
        if (usIndex === -1) {
            console.error("United States not found in the list of countries");
            return tauhat;
        }
        
        for (let i = 0; i < N; i++) {
            if (i === usIndex) continue; // Skip if exporter is US
            
            if (i === chinaIndex) {
                tauhat[i][usIndex] = tariffChina;
            } else {
                tauhat[i][usIndex] = tariffOthers;
            }
        }
        
        //console.log("I will output the export value from the US to China, and then the export value from China to the US")
        //console.log(this.X[usIndex][chinaIndex])
        //console.log(this.X[chinaIndex][usIndex])

        return tauhat;
    }

    exacthatalgebra(tauhat, D1 = null, scenario = "") {
        // console.log('Starting exacthatalgebra calculation'); // Debug log
        // console.log('tauhat:', tauhat); // Debug log
        const start = performance.now(); // Measuring time performance
        const N = this.N;
        let psi = 1;
        const tol = 0.0000001;

        // Calculate pi (import share)
        const pi = this.X.map(row => row.map((val, j) => val / this.Xm[j]));
        //let pi = Array(N).fill().map(() => Array(N).fill(0));
        //for (let PR = 0; PR < N; PR++) {
        //    for (let DE = 0; DE < N; DE++) {
        //        pi[PR][DE] = this.X[PR][DE] / this.Xm[DE];
        //    }
        //}

        // If D1 is not set, keep it the same
        if (D1 === null) {
            D1 = [...this.D];
        }

        // Initial guess for what (changes in wages)
        const usIndex = model.countries.indexOf('USA');
        const chinaIndex = model.countries.indexOf('CHN');
        let what = new Array(N).fill(1);
        what[usIndex] = 0.95
        what[chinaIndex] = 0.99

        let wgdp = this.Ym.reduce((sum, val) => sum + val, 0);
        let wgdp1 = what.reduce((sum, val, i) => sum + val * this.Ym[i], 0);
        what = what.map(w => w / wgdp1 * wgdp);

        let pihat = Array(N).fill().map(() => Array(N).fill(0));
        let Phat = new Array(N).fill(0);
        let Xm1 = new Array(N).fill(0);

        let dif = 1;
        let difOld = Infinity; // Initialize prevDif to a large number
        while (dif > tol) {
            // Calculate price changes
            let phat = Array(N).fill().map(() => Array(N).fill(0));
            Phat = new Array(N).fill(0);
            for (let OR = 0; OR < N; OR++) {
                for (let DE = 0; DE < N; DE++) {
                    phat[OR][DE] = what[OR] * tauhat[OR][DE];
                    Phat[DE] += pi[OR][DE] * Math.pow(phat[OR][DE], -this.theta);
                }
            }
            Phat = Phat.map(p => Math.pow(p, -1 / this.theta));

            // Calculate pihat
            for (let OR = 0; OR < N; OR++) {
                for (let DE = 0; DE < N; DE++) {
                    pihat[OR][DE] = Math.pow(phat[OR][DE], -this.theta) / Math.pow(Phat[DE], -this.theta);
                }
            }

            // Update absorption and supply (value)
            let wLS1 = what.map((w, i) => w * this.Ym[i]);
            Xm1 = wLS1.map((w, i) => w + D1[i]);

            // Calculate factor demand
            let wLD1 = new Array(N).fill(0);
            for (let OR = 0; OR < N; OR++) {
                for (let DE = 0; DE < N; DE++) {
                    wLD1[OR] += pi[OR][DE] * pihat[OR][DE] * Xm1[DE];
                }
            }

            // Calculate excess labor demand and update what
            let ZL = wLD1.map((ld, i) => (ld - wLS1[i]) / what[i]);
            what = what.map((w, i) => w * (1 + psi * ZL[i] / wLS1[i]));

            // Normalize changes in wages
            wgdp1 = what.reduce((sum, w, i) => sum + w * this.Ym[i], 0);
            what = what.map(w => w / wgdp1 * wgdp);

            difOld = dif;
            dif = Math.max(...ZL.map(Math.abs));
            console.log(dif)

            if (difOld < dif) {
                psi = 0.3;
            }
        }

        // Calculate new trade flow
        let X1 = Array(N).fill().map(() => Array(N).fill(0));
        for (let OR = 0; OR < N; OR++) {
            for (let DE = 0; DE < N; DE++) {
                X1[OR][DE] = pi[OR][DE] * pihat[OR][DE] * Xm1[DE];
            }
        }


        let rwhat = what.map((w, i) => w / Phat[i]);
        let rexphat = Xm1.map((x, i) => x / this.Xm[i] / Phat[i]);

        // console.log('Calculation complete. Result:', rexphat); // Debug log
        // const end = performance.now();
        // const executionTime = end - start;
        // console.log(`Execution time: ${executionTime} milliseconds`);
    return rexphat;
    }
}

// In your main script
Onesector.fromJSON('trademat.json')
    .then(loadedModel => {
        model = loadedModel;
        console.log("Model loaded:", model);
        
        // Example usage of getTrumpTariff
        const tariffOthers = 1.6; // 10% tariff on other countries
        const tariffChina = 1.6; // 25% tariff on China
        const trumpTariff = model.getTrumpTariff(tariffOthers, tariffChina);
        //console.log("Trump Tariff matrix:", trumpTariff);

        // You can now use this trumpTariff in your exacthatalgebra method
        const result = model.exacthatalgebra(trumpTariff);
        //console.log("Result of exacthatalgebra with Trump Tariff:", result);
        const usIndex = model.countries.indexOf('USA');
        const chinaIndex = model.countries.indexOf('CHN');
        //console.log(result[usIndex])
        //console.log(result[chinaIndex])
    })
    .catch(error => console.error("Failed to load model:", error));