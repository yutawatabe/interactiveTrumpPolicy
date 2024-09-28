// Import necessary D3 modules
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

let model;
let map;
let colorScale;
let countryMapping;

// Create a mapping between ISO codes and D3 country identifiers
function createCountryMapping(geoJsonData) {
    const mapping = {};
    const reverseMapping = {};

    // Common name differences between ISO and D3 data
    const nameMapping = {
        "United States of America": "USA",
        "United Kingdom": "GBR",
        "Korea, Republic of": "KOR",
        "Korea, Democratic People's Republic of": "PRK",
        "Taiwan, Province of China": "TWN",
        "Vietnam": "VNM2",
        "Russian Federation": "RUS",
        "Iran, Islamic Republic of": "IRN",
        "Bolivia, Plurinational State of": "BOL",
        "Venezuela, Bolivarian Republic of": "VEN",
        "Tanzania, United Republic of": "TZA",
        "Congo, Democratic Republic of the": "COD",
        "Congo": "COG",
        "Syrian Arab Republic": "SYR",
        "Lao People's Democratic Republic": "LAO",
        "Moldova, Republic of": "MDA",
        "Brunei Darussalam": "BRN",
        "Cabo Verde": "CPV",
        "Côte d'Ivoire": "CIV",
        "Czechia": "CZE",
        "Eswatini": "SWZ",
        "Falkland Islands (Malvinas)": "FLK",
        "Faroe Islands": "FRO",
        "French Southern Territories": "ATF",
        "Holy See": "VAT",
        "Hong Kong": "HKG",
        "Macao": "MAC",
        "North Macedonia": "MKD",
        "Palestine, State of": "PSE",
        "Pitcairn": "PCN",
        "Réunion": "REU",
        "Saint Helena, Ascension and Tristan da Cunha": "SHN",
        "Saint Martin (French part)": "MAF",
        "Sint Maarten (Dutch part)": "SXM",
        "South Georgia and the South Sandwich Islands": "SGS",
        "Svalbard and Jan Mayen": "SJM",
        "Timor-Leste": "TLS",
        "Türkiye": "TUR",
        "Virgin Islands (British)": "VGB",
        "Virgin Islands (U.S.)": "VIR",
        "Western Sahara": "ESH",
        "Åland Islands": "ALA",
        "Bosnia and Herzegovina": "BIH",
        "Burkina Faso": "BFA",
        "Curaçao": "CUW",
        "French Guiana": "GUF",
        "French Polynesia": "PYF",
        "Guadeloupe": "GLP",
        "Guinea-Bissau": "GNB",
        "Martinique": "MTQ",
        "Mayotte": "MYT",
        "Netherlands Antilles": "ANT",
        "New Caledonia": "NCL",
        "Niger": "NER",
        "Norfolk Island": "NFK",
        "Saint Barthélemy": "BLM",
        "Saint Kitts and Nevis": "KNA",
        "Saint Lucia": "LCA",
        "Saint Pierre and Miquelon": "SPM",
        "Saint Vincent and the Grenadines": "VCT",
        "Sao Tome and Principe": "STP",
        "Sierra Leone": "SLE",
        "Sri Lanka": "LKA",
        "Wallis and Futuna": "WLF",
        "Fiji": "FJI",
        "Tanzania": "TZA",
        "W. Sahara": "ESH",
        "United States of America": "USA",
        "Papua New Guinea": "PNG",
        "Chile": "CHL",
        "Dem. Rep. Congo": "COD",
        "Somalia": "SOM",
        "Sudan": "SDN",
        "Chad": "TCD",
        "Haiti": "HTI",
        "Bahamas": "BHS",
        "Falkland Is.": "FLK",
        "Greenland": "GRL",
        "Fr. S. Antarctic Lands": "ATF",
        "Timor-Leste": "TLS",
        "South Africa": "ZAF2",
        "Lesotho": "LSO",
        "Uruguay": "URY",
        "Panama": "PAN",
        "Costa Rica": "CRI",
        "Honduras": "HND",
        "El Salvador": "SLV",
        "Guatemala": "GTM",
        "Belize": "BLZ",
        "Venezuela": "VEN",
        "Guyana": "GUY",
        "Puerto Rico": "PRI",
        "Cuba": "CUB",
        "Zimbabwe": "ZWE",
        "Botswana": "BWA",
        "Namibia": "NAM",
        "Mali": "MLI",
        "Mauritania": "MRT",
        "Nigeria": "NGA",
        "Cameroon": "CMR",
        "Togo": "TGO",
        "Benin": "BEN",
        "Niger": "NER",
        "Côte d'Ivoire": "CIV",
        "Guinea": "GIN",
        "Liberia": "LBR",
        "Sierra Leone": "SLE",
        "Burkina Faso": "BFA",
        "Central African Rep.": "CAF",
        "Congo": "COG",
        "Gabon": "GAB",
        "Eq. Guinea": "GNQ",
        "Zambia": "ZMB",
        "Malawi": "MWI",
        "Mozambique": "MOZ",
        "eSwatini": "SWZ",
        "Angola": "AGO",
        "Burundi": "BDI",
        "Lebanon": "LBN",
        "Madagascar": "MDG",
        "Palestine": "PSE",
        "Gambia": "GMB",
        "Algeria": "DZA",
        "Jordan": "JOR",
        "United Arab Emirates": "ARE",
        "Kuwait": "KWT",
        "Iraq": "IRQ",
        "Oman": "OMN",
        "Vanuatu": "VUT",
        "Cambodia": "KHM",
        "Myanmar": "MMR",
        "Vietnam": "VNM",
        "North Korea": "PRK",
        "South Korea": "KOR",
        "Mongolia": "MNG",
        "Bangladesh": "BGR",
        "Bhutan": "BTN",
        "Nepal": "NPL",
        "Pakistan": "PAK2",
        "Tajikistan": "TJK",
        "Kyrgyzstan": "KGZ",
        "Turkmenistan": "TKM",
        "Iran": "IRN",
        "Syria": "SYR",
        "Armenia": "ARM",
        "Sweden": "SWE",
        "Belarus": "BLR",
        "Ukraine": "UKR",
        "Poland": "POL",
        "Austria": "AUT",
        "Hungary": "HUN",
        "Moldova": "MDA",
        "Romania": "ROU",
        "Lithuania": "LTU",
        "Latvia": "LVA",
        "Estonia": "EST",
        "Germany": "DEU2",
        "Bulgaria": "BGR",
        "Greece": "GRC",
        "Turkey": "TUR",
        "Albania": "ALB",
        "Croatia": "HRV",
        "Switzerland": "CHE",
        "Luxembourg": "LUX",
        "Belgium": "BEL2",
        "Netherlands": "NLD",
        "Portugal": "PRT",
        "Spain": "ESP",
        "Ireland": "IRL",
        "New Caledonia": "NCL",
        "Solomon Is.": "SLB",
        "New Zealand": "NZL",
        "Australia": "AUS",
        "Sri Lanka": "LKA",
        "China": "CHN",
        "Taiwan": "TWN",
        "Italy": "ITA",
        "Denmark": "DNK",
        "United Kingdom": "GBR",
        "Iceland": "ISL",
        "Azerbaijan": "AZE",
        "Georgia": "GEO",
        "Philippines": "PHL",
        "Malaysia": "MYS",
        "Brunei": "BRN",
        "Slovenia": "SVN",
        "Finland": "FIN",
        "Slovakia": "SVK",
        "Czech Rep.": "CZE",
        "Eritrea": "ERI",
        "Japan": "JPN",
        "Paraguay": "PRY",
        "Yemen": "YEM2",
        "Saudi Arabia": "SAU",
        "Antarctica": "ATA",
        "N. Cyprus": "CYP",
        "Cyprus": "CYP",
        "Morocco": "MAR",
        "Egypt": "EGY",
        "Libya": "LBY",
        "Ethiopia": "ETH2",
        "Djibouti": "DJI",
        "Somaliland": "SOM",
        "Uganda": "UGA",
        "Rwanda": "RWA",
        "Bosnia and Herz.": "BIH",
        "North Macedonia": "MKD",
        "Serbia": "SRB",
        "Montenegro": "MNE",
        "Kosovo": "XKX",
        "Trinidad and Tobago": "TTO",
        "S. Sudan": "SSD",
        "Argentina": "ARG",
        "Afghanistan": "AFG",
        "Bolivia": "BOL",
        "Brazil": "BRA",
        "Canada": "CAN",
        "Colombia": "COL",
        "Dominican Rep.": "DOM",
        "Ecuador": "ECU",
        "France": "FRA",
        "Ghana": "GHA",
        "India": "IND",
        "Indonesia": "IDN",
        "Israel": "ISR",
        "Jamaica": "JAM",
        "Kazakhstan": "KAZ",
        "Kenya": "KEN",
        "Laos": "LAO",
        "Macedonia": "MKD",
        "Mexico": "MEX",
        "Nicaragua": "NIC",
        "Norway": "NOR",
        "Peru": "PER",
        "Qatar": "QAT",
        "Russia": "RUS",
        "Senegal": "SEN",
        "Suriname": "SUR",
        "Thailand": "THA",
        "Tunisia": "TUN",
        "Uzbekistan": "UZB",
    };

    geoJsonData.objects.countries.geometries.forEach(country => {
        const name = country.properties.name;
        const id = country.id;

        // Get ISO code from the mapping
        const isoCode = nameMapping[name] || name;

        mapping[isoCode] = id;
        reverseMapping[id] = isoCode;
    });

    return { isoToD3: mapping, d3ToIso: reverseMapping, nameMapping: nameMapping };
}


