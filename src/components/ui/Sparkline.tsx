type SparklineProps = {
	data: number[];
	positive?: boolean;
	width?: number;
	height?: number;
};

export default function Sparkline({
	data,
	positive = true,
	width = 64,
	height = 28,
}: SparklineProps) {
	if (!data || data.length < 2) return null;

	const min = Math.min(...data);
	const max = Math.max(...data);
	const range = max - min || 1;

	const pts = data.map((v, i) => {
		const x = (i / (data.length - 1)) * width;
		const y = height - ((v - min) / range) * (height - 4) - 2;
		return `${x},${y}`;
	});

	const polyline = pts.join(' ');
	const lastPt = pts[pts.length - 1].split(',');
	const color = positive ? '#34d399' : '#f87171';
	const fillId = `spark-fill-${positive ? 'pos' : 'neg'}`;

	return (
		<svg
			width={width}
			height={height}
			viewBox={`0 0 ${width} ${height}`}
			fill='none'
			aria-hidden='true'
		>
			<defs>
				<linearGradient id={fillId} x1='0' y1='0' x2='0' y2='1'>
					<stop offset='0%' stopColor={color} stopOpacity='0.25' />
					<stop offset='100%' stopColor={color} stopOpacity='0' />
				</linearGradient>
			</defs>
			<polygon
				points={`0,${height} ${polyline} ${width},${height}`}
				fill={`url(#${fillId})`}
			/>
			<polyline
				points={polyline}
				stroke={color}
				strokeWidth='1.5'
				strokeLinejoin='round'
				strokeLinecap='round'
			/>
			<circle
				cx={Number(lastPt[0])}
				cy={Number(lastPt[1])}
				r='2'
				fill={color}
			/>
		</svg>
	);
}
