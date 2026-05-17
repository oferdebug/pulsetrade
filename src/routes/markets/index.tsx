import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/markets/")({
	validateSearch: (search) => ({
		query: String(search.query ?? ""),
		sector: String(search.sector ?? ""),
		sort: String(search.sort ?? ""),
		page: Number(search.page ?? 1),
	}),
	component: MarketsPage,
});

function MarketsPage() {
	const search = Route.useSearch();
	const currentPage = search.page;
	const navigate = Route.useNavigate();
	return (
		<main className="page-wrap px-4 py-10">
			<h1>Markets</h1>
			<pre className="mt-4 rounded-lg border p-4">
				{JSON.stringify(search, null, 2)}
			</pre>
			<p>Market Screener,search,filters, and watchlist actions will go here</p>
			<input
				type="text"
				placeholder="Search Symbol..."
				className="rounded-lg border px-3 py-2"
				onChange={(e) =>
					navigate({
						search: (prev) => ({ ...prev, query: e.target.value, page: 1 }),
					})
				}
			/>
			<button
				type="button"
				onClick={() =>
					navigate({
						search: { query: "AAPL", sector: "Tech", sort: "volume", page: 1 },
					})
				}
			>
				Search for AAPL
			</button>
			<div className={"my-4 flex gap-2"}>
				<button
					type="button"
					onClick={() =>
						navigate({
							search: (prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }),
						})
					}
				>
					Previous
				</button>
				<button
					type="button"
					onClick={() =>
						navigate({ search: (prev) => ({ ...prev, page: prev.page + 1 }) })
					}
				>
					Next
				</button>
				<p>Page {currentPage}</p>
			</div>
		</main>
	);
}