// Initialize the visualization
async function init() {
    try {
        // Load the Onesector model
        model = await Onesector.fromJSON('trademat.json');
        console.log("Model loaded:", model);
        console.log("Model countries:", model.countries);

        // Load world map data
        const worldData = await d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json");
        
        // Create country mapping
        countryMapping = createCountryMapping(worldData);
        console.log("Country mapping created:", countryMapping);

        // Create the map
        createMap(worldData);

        // Set up the sliders
        setupSliders();

        // Create color scale
        createColorScale();

        // Create color scale bar
        createColorScaleBar();

        // Initial calculation and visualization
        updateVisualization(0, 0);
    } catch (error) {
        console.error("Initialization error:", error);
    }
}


function createMap(worldData) {
    // Set up the map projection
    const projection = d3.geoMercator().fitSize([800, 500], topojson.feature(worldData, worldData.objects.countries));
    const path = d3.geoPath().projection(projection);

    // Create SVG
    const svg = d3.select("#map")
        .append("svg")
        .attr("width", 800)
        .attr("height", 500);

    // Draw map
    map = svg.append("g")
        .selectAll("path")
        .data(topojson.feature(worldData, worldData.objects.countries).features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "#ccc")
        .attr("stroke", "#fff");

    // Set up color scale
    colorScale = d3.scaleSequential(d3.interpolateRdYlGn)
        .domain([0.95, 1.05]); // Adjust domain based on expected range of GDP changes
}

