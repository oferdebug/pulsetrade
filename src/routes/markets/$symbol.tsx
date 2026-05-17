import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/markets/$symbol")({
	component: MarketSymbolPage,
});

function MarketSymbolPage() {
	const { symbol } = Route.useParams();
	return (
		<main className="page-wrap px-4 py-10">
			<h1>{symbol.toUpperCase()}</h1>
			<p>Stock Details,charts,news,and financial data will go here</p>
		</main>
	);
}
