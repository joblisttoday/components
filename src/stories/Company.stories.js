import { html } from "lit-html";
import "../components/company.js";

export default {
	title: "DuckDB/Company",
	component: "joblist-company",
	parameters: {
		docs: {
			description: {
				component:
					"Display detailed company information including description, links, jobs, and interactive features like favorites and notes. Used for company profile pages with optional full-featured mode including job boards, social widgets, maps, and editing capabilities.",
			},
		},
	},
	argTypes: {
		"company-id": {
			control: "select",
			options: ["ableton", "stripe", "github", "microsoft", "google", "meta", "example-startup", "non-existent"],
			description: "Company identifier - matches real companies from production data",
			defaultValue: "ableton",
		},
		full: {
			control: "boolean",
			description: "Enable full mode with job board integration, social widgets, maps, editing tools, and favorites",
			defaultValue: false,
		},
		origin: {
			control: "text",
			description: "Base URL for company profile links and navigation",
			defaultValue: "https://joblist.today",
		},
		"parquet-base": {
			control: "text",
			description: "Custom DuckDB parquet data source URL (overrides default workers)",
			defaultValue: "",
		},
		"parquet-mode": {
			control: "select",
			options: ["buffer", "stream"],
			description: "DuckDB loading mode for parquet data",
			defaultValue: "buffer",
		},
	},
};

const Template = (args) => html`
	<joblist-company
		company-id="${args["company-id"]}"
		?full="${args.full}"
		origin="${args.origin}"
		${args["parquet-base"] ? `parquet-base="${args["parquet-base"]}"` : ""}
		${args["parquet-mode"] ? `parquet-mode="${args["parquet-mode"]}"` : ""}
	></joblist-company>
`;

// Basic company card view (as used in listings)
export const CompactCard = Template.bind({});
CompactCard.args = {
	"company-id": "ableton",
	full: false,
};


// Full company profile (as used in /company/{id} pages)
export const FullProfile = Template.bind({});
FullProfile.args = {
	"company-id": "ableton",
	full: true,
};


// Large tech company with extensive data
export const LargeTechCompany = Template.bind({});
LargeTechCompany.args = {
	"company-id": "microsoft",
	full: true,
};


// Startup or smaller company
export const StartupCompany = Template.bind({});
StartupCompany.args = {
	"company-id": "example-startup",
	full: true,
};


// Highlighted company (premium feature)
export const HighlightedCompany = Template.bind({});
HighlightedCompany.args = {
	"company-id": "stripe",
	full: true,
};


// Loading state for slow connections
export const LoadingState = Template.bind({});
LoadingState.args = {
	"company-id": "loading-company-slow-connection",
	full: true,
	"parquet-mode": "stream",
};


// Error handling for non-existent companies
export const NotFound = Template.bind({});
NotFound.args = {
	"company-id": "definitely-does-not-exist-404",
	full: true,
};


// Custom data source example
export const CustomDataSource = Template.bind({});
CustomDataSource.args = {
	"company-id": "ableton",
	full: true,
	"parquet-base": "https://custom-workers.example.com",
	"parquet-mode": "buffer",
};
