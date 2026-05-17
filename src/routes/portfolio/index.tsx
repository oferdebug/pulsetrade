import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/portfolio/")({
	component: PortfolioPage,
});

function PortfolioPage() {
	return (
		<main className="page-wrap px-4 py-10">
			<h1>Portfolio</h1>
			<p>Portfolio simulation and holdings will live here.</p>
		</main>
	);
}

export default PortfolioPage;
