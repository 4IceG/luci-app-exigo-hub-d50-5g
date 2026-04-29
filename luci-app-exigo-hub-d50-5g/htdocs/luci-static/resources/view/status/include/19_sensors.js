'use strict';
'require baseclass';
'require fs';

document.head.append(E('style', {'type': 'text/css'},
`
.sensors-area {
	margin-bottom: 1em;
}
.sensors-label {
	display: inline-block;
	word-wrap: break-word;
	padding: 4px 8px;
	width: 12em;
}
.sensors-label-title {
	display: block;
	word-wrap: break-word;
	width: 100%;
	font-weight: bold;
}
.sensors-label-value {
	display: block;
	word-wrap: break-word;
	width: 100%;
}
.sensors-empty-area {
	width: 100%;
	text-align: center;
}

`))

return baseclass.extend({
	title      : _('Sensors'),

	tempFormat(temp) {
		if(!temp && temp !== 0) {
			return '-';
		};
		return Number(temp.toFixed(1)) + ' °C';
	},

	load() {
		return L.resolveDefault(
			fs.exec('/usr/share/xunison/sensors.sh').then(res => {
				if(res.code === 0) {
					try {
						return JSON.parse(res.stdout);
					} catch(e) {
						return null;
					}
				}
				return null;
			}),
			null
		);
	},

	sensorLabels: {
		'CPU':                 'CPU',
		'Mainboard':           'Mainboard',
		'Network Coprocessor': 'Network Coprocessor',
		'Ethernet':            'Ethernet',
		'Wi-Fi 2.4GHz':         'Wi-Fi 2.4GHz',
		'Wi-Fi 5GHz':           'Wi-Fi 5GHz',
	},

	sensorOrder: [
		'CPU',
		'Mainboard',
		'Ethernet',
		'Network Coprocessor',
		'Wi-Fi 2.4GHz',
		'Wi-Fi 5GHz',
	],

	getSensorLabel(sensor) {
		const key = sensor.description || sensor.name;
		return key in this.sensorLabels ? _(this.sensorLabels[key]) : key;
	},

	render(data) {
		if(!data) {
			return;
		};

		let sensorsArea = E('div', { 'class': 'sensors-area' });

		if(data.temperatures && Array.isArray(data.temperatures)) {
			let sortedSensors = [...data.temperatures].sort((a, b) => {
				const keyA = a.description || a.name;
				const keyB = b.description || b.name;
				const indexA = this.sensorOrder.indexOf(keyA);
				const indexB = this.sensorOrder.indexOf(keyB);
				
				if(indexA === -1 && indexB === -1) return 0;
				if(indexA === -1) return 1;
				if(indexB === -1) return -1;
				
				return indexA - indexB;
			});

			for(let sensor of sortedSensors) {
				if(sensor.temperature_c !== undefined) {
					sensorsArea.append(
						E('div', { 'class': 'sensors-label' }, [
							E('span', { 'class': 'sensors-label-title' },
								this.getSensorLabel(sensor)
							),
							E('span', { 'class': 'sensors-label-value' },
								this.tempFormat(sensor.temperature_c)
							),
						])
					);
				};
			};
		};

		if(sensorsArea.childNodes.length == 0){
			sensorsArea.append(
				E('div', { 'class': 'sensors-empty-area' },
					E('em', {}, _('No data...'))
				)
			);
		};

		return sensorsArea;
	},
});
