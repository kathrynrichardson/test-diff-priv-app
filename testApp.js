const appContainer = document.getElementById('appContainer');
const controlsContainer = document.getElementById('controlsContainer');
const histogramContainer = document.getElementById('histogramContainer');
const elementCountContainer = document.getElementById('elementCountContainer');
const tableContainer = document.getElementById('tableContainer');

let selectedBar = null;

let selectedBarIndex = null;

function labelContainers() {
	const appLabel = document.createElement('p');
	appLabel.classList.add('label');
	appLabel.textContent = "App Container";
	appContainer.appendChild(appLabel);

	/*const histogramLabel = document.createElement('p');
	histogramLabel.classList.add('label');
	histogramLabel.textContent = "Histogram Container";
	histogramContainer.appendChild(histogramLabel);*/

	const tableLabel = document.createElement('p');
	tableLabel.classList.add('label');
	tableLabel.textContent = "Table Container";
	tableContainer.appendChild(tableLabel);

	const controlsLabel = document.createElement('p');
	controlsLabel.classList.add('label');
	controlsLabel.textContent = "Controls Container";
	controlsContainer.appendChild(controlsLabel);

}

function generateRandomBinary() {
	return Math.round(Math.random());
}

document.addEventListener('DOMContentLoaded', function () {
	//labelContainers();

	function getBinaryStringFromTableRow(row, numQuestions) {
    let binaryString = '';

    for (let j = 1; j <= numQuestions; j++) {
      binaryString += row.cells[j].textContent;
    }

    return binaryString;
  }

	function highlightTableRows(clickedIndex, numQuestions, xLabels) {
    const table = document.querySelector('.data-table');
    const rows = table.getElementsByTagName('tr');
    const binaryLabel = xLabels[clickedIndex];

		console.log("binaryLabel", binaryLabel);

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const binaryString = getBinaryStringFromTableRow(row, numQuestions);

        console.log(`Row ${i}: Binary String - ${binaryString}, Binary Label - ${binaryLabel}`);

        if (binaryString === binaryLabel) {
            row.classList.add('highlighted-row');
        }
    }
	}

	function removeHighlightFromTableRows() {
		const table = document.querySelector('.data-table');
		const rows = table.getElementsByTagName('tr');

		for (let i = 1; i < rows.length; i++) {
				const row = rows[i];
				row.classList.remove('highlighted-row');
		}
	}

	function generateHistogram(data, container, numQuestions) {
		const margin = { top: 20, right: 30, bottom: 30, left: 30 },
			width = 400 - margin.left - margin.right,
			height = 300 - margin.top - margin.bottom;
	
		const xLabels = Array.from({ length: 2 ** numQuestions }, (_, i) =>
			i.toString(2).padStart(numQuestions, '0')
		);
	
		const x = d3.scaleBand()
			.domain(xLabels)
			.range([0, width])
			.padding(0.1);
	
		const y = d3.scaleLinear()
			.domain([0, d3.max(data)])
			.nice()
			.range([height, 0]);
	
		const svg = d3.select(container).html('').append('svg')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
			.append('g')
			.attr('transform', `translate(${margin.left},${margin.top})`);
	
		const barsArray = [];
	
		svg.append('g')
			.attr('class', 'axis axis--x')
			.attr('transform', `translate(0,${height})`)
			.call(d3.axisBottom(x));
	
		svg.append('g')
			.attr('class', 'axis axis--y')
			.call(d3.axisLeft(y));
	
		const bars = svg.selectAll('.bar')
			.data(data)
			.enter().append('rect')
			.attr('class', 'bar')
			.attr('x', (d, i) => x(xLabels[i]))
			.attr('y', d => y(d))
			.attr('width', x.bandwidth())
			.attr('height', d => height - y(d))
			.attr('fill', 'steelblue')
			.on('click', function () {
				const clickedIndex = barsArray.indexOf(this);
		
				if (selectedBarIndex !== null) {
						d3.select(barsArray[selectedBarIndex]).attr('fill', 'steelblue');
						removeHighlightFromTableRows();
				}
		
				if (selectedBarIndex === clickedIndex) {
						selectedBarIndex = null;
				} else {
						d3.select(this).attr('fill', 'orange');
						selectedBarIndex = clickedIndex;
		
						highlightTableRows(selectedBarIndex, numQuestions, xLabels);
		
						const binaryLabel = xLabels[selectedBarIndex];
						const elementNumber = d3.select(this).data()[0];
						elementCountContainer.textContent = `Number of "${binaryLabel}" Elements: ${elementNumber}`;
				}
		});
		
		bars.each(function () {
			barsArray.push(this);
		});
	}

	function countRowsDistribution(table, numQuestions) {
    const rows = table.getElementsByTagName('tr');
    const distribution = Array.from({ length: 2 ** numQuestions }, () => 0);

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      let binaryString = '';

      for (let j = 1; j <= numQuestions; j++) {
        binaryString += row.cells[j].textContent;
      }

      const index = parseInt(binaryString, 2);
      distribution[index]++;
    }

    return distribution;
  }

	function updateHistogram() {
    const table = document.querySelector('.data-table');
    const numQuestions = parseInt(questionDropdown.value, 10);

    const data = countRowsDistribution(table, numQuestions);

    generateHistogram(data, histogramContainer, numQuestions);
  }

	function generateRandomTable() {
		const numQuestions = parseInt(questionDropdown.value, 10);
		const numParticipants = parseInt(participantDropdown.value, 10);
	
		const table = document.createElement('table');
		table.classList.add('data-table');
	
		const headerRow = table.insertRow();
		const headers = ['ID', ...Array.from({ length: numQuestions }, (_, index) => `Q${index + 1}`)];
		headers.forEach((headerText) => {
			const th = document.createElement('th');
			th.textContent = headerText;
			headerRow.appendChild(th);
		});
	
		for (let i = 1; i <= numParticipants; i++) {
			const row = table.insertRow();
			const cell1 = row.insertCell(0);
			cell1.textContent = `7748${i.toString().padStart(3, '0')}`;
	
			for (let j = 1; j <= numQuestions; j++) {
				const cell = row.insertCell(j);
				cell.textContent = generateRandomBinary();
			}
		}
	
		tableContainer.innerHTML = '';
		tableContainer.appendChild(table);
	
		updateHistogram();
	}

	function createControls() {
		const questionDropdown = document.createElement('select');
		questionDropdown.id = 'questionDropdown';
		questionDropdown.addEventListener('change', generateRandomTable);
	
		for (let i = 2; i <= 12; i++) {
			const option = document.createElement('option');
			option.value = i;
			option.textContent = i;
			questionDropdown.appendChild(option);
		}
	
		questionDropdown.value = '4';
	
		const questionLabel = document.createElement('label');
		questionLabel.setAttribute('for', 'questionDropdown');
		questionLabel.textContent = 'Number of Survey Questions:';
	
		const participantDropdown = document.createElement('select');
		participantDropdown.id = 'participantDropdown';
		participantDropdown.addEventListener('change', generateRandomTable);
	
		const participantOptions = [100, 1000, 10000, 100000];
		participantOptions.forEach(optionValue => {
			const option = document.createElement('option');
			option.value = optionValue;
			option.textContent = optionValue;
			participantDropdown.appendChild(option);
		});
	
		participantDropdown.value = '100';
	
		const participantLabel = document.createElement('label');
		participantLabel.setAttribute('for', 'participantDropdown');
		participantLabel.textContent = 'Number of Survey Participants:';

		const resetButton = document.createElement('button');
		resetButton.id = 'resetButton';
		resetButton.addEventListener('click', generateRandomTable);
		resetButton.textContent = 'Reset';

		controlsContainer.appendChild(questionLabel);
		controlsContainer.appendChild(questionDropdown);
		controlsContainer.appendChild(participantLabel);
		controlsContainer.appendChild(participantDropdown);
		controlsContainer.appendChild(resetButton);
	}

	createControls();		//before generateRandomTable
	generateRandomTable();
});
