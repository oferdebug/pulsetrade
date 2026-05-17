import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/watchlist/")({
	component: WatchListPage,
});

function WatchListPage() {
	return (
		<main className="page-wrap px-4 py-10">
			<h1>Watchlist</h1>
			<p>
				Watchlist management, adding/removing stocks, and alerts will go here
			</p>
		</main>
	);
}

export default WatchListPage;