function setupSliders() {
    const tariffOthersSlider = document.getElementById('tariff-others');
    const tariffChinaSlider = document.getElementById('tariff-china');
    const tariffOthersValue = document.getElementById('tariff-others-value');
    const tariffChinaValue = document.getElementById('tariff-china-value');

    tariffOthersSlider.oninput = function() {
        tariffOthersValue.textContent = this.value + '%';
        updateVisualization(parseFloat(this.value) / 100, parseFloat(tariffChinaSlider.value) / 100);
    }

    tariffChinaSlider.oninput = function() {
        tariffChinaValue.textContent = this.value + '%';
        updateVisualization(parseFloat(tariffOthersSlider.value) / 100, parseFloat(this.value) / 100);
    }
}

function createColorScale() {
    colorScale = d3.scaleSequential(d3.interpolateRdYlGn)
        .domain([0.95, 1.05]); // Adjusted domain from -7% to 3%
}

function createColorScaleBar() {
    const width = 60;
    const height = 300;
    const margin = { top: 10, right: 30, bottom: 10, left: 40 };

    const svg = d3.select("#color-scale-bar")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const defs = svg.append("defs");

    const linearGradient = defs.append("linearGradient")
        .attr("id", "linear-gradient")
        .attr("x1", "0%")
        .attr("y1", "100%")
        .attr("x2", "0%")
        .attr("y2", "0%");

    linearGradient.selectAll("stop")
        .data(colorScale.ticks().map((t, i, n) => ({ offset: `${100*i/n.length}%`, color: colorScale(t) })))
        .enter().append("stop")
        .attr("offset", d => d.offset)
        .attr("stop-color", d => d.color);

    svg.append('g')
        .attr("transform", `translate(${width},0)`)
        .call(d3.axisRight(d3.scaleLinear().domain([-0.05, 0.05]).range([height, 0])).ticks(5).tickFormat(d3.format(".0%")));

    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "url(#linear-gradient)");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("GDP Change");
}

function updateVisualization(tariffOthers, tariffChina) {
    console.log("Updating visualization with tariff rates:", 
                "Others:", tariffOthers, "China:", tariffChina);
    
    const tariffOthersRate = 1 + tariffOthers;
    const tariffChinaRate = 1 + tariffChina;
    
    const trumpTariff = model.getTrumpTariff(tariffOthersRate, tariffChinaRate);
    const result = model.exacthatalgebra(trumpTariff);

    console.log("Calculation result:", result);

    let coloredCountries = 0;
    let totalCountries = 0;
    let unmappedCountries = [];
    let mismatchedCountries = [];

    // Update map colors
    map.attr("fill", (d) => {
        totalCountries++;
        const d3Id = d.id;
        const d3Name = d.properties.name;
        let isoCode = countryMapping.d3ToIso[d3Id];
        if (!isoCode) {
            isoCode = countryMapping.nameToIso[d3Name.toLowerCase()];
        }
        const countryIndex = model.countries.indexOf(isoCode);
        if (countryIndex !== -1) {
            const gdpChange = result[countryIndex];
            const color = colorScale(gdpChange);
            console.log(`Country: ${isoCode} (D3 ID: ${d3Id}, Name: ${d3Name}), GDP Change: ${gdpChange}, Color: ${color}`);
            coloredCountries++;
            return color;
        }
        if (!isoCode) {
            console.log(`Country not found in mapping: ${d3Name} (D3 ID: ${d3Id})`);
            unmappedCountries.push({d3Id, name: d3Name});
        } else {
            console.log(`Country in mapping but not in model: ${isoCode} (D3 ID: ${d3Id}, Name: ${d3Name})`);
            mismatchedCountries.push({isoCode, d3Id, name: d3Name});
        }
        return "#ccc";
    });

    console.log(`Colored countries: ${coloredCountries}/${totalCountries}`);
    console.log("Unmapped countries:", unmappedCountries);
    console.log("Mismatched countries:", mismatchedCountries);
    console.log("Model countries:", model.countries);
    console.log("Visualization update complete");
}

// Initialize the visualization when the page loads
window.onload = init;